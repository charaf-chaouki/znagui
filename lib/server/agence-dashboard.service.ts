import { prisma } from "@/lib/db";
import { tabWhere } from "@/lib/server/agence-colis.service";
import type { ColisStatut } from "@prisma/client";

const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
const dayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

export interface AgenceKpis {
  colisVille: number;
  aRamasser: number;
  enLivraison: number;
  livresMois: number;
  ramassagesActifs: number;
  livreurs: number;
  codAEncaisser: number;
  aVerserDirection: number;
}

export async function getAgenceKpis(agenceId: string, villeId: string): Promise<AgenceKpis> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    colisVille, aRamasser, enLivraison, livresMois, ramassagesActifs, livreurs, codAgg, verserAgg,
  ] = await Promise.all([
    prisma.colis.count({ where: { pickupVilleId: villeId } }),
    prisma.colis.count({ where: { agenceRamassageId: null, pickupVilleId: villeId, statut: { in: ["CREE", "DISPONIBLE_A_RAMASSER"] } } }),
    prisma.colis.count({ where: { agenceLivraisonId: agenceId, statut: { in: ["DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON"] } } }),
    prisma.colis.count({
      where: {
        statut: "LIVRE",
        updatedAt: { gte: monthStart },
        OR: [{ agenceLivraisonId: agenceId }, { agenceLivraisonId: null, agenceRamassageId: agenceId }],
      },
    }),
    prisma.ramassage.count({ where: { agenceId, statut: { in: ["PLANIFIE", "EN_COURS"] } } }),
    prisma.livreur.count({ where: { agenceId } }),
    prisma.colis.aggregate({
      where: { agenceLivraisonId: agenceId, statut: { in: ["RECU_PAR_AGENCE_DEST", "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON"] } },
      _sum: { amountToCollect: true },
    }),
    prisma.factureAgence.aggregate({
      where: { agenceId, statut: { not: "PAYE" } },
      _sum: { montantAVerser: true },
    }),
  ]);

  return {
    colisVille,
    aRamasser,
    enLivraison,
    livresMois,
    ramassagesActifs,
    livreurs,
    codAEncaisser: Number(codAgg._sum.amountToCollect ?? 0),
    aVerserDirection: Number(verserAgg._sum.montantAVerser ?? 0),
  };
}

export interface ActivityDay {
  jour: string;
  date: string;
  colis: number;
}

/** Colis created in the agence's ville over the last 7 days (today included). */
export async function getAgenceActivity7j(villeId: string): Promise<ActivityDay[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const rows = await prisma.colis.findMany({
    where: { pickupVilleId: villeId, createdAt: { gte: start } },
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

/** Distribution of this agence's colis by status (its full scope). */
export async function getAgenceStatutDistribution(agenceId: string, villeId: string): Promise<StatutSlice[]> {
  const grouped = await prisma.colis.groupBy({
    by: ["statut"],
    where: tabWhere(agenceId, villeId, "tous"),
    _count: true,
  });
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

export async function getAgenceRecentColis(agenceId: string, villeId: string, take = 6): Promise<RecentColisRow[]> {
  const rows = await prisma.colis.findMany({
    where: tabWhere(agenceId, villeId, "tous"),
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
