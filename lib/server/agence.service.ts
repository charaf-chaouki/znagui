import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { AgenceRow, AgenceListResult, AgenceDetail, AgenceStatus } from "@/lib/types/agence";
import type { Prisma, AccountStatus } from "@prisma/client";

export const PER_PAGE = 20;

const dt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class AgenceError extends Error {}

export type AgenceFilters = { ville?: string; status?: string; search?: string };

export async function listAgences(
  filters: AgenceFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<AgenceListResult> {
  const where: Prisma.AgenceWhereInput = {};
  if (filters.status) where.status = filters.status as AccountStatus;
  if (filters.ville) where.ville = { nom: filters.ville };
  if (filters.search) {
    where.OR = [
      { nom: { contains: filters.search } },
      { responsable: { contains: filters.search } },
      { account: { is: { email: { contains: filters.search } } } },
    ];
  }

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.agence.count({ where }),
    prisma.agence.findMany({
      where,
      include: {
        ville: { select: { nom: true } },
        account: { select: { email: true } },
        _count: { select: { livreurs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: AgenceRow[] = rows.map((a) => ({
    id: a.id,
    nom: a.nom,
    responsable: a.responsable,
    ville: a.ville.nom,
    telephone: a.telephone ?? "—",
    email: a.account.email ?? "—",
    livreurs: a._count.livreurs,
    status: a.status as AgenceStatus,
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getAgence(id: string): Promise<AgenceDetail | null> {
  const a = await prisma.agence.findUnique({
    where: { id },
    include: {
      ville: { select: { nom: true } },
      account: { select: { email: true } },
      livreurs: {
        select: { id: true, nom: true, prenom: true, telephone: true, statusAccount: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { livreurs: true } },
    },
  });
  if (!a) return null;

  const colisCount = await prisma.colis.count({
    where: { OR: [{ agenceRamassageId: id }, { agenceLivraisonId: id }] },
  });

  return {
    id: a.id,
    nom: a.nom,
    responsable: a.responsable,
    ville: a.ville.nom,
    adresse: a.adresse,
    telephone: a.telephone,
    email: a.account.email ?? "—",
    notes: a.notes,
    locationMap: a.locationMap,
    status: a.status as AgenceStatus,
    createdAt: dt.format(a.createdAt),
    livreursCount: a._count.livreurs,
    colisCount,
    livreurs: a.livreurs.map((l) => ({
      id: l.id,
      nom: l.nom,
      prenom: l.prenom,
      telephone: l.telephone,
      status: l.statusAccount,
    })),
  };
}

export type AgenceData = {
  nom: string;
  responsable: string;
  ville: string;
  adresse?: string | null;
  telephone?: string | null;
  notes?: string | null;
  locationMap?: string | null;
  status: AgenceStatus;
  email: string;
  password?: string;
};

async function villeId(nom: string) {
  return (await prisma.ville.upsert({ where: { nom }, update: {}, create: { nom } })).id;
}

export async function createAgence(data: AgenceData): Promise<{ id: string }> {
  const taken = await prisma.account.findUnique({ where: { email: data.email }, select: { id: true } });
  if (taken) throw new AgenceError("Un compte existe déjà avec cet email.");
  if (!data.password) throw new AgenceError("Mot de passe requis.");

  const account = await prisma.account.create({
    data: {
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: "AGENCE",
      status: data.status,
      agence: {
        create: {
          nom: data.nom,
          responsable: data.responsable,
          villeId: await villeId(data.ville),
          adresse: data.adresse ?? null,
          telephone: data.telephone ?? null,
          notes: data.notes ?? null,
          locationMap: data.locationMap ?? null,
          status: data.status,
        },
      },
    },
    include: { agence: { select: { id: true } } },
  });
  return { id: account.agence!.id };
}

export async function updateAgence(id: string, data: AgenceData): Promise<void> {
  const agence = await prisma.agence.findUnique({ where: { id }, select: { accountId: true } });
  if (!agence) throw new AgenceError("Agence introuvable.");

  const emailOwner = await prisma.account.findUnique({ where: { email: data.email }, select: { id: true } });
  if (emailOwner && emailOwner.id !== agence.accountId) {
    throw new AgenceError("Cet email est déjà utilisé par un autre compte.");
  }

  await prisma.agence.update({
    where: { id },
    data: {
      nom: data.nom,
      responsable: data.responsable,
      villeId: await villeId(data.ville),
      adresse: data.adresse ?? null,
      telephone: data.telephone ?? null,
      notes: data.notes ?? null,
      locationMap: data.locationMap ?? null,
      status: data.status,
    },
  });

  const accData: Prisma.AccountUpdateInput = { email: data.email, status: data.status };
  if (data.password) accData.passwordHash = await hashPassword(data.password);
  await prisma.account.update({ where: { id: agence.accountId }, data: accData });
}

export async function setAgenceStatus(id: string, status: AgenceStatus): Promise<void> {
  const a = await prisma.agence.update({ where: { id }, data: { status }, select: { accountId: true } });
  await prisma.account.update({ where: { id: a.accountId }, data: { status } });
}
