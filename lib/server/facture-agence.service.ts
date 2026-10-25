import { prisma } from "@/lib/db";
import { COMMISSION_AGENCE, calcLigne } from "@/lib/facture-ui";
import type {
  FactureAgenceRow, FactureAgenceListResult, FactureAgenceTotals, FactureAgenceDetail,
} from "@/lib/types/facture-agence";
import { Prisma, type FactureStatut } from "@prisma/client";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const round2 = (n: number) => Math.round(n * 100) / 100;

export class FactureAgenceError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FA-${year}-`;
  const last = await prisma.factureAgence.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNum = last?.reference ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

/**
 * Generate a commission facture for every agence that participated — as source
 * (ramassage) or destination (livraison) — in inter-villes colis that have been
 * delivered and not yet billed to it. Each colis earns the agence 20% of its
 * tarif. Same-ville (INTRA) colis are excluded (no agence commission).
 */
export async function generateAllFacturesAgence(actorAccountId: string): Promise<{ created: number }> {
  const agences = await prisma.agence.findMany({ select: { id: true } });
  let created = 0;

  for (const ag of agences) {
    const colis = await prisma.colis.findMany({
      where: {
        statut: "LIVRE",
        type: "INTER",
        OR: [{ agenceRamassageId: ag.id }, { agenceLivraisonId: ag.id }],
        factureAgenceLignes: { none: { facture: { agenceId: ag.id } } },
      },
      select: { id: true, tarif: true, amountToCollect: true, agenceRamassageId: true, agenceLivraisonId: true },
    });
    if (colis.length === 0) continue;

    let tarifTotal = 0, commTotal = 0, collecteTotal = 0, aVerserTotal = 0;
    const lignes = colis.map((c) => {
      const tarif = Number(c.tarif);
      const commission = round2(tarif * COMMISSION_AGENCE);
      const isDest = c.agenceLivraisonId === ag.id;
      const role = isDest ? "DEST" : "SOURCE";
      // Only the livraison agence collects the COD (or the tarif when COD = 0).
      // The ramassage agence collects nothing, so it has nothing to remit —
      // the direction instead owes it its commission.
      const collecte = isDest ? calcLigne(Number(c.amountToCollect), tarif).collecte : 0;
      const montantAVerser = isDest ? round2(collecte - commission) : 0;
      tarifTotal += tarif; commTotal += commission; collecteTotal += collecte; aVerserTotal += montantAVerser;
      return { colisId: c.id, role, tarif, collecte, commission, montantAVerser };
    });

    const baseData = {
      agenceId: ag.id,
      montantTarifTotal: round2(tarifTotal),
      montantCollecte: round2(collecteTotal),
      commissionAgence: round2(commTotal),
      montantAVerser: round2(aVerserTotal),
      statut: "EN_ATTENTE" as const,
      createdByAccountId: actorAccountId,
      lignes: { create: lignes },
    };

    for (let attempt = 0; ; attempt++) {
      try {
        await prisma.factureAgence.create({ data: { reference: await nextReference(), ...baseData }, select: { id: true } });
        break;
      } catch (e) {
        const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
          && (e.meta?.target as string | undefined)?.includes("reference");
        if (collision && attempt < 4) continue;
        throw e;
      }
    }
    created++;
  }
  return { created };
}

export type FactureAgenceFilters = {
  statut?: string;
  agenceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

function buildWhere(f: FactureAgenceFilters): Prisma.FactureAgenceWhereInput {
  const where: Prisma.FactureAgenceWhereInput = {};
  if (f.statut) where.statut = f.statut as FactureStatut;
  if (f.agenceId) where.agenceId = f.agenceId;
  if (f.dateFrom || f.dateTo) {
    where.createdAt = {};
    if (f.dateFrom) where.createdAt.gte = new Date(f.dateFrom);
    if (f.dateTo) {
      const d = new Date(f.dateTo);
      d.setHours(23, 59, 59, 999);
      where.createdAt.lte = d;
    }
  }
  if (f.search) {
    where.OR = [
      { reference: { contains: f.search } },
      { agence: { is: { nom: { contains: f.search } } } },
    ];
  }
  return where;
}

export async function listFacturesAgence(
  filters: FactureAgenceFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<FactureAgenceListResult> {
  const where = buildWhere(filters);
  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.factureAgence.count({ where }),
    prisma.factureAgence.findMany({
      where,
      include: {
        agence: { select: { nom: true, ville: { select: { nom: true } } } },
        _count: { select: { lignes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: FactureAgenceRow[] = rows.map((f) => ({
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    agenceId: f.agenceId,
    agence: f.agence.nom,
    ville: f.agence.ville.nom,
    colisCount: f._count.lignes,
    montantTarifTotal: Number(f.montantTarifTotal),
    montantCollecte: Number(f.montantCollecte),
    commission: Number(f.commissionAgence),
    montantAVerser: Number(f.montantAVerser),
    statut: f.statut,
    date: dtDay.format(f.createdAt),
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getFacturesAgenceTotals(filters: FactureAgenceFilters): Promise<FactureAgenceTotals> {
  const where = buildWhere(filters);
  const [agg, pending] = await Promise.all([
    prisma.factureAgence.aggregate({
      where,
      _count: true,
      _sum: { montantTarifTotal: true, montantCollecte: true, commissionAgence: true, montantAVerser: true },
    }),
    prisma.factureAgence.aggregate({
      where: { ...where, statut: { not: "PAYE" } },
      _sum: { commissionAgence: true, montantAVerser: true },
    }),
  ]);
  return {
    count: agg._count,
    montantTarifTotal: Number(agg._sum.montantTarifTotal ?? 0),
    montantCollecte: Number(agg._sum.montantCollecte ?? 0),
    commission: Number(agg._sum.commissionAgence ?? 0),
    montantAVerser: Number(agg._sum.montantAVerser ?? 0),
    nonPayeCommission: Number(pending._sum.commissionAgence ?? 0),
    nonPayeAVerser: Number(pending._sum.montantAVerser ?? 0),
  };
}

export async function setFactureAgenceStatus(id: string, statut: FactureStatut): Promise<void> {
  await prisma.factureAgence.update({
    where: { id },
    data: { statut, paidAt: statut === "PAYE" ? new Date() : null },
  });
}

export async function attachFactureAgencePiece(id: string, pieceJointeUrl: string): Promise<void> {
  await prisma.factureAgence.update({
    where: { id },
    data: { pieceJointeUrl, statut: "MONTANT_VERSE" },
  });
}

export async function getFactureAgenceDetail(id: string): Promise<FactureAgenceDetail | null> {
  const f = await prisma.factureAgence.findUnique({
    where: { id },
    include: {
      agence: { include: { ville: { select: { nom: true } } } },
      lignes: {
        include: {
          colis: {
            include: { pickupVille: { select: { nom: true } }, destinationVille: { select: { nom: true } } },
          },
        },
        orderBy: { colis: { createdAt: "desc" } },
      },
    },
  });
  if (!f) return null;

  return {
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    agence: {
      nom: f.agence.nom,
      ville: f.agence.ville.nom,
      telephone: f.agence.telephone,
      adresse: f.agence.adresse,
    },
    statut: f.statut,
    date: dtDay.format(f.createdAt),
    paidAt: f.paidAt ? dtDay.format(f.paidAt) : null,
    pieceJointeUrl: f.pieceJointeUrl,
    montantTarifTotal: Number(f.montantTarifTotal),
    montantCollecte: Number(f.montantCollecte),
    commission: Number(f.commissionAgence),
    montantAVerser: Number(f.montantAVerser),
    notes: f.notes,
    lignes: f.lignes.map((l) => ({
      colisId: l.colisId,
      trk: l.colis.trackingNumber,
      recipient: l.colis.recipientName,
      trajet: `${l.colis.pickupVille.nom} → ${l.colis.destinationVille.nom}`,
      role: l.role === "DEST" ? "Agence destination" : "Agence source",
      tarif: Number(l.tarif),
      collecte: Number(l.collecte),
      commission: Number(l.commission),
      montantAVerser: Number(l.montantAVerser),
      date: dtDay.format(l.colis.createdAt),
    })),
  };
}

// ─── Agence portal (read-only) ──────────────────────────────────────
export async function listAgenceFactures(agenceId: string): Promise<FactureAgenceListResult> {
  return listFacturesAgence({ agenceId }, 1, 100);
}

export async function getAgenceFactureDetail(agenceId: string, id: string): Promise<FactureAgenceDetail | null> {
  const f = await prisma.factureAgence.findUnique({ where: { id }, select: { agenceId: true } });
  if (!f || f.agenceId !== agenceId) return null;
  return getFactureAgenceDetail(id);
}
