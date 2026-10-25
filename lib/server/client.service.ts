import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { ClientRow, ClientListResult, ClientDetail, ClientStatus } from "@/lib/types/client";
import type { Prisma, AccountStatus, ColisStatut } from "@prisma/client";

export const PER_PAGE = 20;
const dt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

// Colis still in flight (everything but the terminal states).
const EN_COURS: ColisStatut[] = [
  "CREE", "DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE", "RAMASSE",
  "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION", "RECU_PAR_AGENCE_DEST",
  "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "REPORTE", "PAS_DE_REPONSE",
];

export class ClientError extends Error {}

export type ClientFilters = { ville?: string; status?: string; search?: string };

export async function listClients(
  filters: ClientFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<ClientListResult> {
  const where: Prisma.ClientWhereInput = {};
  if (filters.status) where.account = { is: { status: filters.status as AccountStatus } };
  if (filters.ville) where.ville = { is: { nom: filters.ville } };
  if (filters.search) {
    where.OR = [
      { nom: { contains: filters.search } },
      { telephone: { contains: filters.search } },
      { account: { is: { email: { contains: filters.search } } } },
    ];
  }

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      include: {
        ville: { select: { nom: true } },
        account: { select: { email: true, status: true } },
        _count: { select: { colis: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: ClientRow[] = rows.map((c) => ({
    id: c.id,
    nom: c.nom,
    telephone: c.telephone,
    ville: c.ville.nom,
    colisTotal: c._count.colis,
    status: c.account.status as ClientStatus,
    email: c.account.email ?? "—",
    createdAt: dt.format(c.createdAt),
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getClient(id: string): Promise<ClientDetail | null> {
  const c = await prisma.client.findUnique({
    where: { id },
    include: {
      ville: { select: { nom: true } },
      account: { select: { email: true, status: true } },
      _count: { select: { colis: true, facturesClient: true } },
    },
  });
  if (!c) return null;

  const colisEnCours = await prisma.colis.count({ where: { clientId: id, statut: { in: EN_COURS } } });

  return {
    id: c.id,
    nom: c.nom,
    telephone: c.telephone,
    cni: c.cni,
    banque: c.banque,
    rib: c.rib,
    cniRectoFile: c.cniRectoFile,
    cniVersoFile: c.cniVersoFile,
    ribFile: c.ribFile,
    ville: c.ville.nom,
    adresse: c.adresse,
    email: c.account.email ?? "—",
    status: c.account.status as ClientStatus,
    createdAt: dt.format(c.createdAt),
    colisTotal: c._count.colis,
    colisEnCours,
    factures: c._count.facturesClient,
  };
}

export type ClientData = {
  nom: string;
  telephone: string;
  cni: string;
  banque?: string | null;
  rib?: string | null;
  cniRectoFile?: string | null;
  cniVersoFile?: string | null;
  ribFile?: string | null;
  ville: string;
  adresse?: string | null;
  status: ClientStatus;
  email: string;
  password?: string;
};

async function villeId(nom: string) {
  return (await prisma.ville.upsert({ where: { nom }, update: {}, create: { nom } })).id;
}

export async function createClient(data: ClientData): Promise<{ id: string }> {
  const taken = await prisma.account.findUnique({ where: { email: data.email }, select: { id: true } });
  if (taken) throw new ClientError("Un compte existe déjà avec cet email.");
  if (!data.password) throw new ClientError("Mot de passe requis.");

  const account = await prisma.account.create({
    data: {
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: "CLIENT",
      status: data.status,
      client: {
        create: {
          nom: data.nom,
          telephone: data.telephone,
          cni: data.cni,
          banque: data.banque ?? null,
          rib: data.rib ?? null,
          cniRectoFile: data.cniRectoFile ?? null,
          cniVersoFile: data.cniVersoFile ?? null,
          ribFile: data.ribFile ?? null,
          villeId: await villeId(data.ville),
          adresse: data.adresse ?? null,
        },
      },
    },
    include: { client: { select: { id: true } } },
  });
  return { id: account.client!.id };
}

export async function updateClient(id: string, data: ClientData): Promise<void> {
  const client = await prisma.client.findUnique({ where: { id }, select: { accountId: true } });
  if (!client) throw new ClientError("Client introuvable.");

  const emailOwner = await prisma.account.findUnique({ where: { email: data.email }, select: { id: true } });
  if (emailOwner && emailOwner.id !== client.accountId) {
    throw new ClientError("Cet email est déjà utilisé par un autre compte.");
  }

  await prisma.client.update({
    where: { id },
    data: {
      nom: data.nom,
      telephone: data.telephone,
      cni: data.cni,
      banque: data.banque ?? null,
      rib: data.rib ?? null,
      cniRectoFile: data.cniRectoFile ?? null,
      cniVersoFile: data.cniVersoFile ?? null,
      ribFile: data.ribFile ?? null,
      villeId: await villeId(data.ville),
      adresse: data.adresse ?? null,
    },
  });

  const accData: Prisma.AccountUpdateInput = { email: data.email, status: data.status };
  if (data.password) accData.passwordHash = await hashPassword(data.password);
  await prisma.account.update({ where: { id: client.accountId }, data: accData });
}

export async function setClientStatus(id: string, status: ClientStatus): Promise<void> {
  const c = await prisma.client.findUnique({ where: { id }, select: { accountId: true } });
  if (!c) throw new ClientError("Client introuvable.");
  await prisma.account.update({ where: { id: c.accountId }, data: { status } });
}
