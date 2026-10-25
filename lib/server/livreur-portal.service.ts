import { prisma } from "@/lib/db";
import { getColisDetail, updateColisStatus } from "@/lib/server/colis.service";
import type { ColisDetail } from "@/lib/types/colis";
import type {
  LivreurColisCard, LivreurColisListResult, LivreurColisGroup, LivreurDashboard, LivreurActionStatut,
} from "@/lib/types/livreur-portal";
import type { ColisStatut, Prisma } from "@prisma/client";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class LivreurPortalError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

const A_RAMASSER: ColisStatut[] = ["AFFECTE_RAMASSAGE", "DISPONIBLE_A_RAMASSER"];
const ECHOUEE: ColisStatut[] = ["REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR"];

function groupWhere(livreurId: string, group: LivreurColisGroup): Prisma.ColisWhereInput {
  if (group === "LIVRE") return { livreurLivraisonId: livreurId, statut: "LIVRE" };
  if (group === "ECHOUEE") return { livreurLivraisonId: livreurId, statut: { in: ECHOUEE } };
  return { livreurLivraisonId: livreurId, statut: "EN_COURS_DE_LIVRAISON" };
}

function cardOf(c: {
  id: string; trackingNumber: string; recipientName: string; recipientPhone: string;
  pickupVille: { nom: string }; destinationVille: { nom: string }; destinationAddress: string;
  amountToCollect: unknown; tarif: unknown; statut: ColisStatut; createdAt: Date;
}): LivreurColisCard {
  return {
    id: c.id,
    trk: c.trackingNumber,
    recipient: c.recipientName,
    recipientPhone: c.recipientPhone,
    pickupCity: c.pickupVille.nom,
    destCity: c.destinationVille.nom,
    destAddress: c.destinationAddress,
    cod: Number(c.amountToCollect),
    tarif: Number(c.tarif),
    statut: c.statut,
    date: dtDay.format(c.createdAt),
  };
}

const CARD_INCLUDE = {
  pickupVille: { select: { nom: true } },
  destinationVille: { select: { nom: true } },
} as const;

