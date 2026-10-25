import { prisma } from "@/lib/db";
import { type ExpeditionStatut, type Prisma } from "@prisma/client";
import type {
  AvailableExpColis, ExpeditionRow, ExpeditionDetail, ExpeditionDirection,
} from "@/lib/types/expedition";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class ExpeditionError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

/** Colis received at this agence's entrepôt, ready to be shipped to a destination agence. */
export async function listAvailableForExpedition(agenceId: string): Promise<AvailableExpColis[]> {
  const rows = await prisma.colis.findMany({
    where: {
      agenceRamassageId: agenceId,
      statut: "RECU_ENTREPOT_SOURCE",
      expeditionLignes: { none: {} },
    },
    include: { client: { select: { nom: true } }, destinationVille: { select: { id: true, nom: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((c) => ({
    id: c.id,
    trk: c.trackingNumber,
    client: c.client.nom,
    recipient: c.recipientName,
    destCity: c.destinationVille.nom,
    destVilleId: c.destinationVille.id,
    cod: Number(c.amountToCollect),
  }));
}

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;
  const last = await prisma.expedition.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNum = last?.reference ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createExpedition(
  agenceSourceId: string,
  agenceDestId: string,
  colisIds: string[],
  actorAccountId: string,
): Promise<{ id: string }> {
  if (agenceSourceId === agenceDestId) throw new ExpeditionError("Agence de destination invalide.", 400);
  const dest = await prisma.agence.findUnique({ where: { id: agenceDestId }, select: { villeId: true } });
  if (!dest) throw new ExpeditionError("Agence de destination introuvable.", 400);

  const colis = await prisma.colis.findMany({
    where: {
      id: { in: colisIds },
      agenceRamassageId: agenceSourceId,
      statut: "RECU_ENTREPOT_SOURCE",
      destinationVilleId: dest.villeId,
      expeditionLignes: { none: {} },
    },
    select: { id: true },
  });
  if (colis.length !== colisIds.length || colis.length === 0) {
    throw new ExpeditionError("Certains colis ne peuvent pas être expédiés vers cette agence.");
  }

  const exp = await prisma.expedition.create({
    data: {
      reference: await nextReference(),
      agenceSource: { connect: { id: agenceSourceId } },
      agenceDest: { connect: { id: agenceDestId } },
      statut: "NOUVEAU",
      sentAt: new Date(),
    },
    select: { id: true },
  });
  await prisma.expeditionLigne.createMany({
    data: colis.map((c) => ({ expeditionId: exp.id, colisId: c.id, statut: "EN_ATTENTE" as const })),
  });
  await prisma.colis.updateMany({
    where: { id: { in: colisIds } },
    data: { statut: "EN_EXPEDITION", agenceLivraisonId: agenceDestId },
  });
  await prisma.colisEvent.createMany({
    data: colisIds.map((colisId) => ({ colisId, statut: "EN_EXPEDITION" as const, label: "En expédition inter-agences", createdByAccountId: actorAccountId })),
  });
  return exp;
}

export async function listExpeditions(
  agenceId: string,
  direction: ExpeditionDirection,
  filters: { statut?: string; search?: string },
  page = 1,
  perPage = PER_PAGE,
): Promise<{ rows: ExpeditionRow[]; total: number; page: number; perPage: number; totalPages: number }> {
  const where: Prisma.ExpeditionWhereInput = direction === "envoi" ? { agenceSourceId: agenceId } : { agenceDestId: agenceId };
  if (filters.statut) where.statut = filters.statut as ExpeditionStatut;
  if (filters.search) where.reference = { contains: filters.search };

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.expedition.count({ where }),
    prisma.expedition.findMany({
      where,
      include: {
        agenceSource: { select: { nom: true } },
        agenceDest: { select: { nom: true } },
        lignes: { select: { statut: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: ExpeditionRow[] = rows.map((e) => ({
    id: e.id,
    reference: e.reference ?? e.id.slice(0, 8).toUpperCase(),
    agenceSource: e.agenceSource.nom,
    agenceDest: e.agenceDest.nom,
    colisCount: e.lignes.length,
    recus: e.lignes.filter((l) => l.statut === "CONFIRME").length,
    statut: e.statut,
    date: dtDay.format(e.createdAt),
  }));
  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Admin: all expeditions, any agence. */
export async function listAllExpeditions(
  filters: { statut?: string; search?: string },
  page = 1,
  perPage = PER_PAGE,
): Promise<{ rows: ExpeditionRow[]; total: number; page: number; perPage: number; totalPages: number }> {
  const where: Prisma.ExpeditionWhereInput = {};
  if (filters.statut) where.statut = filters.statut as ExpeditionStatut;
  if (filters.search) where.reference = { contains: filters.search };

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.expedition.count({ where }),
    prisma.expedition.findMany({
      where,
      include: { agenceSource: { select: { nom: true } }, agenceDest: { select: { nom: true } }, lignes: { select: { statut: true } } },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);
  const mapped: ExpeditionRow[] = rows.map((e) => ({
    id: e.id,
    reference: e.reference ?? e.id.slice(0, 8).toUpperCase(),
    agenceSource: e.agenceSource.nom,
    agenceDest: e.agenceDest.nom,
    colisCount: e.lignes.length,
    recus: e.lignes.filter((l) => l.statut === "CONFIRME").length,
    statut: e.statut,
    date: dtDay.format(e.createdAt),
  }));
  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getExpeditionDetail(id: string): Promise<ExpeditionDetail | null> {
  const e = await prisma.expedition.findUnique({
    where: { id },
    include: {
      agenceSource: { select: { nom: true, ville: { select: { nom: true } } } },
      agenceDest: { select: { nom: true, ville: { select: { nom: true } } } },
      lignes: {
        include: { colis: { include: { destinationVille: { select: { nom: true } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!e) return null;
  const lignes = e.lignes.map((l) => ({
    colisId: l.colisId,
    trk: l.colis.trackingNumber,
    recipient: l.colis.recipientName,
    destCity: l.colis.destinationVille.nom,
    received: l.statut === "CONFIRME" || l.colis.statut === "RECU_PAR_AGENCE_DEST",
  }));
  return {
    id: e.id,
    reference: e.reference ?? e.id.slice(0, 8).toUpperCase(),
    agenceSourceId: e.agenceSourceId,
    agenceDestId: e.agenceDestId,
    agenceSource: e.agenceSource.nom,
    agenceSourceVille: e.agenceSource.ville.nom,
    agenceDest: e.agenceDest.nom,
    agenceDestVille: e.agenceDest.ville.nom,
    statut: e.statut,
    date: dtDay.format(e.createdAt),
    sentAt: e.sentAt ? dtDay.format(e.sentAt) : null,
    receivedAt: e.receivedAt ? dtDay.format(e.receivedAt) : null,
    notes: e.notes,
    total: lignes.length,
    recus: lignes.filter((l) => l.received).length,
    lignes,
  };
}

/** Destination agence scans a colis to confirm reception. */
export async function scanExpeditionReception(
  agenceDestId: string,
  expeditionId: string,
  code: string,
  actorAccountId: string,
): Promise<{ trk: string }> {
  const exp = await prisma.expedition.findFirst({ where: { id: expeditionId, agenceDestId }, select: { id: true } });
  if (!exp) throw new ExpeditionError("Expédition introuvable.", 404);

  const ligne = await prisma.expeditionLigne.findFirst({
    where: { expeditionId, colis: { OR: [{ trackingNumber: code }, { qrToken: code }] } },
    include: { colis: { select: { id: true, trackingNumber: true, statut: true } } },
  });
  if (!ligne) throw new ExpeditionError("Ce colis ne fait pas partie de cette expédition.", 404);

  if (ligne.statut !== "CONFIRME" && ligne.colis.statut !== "RECU_PAR_AGENCE_DEST") {
    await prisma.expeditionLigne.update({ where: { id: ligne.id }, data: { statut: "CONFIRME", receivedAt: new Date() } });
    await prisma.colis.update({ where: { id: ligne.colis.id }, data: { statut: "RECU_PAR_AGENCE_DEST" } });
    await prisma.colisEvent.create({
      data: { colisId: ligne.colis.id, statut: "RECU_PAR_AGENCE_DEST", label: "Reçu par l'agence de destination", createdByAccountId: actorAccountId },
    });
    const remaining = await prisma.expeditionLigne.count({ where: { expeditionId, statut: { not: "CONFIRME" } } });
    if (remaining === 0) {
      await prisma.expedition.update({ where: { id: expeditionId }, data: { statut: "RECEPTIONNE", receivedAt: new Date() } });
    } else {
      await prisma.expedition.updateMany({ where: { id: expeditionId, statut: "NOUVEAU" }, data: { statut: "EN_TRANSIT" } });
    }
  }
  return { trk: ligne.colis.trackingNumber };
}

export async function scanExpeditionReceptionGlobal(agenceDestId: string, code: string, actorAccountId: string): Promise<{ trk: string; reference: string }> {
  const ligne = await prisma.expeditionLigne.findFirst({
    where: { expedition: { agenceDestId }, colis: { OR: [{ trackingNumber: code }, { qrToken: code }] } },
    include: { expedition: { select: { id: true, reference: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (!ligne) throw new ExpeditionError("Aucune expédition vers votre agence ne contient ce colis.", 404);
  const res = await scanExpeditionReception(agenceDestId, ligne.expeditionId, code, actorAccountId);
  return { trk: res.trk, reference: ligne.expedition.reference ?? ligne.expeditionId.slice(0, 8).toUpperCase() };
}
