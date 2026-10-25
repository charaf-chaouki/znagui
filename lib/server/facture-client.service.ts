import { prisma } from "@/lib/db";
import { calcLigne } from "@/lib/facture-ui";
import type {
  UninvoicedColis, FactureClientRow, FactureClientListResult,
  FactureClientTotals, FactureClientDetail,
} from "@/lib/types/facture-client";
import { Prisma, type FactureStatut } from "@prisma/client";

export const PER_PAGE = 20;
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export class FactureClientError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

export type FactureClientFilters = {
  statut?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

function buildWhere(f: FactureClientFilters): Prisma.FactureClientWhereInput {
  const where: Prisma.FactureClientWhereInput = {};
  if (f.statut) where.statut = f.statut as FactureStatut;
  if (f.clientId) where.clientId = f.clientId;
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
      { client: { is: { nom: { contains: f.search } } } },
    ];
  }
  return where;
}

export async function listFacturesClient(
  filters: FactureClientFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<FactureClientListResult> {
  const where = buildWhere(filters);
  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.factureClient.count({ where }),
    prisma.factureClient.findMany({
      where,
      include: { client: { select: { nom: true } }, _count: { select: { lignes: true } } },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: FactureClientRow[] = rows.map((f) => ({
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    clientId: f.clientId,
    client: f.client.nom,
    colisCount: f._count.lignes,
    montantCollecte: Number(f.montantColisTotal),
    tarifTotal: Number(f.montantTarifTotal),
    montantNet: Number(f.montantNet),
    statut: f.statut,
    date: dtDay.format(f.createdAt),
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getFacturesClientTotals(filters: FactureClientFilters): Promise<FactureClientTotals> {
  const where = buildWhere(filters);
  const [agg, pending] = await Promise.all([
    prisma.factureClient.aggregate({
      where,
      _count: true,
      _sum: { montantColisTotal: true, montantTarifTotal: true, montantNet: true },
    }),
    prisma.factureClient.aggregate({
      where: { ...where, statut: { not: "PAYE" } },
      _sum: { montantNet: true },
    }),
  ]);
  return {
    count: agg._count,
    montantCollecte: Number(agg._sum.montantColisTotal ?? 0),
    tarifTotal: Number(agg._sum.montantTarifTotal ?? 0),
    montantNet: Number(agg._sum.montantNet ?? 0),
    nonPayeNet: Number(pending._sum.montantNet ?? 0),
  };
}

export async function listUninvoicedLivreColis(clientId: string): Promise<UninvoicedColis[]> {
  const colis = await prisma.colis.findMany({
    where: { clientId, statut: "LIVRE", factureClientLignes: { none: {} } },
    include: { destinationVille: { select: { nom: true } } },
    orderBy: { createdAt: "desc" },
  });
  return colis.map((c) => {
    const cod = Number(c.amountToCollect);
    const tarif = Number(c.tarif);
    const { collecte, aVerser } = calcLigne(cod, tarif);
    return {
      id: c.id,
      trk: c.trackingNumber,
      recipient: c.recipientName,
      destCity: c.destinationVille.nom,
      cod, tarif, collecte, aVerser,
      date: dtDay.format(c.createdAt),
    };
  });
}

// Next reference from the highest existing number for the year — robust to gaps
// left by deleted factures (count-based numbering would reuse a taken reference).
async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FC-${year}-`;
  const last = await prisma.factureClient.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNum = last?.reference ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createFactureClient(
  clientId: string,
  colisIds: string[],
  actorAccountId?: string | null,
): Promise<{ id: string }> {
  const colis = await prisma.colis.findMany({
    where: { id: { in: colisIds }, clientId, statut: "LIVRE", factureClientLignes: { none: {} } },
    select: { id: true, amountToCollect: true, tarif: true },
  });
  if (colis.length !== colisIds.length || colis.length === 0) {
    throw new FactureClientError("Certains colis ne sont plus éligibles à la facturation.");
  }

  let collecteTotal = 0, tarifTotal = 0, netTotal = 0;
  const lignes = colis.map((c) => {
    const cod = Number(c.amountToCollect);
    const tarif = Number(c.tarif);
    const { collecte, aVerser } = calcLigne(cod, tarif);
    collecteTotal += collecte; tarifTotal += tarif; netTotal += aVerser;
    return { colisId: c.id, montantCollecte: collecte, tarif };
  });

  const baseData = {
    clientId,
    montantColisTotal: collecteTotal,
    montantTarifTotal: tarifTotal,
    montantNet: netTotal,
    statut: "EN_ATTENTE" as const,
    createdByAccountId: actorAccountId ?? null,
    lignes: { create: lignes },
  };

  // Retry if the generated reference collides (concurrent create).
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.factureClient.create({
        data: { reference: await nextReference(), ...baseData },
        select: { id: true },
      });
    } catch (e) {
      const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
        && (e.meta?.target as string | undefined)?.includes("reference");
      if (collision && attempt < 4) continue;
      throw e;
    }
  }
}

export async function updateFactureClient(id: string, colisIds: string[]): Promise<{ id: string }> {
  const facture = await prisma.factureClient.findUnique({ where: { id }, select: { statut: true, clientId: true } });
  if (!facture) throw new FactureClientError("Facture introuvable.", 404);
  if (facture.statut === "PAYE") throw new FactureClientError("Une facture payée ne peut plus être modifiée.");

  const colis = await prisma.colis.findMany({
    where: {
      id: { in: colisIds },
      clientId: facture.clientId,
      statut: "LIVRE",
      // either not invoiced, or already on THIS facture
      OR: [{ factureClientLignes: { none: {} } }, { factureClientLignes: { some: { factureId: id } } }],
    },
    select: { id: true, amountToCollect: true, tarif: true },
  });
  if (colis.length !== colisIds.length || colis.length === 0) {
    throw new FactureClientError("Certains colis ne sont plus éligibles à la facturation.");
  }

  let collecteTotal = 0, tarifTotal = 0, netTotal = 0;
  const lignes = colis.map((c) => {
    const cod = Number(c.amountToCollect);
    const tarif = Number(c.tarif);
    const { collecte, aVerser } = calcLigne(cod, tarif);
    collecteTotal += collecte; tarifTotal += tarif; netTotal += aVerser;
    return { colisId: c.id, montantCollecte: collecte, tarif };
  });

  await prisma.$transaction([
    prisma.factureClientLigne.deleteMany({ where: { factureId: id } }),
    prisma.factureClient.update({
      where: { id },
      data: {
        montantColisTotal: collecteTotal,
        montantTarifTotal: tarifTotal,
        montantNet: netTotal,
        lignes: { create: lignes },
      },
    }),
  ]);
  return { id };
}

export async function setFactureClientStatus(id: string, statut: FactureStatut): Promise<void> {
  await prisma.factureClient.update({
    where: { id },
    data: { statut, paidAt: statut === "PAYE" ? new Date() : null },
  });
}

/** Detail restricted to the owning client (for the client portal). */
export async function getClientFactureDetail(clientId: string, id: string): Promise<FactureClientDetail | null> {
  const f = await getFactureClientDetail(id);
  if (!f || f.clientId !== clientId) return null;
  return f;
}

export async function getFactureClientDetail(id: string): Promise<FactureClientDetail | null> {
  const f = await prisma.factureClient.findUnique({
    where: { id },
    include: {
      client: { include: { ville: { select: { nom: true } } } },
      lignes: {
        include: { colis: { include: { destinationVille: { select: { nom: true } } } } },
        orderBy: { colis: { createdAt: "desc" } },
      },
    },
  });
  if (!f) return null;

  return {
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    clientId: f.clientId,
    client: {
      nom: f.client.nom,
      telephone: f.client.telephone,
      ville: f.client.ville.nom,
      adresse: f.client.adresse,
    },
    statut: f.statut,
    date: dtDay.format(f.createdAt),
    paidAt: f.paidAt ? dtDay.format(f.paidAt) : null,
    montantCollecte: Number(f.montantColisTotal),
    tarifTotal: Number(f.montantTarifTotal),
    montantNet: Number(f.montantNet),
    notes: f.notes,
    lignes: f.lignes.map((l) => {
      const cod = Number(l.colis.amountToCollect);
      const tarif = Number(l.tarif);
      const collecte = Number(l.montantCollecte);
      return {
        colisId: l.colisId,
        trk: l.colis.trackingNumber,
        recipient: l.colis.recipientName,
        destCity: l.colis.destinationVille.nom,
        cod,
        tarif,
        collecte,
        aVerser: collecte - tarif,
        date: dtDay.format(l.colis.createdAt),
      };
    }),
  };
}
