import { prisma } from "@/lib/db";
import { COMMISSION_SAME_VILLE, calcLigne } from "@/lib/facture-ui";
import type {
  FactureLivreurRow, FactureLivreurListResult, FactureLivreurTotals, FactureLivreurDetail,
} from "@/lib/types/facture-livreur";
import { Prisma, type FactureStatut } from "@prisma/client";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class FactureLivreurError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

/** Commission a given livreur earns on one delivered colis (and the COD they collected). */
function ligneFor(
  colis: { tarif: unknown; amountToCollect: unknown; livreurRamassageId: string | null; livreurLivraisonId: string | null },
  livreurId: string,
) {
  const tarif = Number(colis.tarif);
  const isRam = colis.livreurRamassageId === livreurId;
  const isLiv = colis.livreurLivraisonId === livreurId;
  // Same-ville: the livreur ramasse AND livre the same colis → 60% of the tarif.
  // Inter-villes: whoever only ramasse or only livre earns nothing (the agences
  // split the tarif), but still records the COD they collected to hand it back.
  const rate = isRam && isLiv ? COMMISSION_SAME_VILLE : 0;
  // Cash the livreur actually collected on delivery: the COD, or the tarif when COD = 0
  // (the recipient still pays the delivery fee). Same rule as the client facture.
  const collecte = calcLigne(Number(colis.amountToCollect), tarif).collecte;
  return {
    tarif,
    commission: Math.round(tarif * rate * 100) / 100,
    cod: isLiv ? collecte : 0,
    isRam,
    isLiv,
  };
}

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FL-${year}-`;
  const last = await prisma.factureLivreur.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNum = last?.reference ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

/** Generate a facture for every livreur who has delivered colis not yet billed to them. */
export async function generateAllFacturesLivreur(actorAccountId: string): Promise<{ created: number }> {
  const livreurs = await prisma.livreur.findMany({ select: { id: true, agenceId: true } });
  let created = 0;

  for (const liv of livreurs) {
    const colis = await prisma.colis.findMany({
      where: {
        statut: "LIVRE",
        // Bill by delivery only: the livreur who handed the colis over (and
        // collected the COD). The inter-villes ramasseur earns and owes nothing,
        // so he is never billed.
        livreurLivraisonId: liv.id,
        factureLivreurLignes: { none: { facture: { livreurId: liv.id } } },
      },
      select: { id: true, tarif: true, amountToCollect: true, livreurRamassageId: true, livreurLivraisonId: true },
    });
    if (colis.length === 0) continue;

    let codTotal = 0, tarifTotal = 0, commTotal = 0;
    const lignes = colis.map((c) => {
      const { tarif, commission, cod } = ligneFor(c, liv.id);
      codTotal += cod; tarifTotal += tarif; commTotal += commission;
      return { colisId: c.id, montantCollecte: cod, tarif, commission };
    });

    const baseData = {
      livreurId: liv.id,
      agenceId: liv.agenceId,
      montantCollecte: codTotal,
      tarifTotal,
      commissionLivreur: commTotal,
      montantAVerserAgence: Math.round((codTotal - commTotal) * 100) / 100,
      statut: "EN_ATTENTE" as const,
      createdByAccountId: actorAccountId,
      lignes: { create: lignes },
    };

    for (let attempt = 0; ; attempt++) {
      try {
        await prisma.factureLivreur.create({ data: { reference: await nextReference(), ...baseData }, select: { id: true } });
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

export type FactureLivreurFilters = {
  statut?: string;
  livreurId?: string;
  agenceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

function buildWhere(f: FactureLivreurFilters): Prisma.FactureLivreurWhereInput {
  const where: Prisma.FactureLivreurWhereInput = {};
  if (f.statut) where.statut = f.statut as FactureStatut;
  if (f.livreurId) where.livreurId = f.livreurId;
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
      { livreur: { is: { nom: { contains: f.search } } } },
      { livreur: { is: { prenom: { contains: f.search } } } },
    ];
  }
  return where;
}

export async function listFacturesLivreur(
  filters: FactureLivreurFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<FactureLivreurListResult> {
  const where = buildWhere(filters);
  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.factureLivreur.count({ where }),
    prisma.factureLivreur.findMany({
      where,
      include: {
        livreur: { select: { nom: true, prenom: true } },
        agence: { select: { nom: true } },
        _count: { select: { lignes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: FactureLivreurRow[] = rows.map((f) => ({
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    livreurId: f.livreurId,
    livreur: `${f.livreur.prenom} ${f.livreur.nom}`,
    agence: f.agence.nom,
    colisCount: f._count.lignes,
    montantCollecte: Number(f.montantCollecte),
    commission: Number(f.commissionLivreur),
    montantAVerser: Number(f.montantAVerserAgence),
    statut: f.statut,
    date: dtDay.format(f.createdAt),
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getFacturesLivreurTotals(filters: FactureLivreurFilters): Promise<FactureLivreurTotals> {
  const where = buildWhere(filters);
  const [agg, pending] = await Promise.all([
    prisma.factureLivreur.aggregate({
      where,
      _count: true,
      _sum: { montantCollecte: true, commissionLivreur: true, montantAVerserAgence: true },
    }),
    prisma.factureLivreur.aggregate({
      where: { ...where, statut: { not: "PAYE" } },
      _sum: { montantAVerserAgence: true },
    }),
  ]);
  return {
    count: agg._count,
    montantCollecte: Number(agg._sum.montantCollecte ?? 0),
    commission: Number(agg._sum.commissionLivreur ?? 0),
    montantAVerser: Number(agg._sum.montantAVerserAgence ?? 0),
    nonPayeAVerser: Number(pending._sum.montantAVerserAgence ?? 0),
  };
}

// ─── Livreur portal ──────────────────────────────────────
export async function listLivreurFactures(livreurId: string): Promise<FactureLivreurListResult> {
  return listFacturesLivreur({ livreurId }, 1, 100);
}

export async function getLivreurFactureDetail(livreurId: string, id: string): Promise<FactureLivreurDetail | null> {
  const f = await prisma.factureLivreur.findUnique({ where: { id }, select: { livreurId: true } });
  if (!f || f.livreurId !== livreurId) return null;
  return getFactureLivreurDetail(id);
}

/** Agence portal: a facture of one of the agence's own livreurs. */
export async function getAgenceFactureLivreurDetail(agenceId: string, id: string): Promise<FactureLivreurDetail | null> {
  const f = await prisma.factureLivreur.findUnique({ where: { id }, select: { agenceId: true } });
  if (!f || f.agenceId !== agenceId) return null;
  return getFactureLivreurDetail(id);
}

/** The livreur attaches their transfer proof and declares the amount paid to the agence. */
export async function submitVirement(livreurId: string, factureId: string, pieceJointeUrl: string): Promise<void> {
  const f = await prisma.factureLivreur.findUnique({ where: { id: factureId }, select: { livreurId: true, statut: true } });
  if (!f || f.livreurId !== livreurId) throw new FactureLivreurError("Facture introuvable.", 404);
  if (f.statut === "PAYE") throw new FactureLivreurError("Cette facture est déjà validée comme payée.", 409);
  await prisma.factureLivreur.update({
    where: { id: factureId },
    data: { statut: "MONTANT_VERSE", pieceJointeUrl },
  });
}

export async function setFactureLivreurStatus(id: string, statut: FactureStatut): Promise<void> {
  await prisma.factureLivreur.update({
    where: { id },
    data: { statut, paidAt: statut === "PAYE" ? new Date() : null },
  });
}

export async function getFactureLivreurDetail(id: string): Promise<FactureLivreurDetail | null> {
  const f = await prisma.factureLivreur.findUnique({
    where: { id },
    include: {
      livreur: { include: { ville: { select: { nom: true } }, agence: { select: { nom: true } } } },
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

  const livId = f.livreurId;
  return {
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    livreur: {
      nom: f.livreur.nom,
      prenom: f.livreur.prenom,
      telephone: f.livreur.telephone,
      ville: f.livreur.ville.nom,
      agence: f.livreur.agence.nom,
    },
    statut: f.statut,
    date: dtDay.format(f.createdAt),
    paidAt: f.paidAt ? dtDay.format(f.paidAt) : null,
    pieceJointeUrl: f.pieceJointeUrl,
    montantCollecte: Number(f.montantCollecte),
    tarifTotal: Number(f.tarifTotal),
    commission: Number(f.commissionLivreur),
    montantAVerser: Number(f.montantAVerserAgence),
    notes: f.notes,
    lignes: f.lignes.map((l) => {
      const isRam = l.colis.livreurRamassageId === livId;
      const isLiv = l.colis.livreurLivraisonId === livId;
      const role = isRam && isLiv ? "Ramassage + Livraison" : isRam ? "Ramassage" : "Livraison";
      return {
        colisId: l.colisId,
        trk: l.colis.trackingNumber,
        recipient: l.colis.recipientName,
        trajet: `${l.colis.pickupVille.nom} → ${l.colis.destinationVille.nom}`,
        role,
        cod: Number(l.montantCollecte),
        tarif: Number(l.tarif),
        commission: Number(l.commission),
        date: dtDay.format(l.colis.createdAt),
      };
    }),
  };
}
