import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { LivreurRow, LivreurListResult, LivreurDetail, LivreurStatus, LivreurVehicle } from "@/lib/types/livreur";
import type { Prisma, AccountStatus } from "@prisma/client";

export const PER_PAGE = 20;
const dt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class LivreurError extends Error {}

export type LivreurFilters = { agenceId?: string; ville?: string; status?: string; search?: string };

export async function listLivreurs(
  filters: LivreurFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<LivreurListResult> {
  const where: Prisma.LivreurWhereInput = {};
  if (filters.status) where.statusAccount = filters.status as AccountStatus;
  if (filters.agenceId) where.agenceId = filters.agenceId;
  if (filters.ville) where.ville = { nom: filters.ville };
  if (filters.search) {
    where.OR = [
      { nom: { contains: filters.search } },
      { prenom: { contains: filters.search } },
      { cni: { contains: filters.search } },
      { telephone: { contains: filters.search } },
      { account: { is: { email: { contains: filters.search } } } },
    ];
  }

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.livreur.count({ where }),
    prisma.livreur.findMany({
      where,
      include: {
        ville: { select: { nom: true } },
        agence: { select: { nom: true } },
        account: { select: { email: true } },
        _count: { select: { colisLivraison: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: LivreurRow[] = rows.map((l) => ({
    id: l.id,
    nom: l.nom,
    prenom: l.prenom,
    telephone: l.telephone,
    ville: l.ville.nom,
    agence: l.agence.nom,
    vehicleType: l.vehicleType as LivreurVehicle,
    livraisons: l._count.colisLivraison,
    status: l.statusAccount as LivreurStatus,
    email: l.account.email ?? "—",
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getLivreur(id: string): Promise<LivreurDetail | null> {
  const l = await prisma.livreur.findUnique({
    where: { id },
    include: {
      ville: { select: { nom: true } },
      agence: { select: { nom: true } },
      account: { select: { email: true } },
      _count: { select: { colisLivraison: true, colisRamassage: true } },
    },
  });
  if (!l) return null;
  return {
    id: l.id,
    nom: l.nom,
    prenom: l.prenom,
    cni: l.cni,
    telephone: l.telephone,
    vehicleType: l.vehicleType as LivreurVehicle,
    matricule: l.matricule,
    ice: l.ice,
    banque: l.banque,
    rib: l.rib,
    cniRectoFile: l.cniRectoFile,
    cniVersoFile: l.cniVersoFile,
    ribFile: l.ribFile,
    ville: l.ville.nom,
    adresse: l.adresse,
    email: l.account.email ?? "—",
    agenceId: l.agenceId,
    agence: l.agence.nom,
    status: l.statusAccount as LivreurStatus,
    createdAt: dt.format(l.createdAt),
    livraisons: l._count.colisLivraison,
    ramassages: l._count.colisRamassage,
  };
}

export type LivreurData = {
  nom: string;
  prenom: string;
  cni: string;
  telephone: string;
  vehicleType: LivreurVehicle;
  matricule?: string | null;
  ice?: string | null;
  banque?: string | null;
  rib?: string | null;
  cniRectoFile?: string | null;
  cniVersoFile?: string | null;
  ribFile?: string | null;
  ville: string;
  adresse?: string | null;
  status: LivreurStatus;
  agenceId: string;
  email: string;
  password?: string;
};

async function villeId(nom: string) {
  return (await prisma.ville.upsert({ where: { nom }, update: {}, create: { nom } })).id;
}

export async function createLivreur(data: LivreurData): Promise<{ id: string }> {
  const taken = await prisma.account.findUnique({ where: { email: data.email }, select: { id: true } });
  if (taken) throw new LivreurError("Un compte existe déjà avec cet email.");
  if (!data.password) throw new LivreurError("Mot de passe requis.");

  const account = await prisma.account.create({
    data: {
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: "LIVREUR",
      status: data.status,
      livreur: {
        create: {
          agenceId: data.agenceId,
          nom: data.nom,
          prenom: data.prenom,
          cni: data.cni,
          telephone: data.telephone,
          vehicleType: data.vehicleType,
          matricule: data.matricule ?? null,
          ice: data.ice ?? null,
          banque: data.banque ?? null,
          rib: data.rib ?? null,
          cniRectoFile: data.cniRectoFile ?? null,
          cniVersoFile: data.cniVersoFile ?? null,
          ribFile: data.ribFile ?? null,
          villeId: await villeId(data.ville),
          adresse: data.adresse ?? null,
          statusAccount: data.status,
        },
      },
    },
    include: { livreur: { select: { id: true } } },
  });
  return { id: account.livreur!.id };
}

export async function updateLivreur(id: string, data: LivreurData): Promise<void> {
  const livreur = await prisma.livreur.findUnique({ where: { id }, select: { accountId: true } });
  if (!livreur) throw new LivreurError("Livreur introuvable.");

  const emailOwner = await prisma.account.findUnique({ where: { email: data.email }, select: { id: true } });
  if (emailOwner && emailOwner.id !== livreur.accountId) {
    throw new LivreurError("Cet email est déjà utilisé par un autre compte.");
  }

  await prisma.livreur.update({
    where: { id },
    data: {
      agenceId: data.agenceId,
      nom: data.nom,
      prenom: data.prenom,
      cni: data.cni,
      telephone: data.telephone,
      vehicleType: data.vehicleType,
      matricule: data.matricule ?? null,
      ice: data.ice ?? null,
      banque: data.banque ?? null,
      rib: data.rib ?? null,
      cniRectoFile: data.cniRectoFile ?? null,
      cniVersoFile: data.cniVersoFile ?? null,
      ribFile: data.ribFile ?? null,
      villeId: await villeId(data.ville),
      adresse: data.adresse ?? null,
      statusAccount: data.status,
    },
  });

  const accData: Prisma.AccountUpdateInput = { email: data.email, status: data.status };
  if (data.password) accData.passwordHash = await hashPassword(data.password);
  await prisma.account.update({ where: { id: livreur.accountId }, data: accData });
}

export async function setLivreurStatus(id: string, status: LivreurStatus): Promise<void> {
  const l = await prisma.livreur.update({ where: { id }, data: { statusAccount: status }, select: { accountId: true } });
  await prisma.account.update({ where: { id: l.accountId }, data: { status } });
}
