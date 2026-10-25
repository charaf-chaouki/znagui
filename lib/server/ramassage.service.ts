import { prisma } from "@/lib/db";
import { Prisma, type RamassageStatut, type ColisStatut } from "@prisma/client";
import type {
  AvailableColis, RamassageRow, RamassageListResult, RamassageDetail, ColisRamassageState,
} from "@/lib/types/ramassage";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class RamassageError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

function colisState(colisStatut: ColisStatut, ligneConfirmed: boolean): ColisRamassageState {
  if (ligneConfirmed || colisStatut === "RECU_ENTREPOT_SOURCE") return "ENTREPOT";
  if (colisStatut === "RAMASSE") return "RAMASSE";
  return "EN_ATTENTE";
}

/** Colis in a ville ready to be added to a ramassage (not yet assigned to one). */
export async function listAvailableColis(villeId: string): Promise<AvailableColis[]> {
  const rows = await prisma.colis.findMany({
    where: {
      type: "INTER", // inter-villes (X → Y); same-ville colis are handled by the livreur self-take flow
      pickupVilleId: villeId,
      statut: { in: ["CREE", "DISPONIBLE_A_RAMASSER"] },
      livreurRamassageId: null,
      ramassageLignes: { none: {} },
    },
    include: { client: { select: { nom: true } }, destinationVille: { select: { nom: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((c) => ({
    id: c.id,
    trk: c.trackingNumber,
    client: c.client.nom,
    destCity: c.destinationVille.nom,
    pickupAddress: c.pickupAddress,
    cod: Number(c.amountToCollect),
    tarif: Number(c.tarif),
  }));
}

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RAM-${year}-`;
  const last = await prisma.ramassage.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNum = last?.reference ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createRamassage(
  agenceId: string,
  livreurId: string,
  colisIds: string[],
  actorAccountId: string,
  notes?: string | null,
): Promise<{ id: string }> {
  // the livreur must belong to this agence
  const liv = await prisma.livreur.findFirst({ where: { id: livreurId, agenceId }, select: { id: true } });
  if (!liv) throw new RamassageError("Livreur invalide pour cette agence.", 400);

  // the agence's ville, and the colis must be eligible in that ville
  const agence = await prisma.agence.findUnique({ where: { id: agenceId }, select: { villeId: true } });
  const colis = await prisma.colis.findMany({
    where: {
      id: { in: colisIds },
      type: "INTER",
      pickupVilleId: agence?.villeId,
      statut: { in: ["CREE", "DISPONIBLE_A_RAMASSER"] },
      livreurRamassageId: null,
      ramassageLignes: { none: {} },
    },
    select: { id: true },
  });
  if (colis.length !== colisIds.length || colis.length === 0) {
    throw new RamassageError("Certains colis ne sont plus disponibles pour un ramassage.");
  }

  const ramassage = await prisma.ramassage.create({
    data: {
      reference: await nextReference(),
      agence: { connect: { id: agenceId } },
      livreur: { connect: { id: livreurId } },
      statut: "PLANIFIE",
      notes: notes ?? null,
    },
    select: { id: true },
  });
  await prisma.ramassageLigne.createMany({
    data: colis.map((c) => ({ ramassageId: ramassage.id, colisId: c.id, statut: "EN_ATTENTE" as const })),
  });

  await prisma.colis.updateMany({
    where: { id: { in: colisIds } },
    data: { livreurRamassageId: livreurId, agenceRamassageId: agenceId, statut: "AFFECTE_RAMASSAGE" },
  });
  await prisma.colisEvent.createMany({
    data: colisIds.map((colisId) => ({
      colisId, statut: "AFFECTE_RAMASSAGE" as const, label: "Affecté au ramassage", createdByAccountId: actorAccountId,
    })),
  });

  return ramassage;
}

export async function listRamassages(
  agenceId: string | undefined,
  filters: { statut?: string; livreurId?: string; agenceId?: string; search?: string },
  page = 1,
  perPage = PER_PAGE,
): Promise<RamassageListResult> {
  // agenceId scopes to one agence (agence portal); undefined lists all (admin).
  const where: Prisma.RamassageWhereInput = {};
  if (agenceId) where.agenceId = agenceId;
  else if (filters.agenceId) where.agenceId = filters.agenceId;
  if (filters.statut) where.statut = filters.statut as RamassageStatut;
  if (filters.livreurId) where.livreurId = filters.livreurId;
  if (filters.search) where.reference = { contains: filters.search };

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.ramassage.count({ where }),
    prisma.ramassage.findMany({
      where,
      include: {
        agence: { select: { nom: true } },
        livreur: { select: { nom: true, prenom: true } },
        lignes: { select: { statut: true, colis: { select: { statut: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: RamassageRow[] = rows.map((r) => ({
    id: r.id,
    reference: r.reference ?? r.id.slice(0, 8).toUpperCase(),
    agence: r.agence.nom,
    livreur: `${r.livreur.prenom} ${r.livreur.nom}`,
    colisCount: r.lignes.length,
    recus: r.lignes.filter((l) => colisState(l.colis.statut, l.statut === "CONFIRME") === "ENTREPOT").length,
    statut: r.statut,
    date: dtDay.format(r.createdAt),
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getRamassageDetail(id: string): Promise<RamassageDetail | null> {
  const r = await prisma.ramassage.findUnique({
    where: { id },
    include: {
      livreur: { select: { nom: true, prenom: true } },
      agence: { select: { nom: true } },
      lignes: {
        include: {
          colis: {
            include: { client: { select: { nom: true } }, destinationVille: { select: { nom: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!r) return null;

  const lignes = r.lignes.map((l) => ({
    colisId: l.colisId,
    trk: l.colis.trackingNumber,
    client: l.colis.client.nom,
    recipient: l.colis.recipientName,
    destCity: l.colis.destinationVille.nom,
    pickupAddress: l.colis.pickupAddress,
    cod: Number(l.colis.amountToCollect),
    state: colisState(l.colis.statut, l.statut === "CONFIRME"),
  }));

  return {
    id: r.id,
    reference: r.reference ?? r.id.slice(0, 8).toUpperCase(),
    agenceId: r.agenceId,
    livreurId: r.livreurId,
    livreur: `${r.livreur.prenom} ${r.livreur.nom}`,
    agence: r.agence.nom,
    statut: r.statut,
    date: dtDay.format(r.createdAt),
    notes: r.notes,
    total: lignes.length,
    recus: lignes.filter((l) => l.state === "ENTREPOT").length,
    ramasses: lignes.filter((l) => l.state === "RAMASSE").length,
    lignes,
  };
}

/** Agence scans a colis to validate its reception at the entrepôt. */
export async function scanReception(
  agenceId: string,
  ramassageId: string,
  code: string,
  actorAccountId: string,
): Promise<{ trk: string; state: ColisRamassageState }> {
  const ramassage = await prisma.ramassage.findFirst({ where: { id: ramassageId, agenceId }, select: { id: true } });
  if (!ramassage) throw new RamassageError("Ramassage introuvable.", 404);

  const ligne = await prisma.ramassageLigne.findFirst({
    where: {
      ramassageId,
      colis: { OR: [{ trackingNumber: code }, { qrToken: code }] },
    },
    include: { colis: { select: { id: true, trackingNumber: true, statut: true } } },
  });
  if (!ligne) throw new RamassageError("Ce colis ne fait pas partie de ce ramassage.", 404);

  if (ligne.statut === "CONFIRME" || ligne.colis.statut === "RECU_ENTREPOT_SOURCE") {
    return { trk: ligne.colis.trackingNumber, state: "ENTREPOT" };
  }

  await prisma.ramassageLigne.update({ where: { id: ligne.id }, data: { statut: "CONFIRME", scannedAt: new Date() } });
  await prisma.colis.update({ where: { id: ligne.colis.id }, data: { statut: "RECU_ENTREPOT_SOURCE" } });
  await prisma.colisEvent.create({
    data: { colisId: ligne.colis.id, statut: "RECU_ENTREPOT_SOURCE", label: "Reçu à l'entrepôt", createdByAccountId: actorAccountId },
  });

  // all received → ramassage terminé
  const remaining = await prisma.ramassageLigne.count({ where: { ramassageId, statut: { not: "CONFIRME" } } });
  if (remaining === 0) {
    await prisma.ramassage.update({ where: { id: ramassageId }, data: { statut: "TERMINE", completedAt: new Date() } });
  } else {
    await prisma.ramassage.updateMany({ where: { id: ramassageId, statut: "PLANIFIE" }, data: { statut: "EN_COURS" } });
  }

  return { trk: ligne.colis.trackingNumber, state: "ENTREPOT" };
}

/** Reception scan from the ramassages list — finds the colis in any of the agence's ramassages. */
export async function scanReceptionGlobal(
  agenceId: string,
  code: string,
  actorAccountId: string,
): Promise<{ trk: string; reference: string }> {
  const ligne = await prisma.ramassageLigne.findFirst({
    where: { ramassage: { agenceId }, colis: { OR: [{ trackingNumber: code }, { qrToken: code }] } },
    include: { ramassage: { select: { id: true, reference: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (!ligne) throw new RamassageError("Aucun ramassage de votre agence ne contient ce colis.", 404);
  const res = await scanReception(agenceId, ligne.ramassageId, code, actorAccountId);
  return { trk: res.trk, reference: ligne.ramassage.reference ?? ligne.ramassageId.slice(0, 8).toUpperCase() };
}

// ─── Livreur side ────────────────────────────────────────
export async function listLivreurRamassages(livreurId: string) {
  const rows = await prisma.ramassage.findMany({
    where: { livreurId, statut: { in: ["PLANIFIE", "EN_COURS"] } },
    include: {
      agence: { select: { nom: true } },
      lignes: { select: { statut: true, colis: { select: { statut: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    reference: r.reference ?? r.id.slice(0, 8).toUpperCase(),
    agence: r.agence.nom,
    statut: r.statut,
    total: r.lignes.length,
    ramasses: r.lignes.filter((l) => colisState(l.colis.statut, l.statut === "CONFIRME") !== "EN_ATTENTE").length,
    date: dtDay.format(r.createdAt),
  }));
}

export async function getLivreurRamassageDetail(livreurId: string, id: string): Promise<RamassageDetail | null> {
  const r = await prisma.ramassage.findFirst({ where: { id, livreurId }, select: { id: true } });
  if (!r) return null;
  return getRamassageDetail(id);
}

/** Livreur confirms picking up one colis of their ramassage. */
export async function ramasseColis(livreurId: string, ramassageId: string, colisId: string, actorAccountId: string): Promise<void> {
  const ramassage = await prisma.ramassage.findFirst({ where: { id: ramassageId, livreurId }, select: { statut: true } });
  if (!ramassage) throw new RamassageError("Ramassage introuvable.", 404);

  const ligne = await prisma.ramassageLigne.findFirst({
    where: { ramassageId, colisId },
    include: { colis: { select: { id: true, statut: true } } },
  });
  if (!ligne) throw new RamassageError("Colis introuvable dans ce ramassage.", 404);
  if (!["AFFECTE_RAMASSAGE", "DISPONIBLE_A_RAMASSER"].includes(ligne.colis.statut)) {
    throw new RamassageError("Ce colis est déjà ramassé.", 409);
  }

  await prisma.colis.update({ where: { id: colisId }, data: { statut: "RAMASSE" } });
  await prisma.colisEvent.create({
    data: { colisId, statut: "RAMASSE", label: "Ramassé par le livreur", createdByAccountId: actorAccountId },
  });
  if (ramassage.statut === "PLANIFIE") {
    await prisma.ramassage.update({ where: { id: ramassageId }, data: { statut: "EN_COURS" } });
  }
}
