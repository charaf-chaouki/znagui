import { prisma } from "@/lib/db";
import { type ExpeditionLivreurStatut, type ColisStatut, type Prisma } from "@prisma/client";
import type {
  AvailableDispatchColis, ExpeditionLivreurRow, ExpeditionLivreurDetail, DispatchColisState,
} from "@/lib/types/expedition-livreur";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class ExpeditionLivreurError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

const ECHEC: ColisStatut[] = ["REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE"];

function colisState(statut: ColisStatut): DispatchColisState {
  if (statut === "LIVRE") return "LIVRE";
  if (ECHEC.includes(statut)) return "ECHEC";
  if (statut === "EN_COURS_DE_LIVRAISON") return "EN_LIVRAISON";
  return "DISPATCHE";
}

/** Colis received at this agence (dest) and ready to be dispatched to a delivery livreur. */
export async function listAvailableForDispatch(agenceId: string): Promise<AvailableDispatchColis[]> {
  const rows = await prisma.colis.findMany({
    where: {
      agenceLivraisonId: agenceId,
      statut: "RECU_PAR_AGENCE_DEST",
      expeditionLivreurLignes: { none: {} },
    },
    include: { destinationVille: { select: { nom: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((c) => ({
    id: c.id,
    trk: c.trackingNumber,
    recipient: c.recipientName,
    destCity: c.destinationVille.nom,
    destAddress: c.destinationAddress,
    cod: Number(c.amountToCollect),
  }));
}

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DSP-${year}-`;
  const last = await prisma.expeditionLivreur.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNum = last?.reference ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createExpeditionLivreur(
  agenceId: string,
  livreurId: string,
  colisIds: string[],
  actorAccountId: string,
): Promise<{ id: string }> {
  const liv = await prisma.livreur.findFirst({ where: { id: livreurId, agenceId }, select: { id: true } });
  if (!liv) throw new ExpeditionLivreurError("Livreur invalide pour cette agence.", 400);

  const colis = await prisma.colis.findMany({
    where: { id: { in: colisIds }, agenceLivraisonId: agenceId, statut: "RECU_PAR_AGENCE_DEST", expeditionLivreurLignes: { none: {} } },
    select: { id: true },
  });
  if (colis.length !== colisIds.length || colis.length === 0) {
    throw new ExpeditionLivreurError("Certains colis ne sont plus disponibles pour un dispatch.");
  }

  const exp = await prisma.expeditionLivreur.create({
    data: {
      reference: await nextReference(),
      agence: { connect: { id: agenceId } },
      livreur: { connect: { id: livreurId } },
      statut: "NOUVEAU",
      dispatchedAt: new Date(),
    },
    select: { id: true },
  });
  await prisma.expeditionLivreurLigne.createMany({
    data: colis.map((c) => ({ expeditionLivreurId: exp.id, colisId: c.id, statut: "EN_ATTENTE" as const })),
  });
  await prisma.colis.updateMany({ where: { id: { in: colisIds } }, data: { statut: "DISPATCHE_LIVREUR", livreurLivraisonId: livreurId } });
  await prisma.colisEvent.createMany({
    data: colisIds.map((colisId) => ({ colisId, statut: "DISPATCHE_LIVREUR" as const, label: "Dispatché au livreur", createdByAccountId: actorAccountId })),
  });
  return exp;
}

function rowMap(e: {
  id: string; reference: string | null; createdAt: Date; statut: ExpeditionLivreurStatut;
  agence: { nom: string }; livreur: { nom: string; prenom: string };
  lignes: { colis: { statut: ColisStatut } }[];
}): ExpeditionLivreurRow {
  return {
    id: e.id,
    reference: e.reference ?? e.id.slice(0, 8).toUpperCase(),
    agence: e.agence.nom,
    livreur: `${e.livreur.prenom} ${e.livreur.nom}`,
    colisCount: e.lignes.length,
    livres: e.lignes.filter((l) => l.colis.statut === "LIVRE").length,
    statut: e.statut,
    date: dtDay.format(e.createdAt),
  };
}

const ROW_INCLUDE = {
  agence: { select: { nom: true } },
  livreur: { select: { nom: true, prenom: true } },
  lignes: { select: { colis: { select: { statut: true } } } },
} as const;

export async function listExpeditionsLivreur(
  where: Prisma.ExpeditionLivreurWhereInput,
  page = 1,
  perPage = PER_PAGE,
): Promise<{ rows: ExpeditionLivreurRow[]; total: number; page: number; perPage: number; totalPages: number }> {
  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.expeditionLivreur.count({ where }),
    prisma.expeditionLivreur.findMany({ where, include: ROW_INCLUDE, orderBy: { createdAt: "desc" }, skip: (safePage - 1) * perPage, take: perPage }),
  ]);
  return { rows: rows.map(rowMap), total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getExpeditionLivreurDetail(id: string): Promise<ExpeditionLivreurDetail | null> {
  const e = await prisma.expeditionLivreur.findUnique({
    where: { id },
    include: {
      agence: { select: { nom: true } },
      livreur: { select: { nom: true, prenom: true } },
      lignes: { include: { colis: { include: { destinationVille: { select: { nom: true } } } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!e) return null;
  const lignes = e.lignes.map((l) => ({
    colisId: l.colisId,
    trk: l.colis.trackingNumber,
    recipient: l.colis.recipientName,
    destCity: l.colis.destinationVille.nom,
    destAddress: l.colis.destinationAddress,
    cod: Number(l.colis.amountToCollect),
    state: colisState(l.colis.statut),
  }));
  return {
    id: e.id,
    reference: e.reference ?? e.id.slice(0, 8).toUpperCase(),
    agenceId: e.agenceId,
    livreurId: e.livreurId,
    agence: e.agence.nom,
    livreur: `${e.livreur.prenom} ${e.livreur.nom}`,
    statut: e.statut,
    date: dtDay.format(e.createdAt),
    total: lignes.length,
    livres: lignes.filter((l) => l.state === "LIVRE").length,
    recus: lignes.filter((l) => l.state !== "DISPATCHE").length,
    lignes,
  };
}

// ─── Livreur side ────────────────────────────────────────
export async function listLivreurDispatches(livreurId: string): Promise<ExpeditionLivreurRow[]> {
  const rows = await prisma.expeditionLivreur.findMany({
    where: { livreurId, statut: { in: ["NOUVEAU", "RECEPTIONNE", "EN_COURS"] } },
    include: ROW_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowMap);
}

export async function getLivreurDispatchDetail(livreurId: string, id: string): Promise<ExpeditionLivreurDetail | null> {
  const e = await prisma.expeditionLivreur.findFirst({ where: { id, livreurId }, select: { id: true } });
  if (!e) return null;
  return getExpeditionLivreurDetail(id);
}

/** The livreur confirms receiving the dispatch → all its colis go into delivery. */
export async function validateDispatchReception(livreurId: string, id: string, actorAccountId: string): Promise<void> {
  const exp = await prisma.expeditionLivreur.findFirst({ where: { id, livreurId }, select: { statut: true } });
  if (!exp) throw new ExpeditionLivreurError("Dispatch introuvable.", 404);

  const lignes = await prisma.expeditionLivreurLigne.findMany({
    where: { expeditionLivreurId: id, colis: { statut: "DISPATCHE_LIVREUR" } },
    select: { id: true, colisId: true },
  });
  if (lignes.length === 0) {
    // nothing left to receive; just mark en cours
    await prisma.expeditionLivreur.update({ where: { id }, data: { statut: "EN_COURS", receivedByLivreurAt: new Date() } });
    return;
  }
  const colisIds = lignes.map((l) => l.colisId);
  await prisma.colis.updateMany({ where: { id: { in: colisIds } }, data: { statut: "EN_COURS_DE_LIVRAISON" } });
  await prisma.colisEvent.createMany({
    data: colisIds.map((colisId) => ({ colisId, statut: "EN_COURS_DE_LIVRAISON" as const, label: "Réceptionné par le livreur — en cours de livraison", createdByAccountId: actorAccountId })),
  });
  await prisma.expeditionLivreurLigne.updateMany({ where: { id: { in: lignes.map((l) => l.id) } }, data: { statut: "CONFIRME", receivedAt: new Date() } });
  await prisma.expeditionLivreur.update({ where: { id }, data: { statut: "EN_COURS", receivedByLivreurAt: new Date() } });
}