export async function getLivreurDashboard(livreurId: string): Promise<LivreurDashboard> {
  const livreur = await prisma.livreur.findUnique({
    where: { id: livreurId },
    select: { nom: true, prenom: true, ville: { select: { nom: true } }, agence: { select: { nom: true } } },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [aRamasser, enLivraison, livresAujourdhui, codAgg, tournee] = await Promise.all([
    prisma.colis.count({ where: { livreurRamassageId: livreurId, statut: { in: A_RAMASSER } } }),
    prisma.colis.count({ where: { livreurLivraisonId: livreurId, statut: "EN_COURS_DE_LIVRAISON" } }),
    prisma.colis.count({ where: { livreurLivraisonId: livreurId, statut: "LIVRE", updatedAt: { gte: startOfDay } } }),
    prisma.colis.aggregate({
      where: { livreurLivraisonId: livreurId, statut: "EN_COURS_DE_LIVRAISON" },
      _sum: { amountToCollect: true },
    }),
    prisma.colis.findMany({
      where: { livreurLivraisonId: livreurId, statut: "EN_COURS_DE_LIVRAISON" },
      include: CARD_INCLUDE,
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    prenom: livreur?.prenom ?? "",
    nom: livreur?.nom ?? "",
    agence: livreur?.agence.nom ?? "",
    ville: livreur?.ville.nom ?? "",
    aRamasser,
    enLivraison,
    livresAujourdhui,
    codAEncaisser: Number(codAgg._sum.amountToCollect ?? 0),
    tournee: tournee.map(cardOf),
  };
}

export async function listLivreurColis(
  livreurId: string,
  group: LivreurColisGroup,
  search: string | undefined,
  page = 1,
  perPage = PER_PAGE,
): Promise<LivreurColisListResult> {
  const where = groupWhere(livreurId, group);
  if (search) {
    where.OR = [
      { trackingNumber: { contains: search } },
      { recipientName: { contains: search } },
    ];
  }
  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.colis.count({ where }),
    prisma.colis.findMany({
      where,
      include: CARD_INCLUDE,
      orderBy: { updatedAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);
  return { rows: rows.map(cardOf), total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function listLivreurARamasser(livreurId: string): Promise<LivreurColisCard[]> {
  const rows = await prisma.colis.findMany({
    where: { livreurRamassageId: livreurId, statut: { in: A_RAMASSER } },
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(cardOf);
}

/**
 * Same-ville (INTRA) colis still up for grabs in the livreur's own city.
 * A livreur in Fès sees Fès→Fès colis nobody has taken yet.
 */
export async function listAvailableIntraColis(livreurId: string): Promise<LivreurColisCard[]> {
  const livreur = await prisma.livreur.findUnique({ where: { id: livreurId }, select: { villeId: true } });
  if (!livreur) return [];
  const rows = await prisma.colis.findMany({
    where: {
      type: "INTRA",
      pickupVilleId: livreur.villeId,
      statut: { in: ["CREE", "DISPONIBLE_A_RAMASSER"] },
      livreurRamassageId: null,
      livreurLivraisonId: null,
    },
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(cardOf);
}

/** A same-ville livreur takes an available INTRA colis (does pickup + delivery). */
export async function takeIntraColis(livreurId: string, colisId: string, actorAccountId: string): Promise<void> {
  const livreur = await prisma.livreur.findUnique({ where: { id: livreurId }, select: { villeId: true, agenceId: true } });
  const colis = await prisma.colis.findUnique({
    where: { id: colisId },
    select: { type: true, pickupVilleId: true, statut: true, livreurRamassageId: true, livreurLivraisonId: true },
  });
  if (!colis) throw new LivreurPortalError("Colis introuvable.", 404);
  if (colis.type !== "INTRA" || colis.pickupVilleId !== livreur?.villeId) {
    throw new LivreurPortalError("Ce colis n'est pas disponible dans votre ville.", 409);
  }
  if (colis.livreurRamassageId || colis.livreurLivraisonId) {
    throw new LivreurPortalError("Ce colis a déjà été pris par un livreur.", 409);
  }
  if (!["CREE", "DISPONIBLE_A_RAMASSER"].includes(colis.statut)) {
    throw new LivreurPortalError("Ce colis n'est plus disponible.", 409);
  }
  // Same-ville: the livreur does pickup + delivery, so attach the colis to their agence
  // for both phases — it stays tracked by one agence through the whole cycle.
  await prisma.colis.update({
    where: { id: colisId },
    data: {
      livreurRamassageId: livreurId,
      livreurLivraisonId: livreurId,
      agenceRamassageId: livreur.agenceId,
      agenceLivraisonId: livreur.agenceId,
      statut: "AFFECTE_RAMASSAGE",
    },
  });
  await prisma.colisEvent.create({
    data: { colisId, statut: "AFFECTE_RAMASSAGE", label: "Pris en charge par le livreur", createdByAccountId: actorAccountId },
  });
}

/** Rich detail scoped to this livreur. Also viewable (to take) for an available same-ville colis. */
export async function getLivreurColisDetail(
  livreurId: string,
  trk: string,
): Promise<{ detail: ColisDetail; isRamasseur: boolean; isLivreur: boolean; canTake: boolean } | null> {
  const [livreur, colis] = await Promise.all([
    prisma.livreur.findUnique({ where: { id: livreurId }, select: { villeId: true } }),
    prisma.colis.findFirst({
      where: { trackingNumber: trk },
      select: { livreurRamassageId: true, livreurLivraisonId: true, type: true, pickupVilleId: true, statut: true },
    }),
  ]);
  if (!colis) return null;

  const isRamasseur = colis.livreurRamassageId === livreurId;
  const isLivreur = colis.livreurLivraisonId === livreurId;
  const owned = isRamasseur || isLivreur;
  const canTake =
    !owned &&
    colis.type === "INTRA" &&
    colis.pickupVilleId === livreur?.villeId &&
    ["CREE", "DISPONIBLE_A_RAMASSER"].includes(colis.statut) &&
    !colis.livreurRamassageId &&
    !colis.livreurLivraisonId;

  if (!owned && !canTake) return null;
  const detail = await getColisDetail(trk);
  if (!detail) return null;
  return { detail, isRamasseur, isLivreur, canTake };
}

// A livreur who owns the delivery can set any of these from any delivery-domain state,
// including corrections after LIVRE / REFUSE / RETOUR / ANNULE.
const DELIVERY_FROM: ColisStatut[] = [
  "RAMASSE", "RECU_PAR_AGENCE_DEST", "EN_COURS_DE_LIVRAISON",
  "LIVRE", "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE",
];

// Allowed transitions, by target status: who may do it (role) and from which statuses.
const TRANSITIONS: Record<LivreurActionStatut, { from: ColisStatut[]; role: "ramassage" | "livraison" }> = {
  RAMASSE: { from: ["DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE"], role: "ramassage" },
  EN_COURS_DE_LIVRAISON: { from: DELIVERY_FROM, role: "livraison" },
  LIVRE: { from: DELIVERY_FROM, role: "livraison" },
  REPORTE: { from: DELIVERY_FROM, role: "livraison" },
  PAS_DE_REPONSE: { from: DELIVERY_FROM, role: "livraison" },
  REFUSE: { from: DELIVERY_FROM, role: "livraison" },
  RETOUR: { from: DELIVERY_FROM, role: "livraison" },
};

export async function setLivreurColisStatus(
  livreurId: string,
  colisId: string,
  statut: LivreurActionStatut,
  note: string | null,
  actorAccountId: string,
): Promise<void> {
  const t = TRANSITIONS[statut];
  if (!t) throw new LivreurPortalError("Action non autorisée.", 400);

  const colis = await prisma.colis.findUnique({
    where: { id: colisId },
    select: { livreurLivraisonId: true, livreurRamassageId: true, statut: true, type: true },
  });
  if (!colis) throw new LivreurPortalError("Colis introuvable.", 404);

  const owns = t.role === "ramassage" ? colis.livreurRamassageId === livreurId : colis.livreurLivraisonId === livreurId;
  if (!owns) throw new LivreurPortalError("Colis introuvable.", 404);
  if (!t.from.includes(colis.statut)) {
    throw new LivreurPortalError("Action impossible pour l'état actuel du colis.", 409);
  }

  // Same-ville (INTRA) & the pickup livreur is also the delivery livreur:
  // confirming the pickup puts the colis straight into delivery (no entrepôt/expédition step).
  if (statut === "RAMASSE" && colis.type === "INTRA" && colis.livreurLivraisonId === livreurId) {
    await updateColisStatus(colisId, "RAMASSE", note, actorAccountId);
    await updateColisStatus(colisId, "EN_COURS_DE_LIVRAISON", null, actorAccountId);
    return;
  }
  await updateColisStatus(colisId, statut, note, actorAccountId);
}

/** Resolve a scanned code (tracking number or qr token) to one of this livreur's colis. */
export async function resolveLivreurScan(livreurId: string, code: string): Promise<{ trk: string } | null> {
  const c = await prisma.colis.findFirst({
    where: {
      OR: [{ trackingNumber: code }, { qrToken: code }],
      AND: { OR: [{ livreurLivraisonId: livreurId }, { livreurRamassageId: livreurId }] },
    },
    select: { trackingNumber: true },
  });
  return c ? { trk: c.trackingNumber } : null;
}
