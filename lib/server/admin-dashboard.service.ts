import { prisma } from "@/lib/db";
import type { ColisStatut } from "@prisma/client";

const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
const dayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

// COD is considered collected once LIVRE; these statuses mean it never will be.
const FAILED: ColisStatut[] = ["ANNULE", "RETOUR", "REFUSE"];

export interface AdminKpis {
  totalColis: number;
  enLivraison: number;
  livresMois: number;
  livresMoisTrend: { value: string; up: boolean } | null;
  aEncaisser: number;
  agences: number;
  livreurs: number;
  clients: number;
  tauxLivraison: number; // %
}

export async function getAdminKpis(): Promise<AdminKpis> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalColis, enLivraison, livresMois, livresMoisPrec, codAgg,
    agences, livreurs, clients, totalLivres, totalTermines,
  ] = await Promise.all([
    prisma.colis.count(),
    prisma.colis.count({ where: { statut: { in: ["DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON"] } } }),
    prisma.colis.count({ where: { statut: "LIVRE", updatedAt: { gte: monthStart } } }),
    prisma.colis.count({ where: { statut: "LIVRE", updatedAt: { gte: prevMonthStart, lt: monthStart } } }),
    prisma.colis.aggregate({ where: { statut: { notIn: ["LIVRE", ...FAILED] } }, _sum: { amountToCollect: true } }),
    prisma.agence.count(),
    prisma.livreur.count(),
    prisma.client.count(),
    prisma.colis.count({ where: { statut: "LIVRE" } }),
    prisma.colis.count({ where: { statut: { in: ["LIVRE", ...FAILED] } } }),
  ]);

  let livresMoisTrend: AdminKpis["livresMoisTrend"] = null;
  if (livresMoisPrec > 0) {
    const pct = Math.round(((livresMois - livresMoisPrec) / livresMoisPrec) * 100);
    livresMoisTrend = { value: `${Math.abs(pct)}%`, up: pct >= 0 };
  } else if (livresMois > 0) {
    livresMoisTrend = { value: "nouveau", up: true };
  }

  return {
    totalColis,
    enLivraison,
    livresMois,
    livresMoisTrend,
    aEncaisser: Number(codAgg._sum.amountToCollect ?? 0),
    agences,
    livreurs,
    clients,
    tauxLivraison: totalTermines > 0 ? Math.round((totalLivres / totalTermines) * 100) : 0,
  };
}

export interface ActivityDay {
  jour: string;
  date: string;
  colis: number;
}

export async function getAdminActivity7j(): Promise<ActivityDay[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const rows = await prisma.colis.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const buckets: ActivityDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.push({ jour: dayLabel.format(d), date: dtDay.format(d), colis: 0 });
  }
  for (const r of rows) {
    const idx = Math.floor((new Date(r.createdAt).setHours(0, 0, 0, 0) - start.getTime()) / 86_400_000);
    if (idx >= 0 && idx < 7) buckets[idx].colis++;
  }
  return buckets;
}

export interface StatutSlice {
  statut: ColisStatut;
  count: number;
}

export async function getAdminStatutDistribution(): Promise<StatutSlice[]> {
  const grouped = await prisma.colis.groupBy({ by: ["statut"], _count: true });
  return grouped
    .map((g) => ({ statut: g.statut, count: g._count }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

export interface RecentColisRow {
  id: string;
  trk: string;
  client: string;
  pickupCity: string;
  destCity: string;
  statut: ColisStatut;
  cod: number;
}

export async function getAdminRecentColis(take = 6): Promise<RecentColisRow[]> {
  const rows = await prisma.colis.findMany({
    include: {
      client: { select: { nom: true } },
      pickupVille: { select: { nom: true } },
      destinationVille: { select: { nom: true } },
    },
    orderBy: { updatedAt: "desc" },
    take,
  });
  return rows.map((c) => ({
    id: c.id,
    trk: c.trackingNumber,
    client: c.client.nom,
    pickupCity: c.pickupVille.nom,
    destCity: c.destinationVille.nom,
    statut: c.statut,
    cod: Number(c.amountToCollect),
  }));
}
