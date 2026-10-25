import { prisma } from "@/lib/db";
import { createColis, updateColis, type CreateColisData } from "@/lib/server/colis.service";
import { autoTarifForVehicle } from "@/lib/server/pricing";
import { haversineKm } from "@/lib/geo";
import type {
  ClientColisRow, ClientColisListResult, ClientDashboard, ClientFactureRow, ClientProfile,
} from "@/lib/types/client-portal";
import type { ColisStatut } from "@prisma/client";

export const PER_PAGE = 20;

/** Thrown when a client acts on a colis that isn't theirs or can no longer be edited. */
export class ClientColisError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

// Colis still in flight (everything but the terminal states).
const EN_COURS: ColisStatut[] = [
  "CREE", "DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE", "RAMASSE",
  "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION", "RECU_PAR_AGENCE_DEST",
  "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "REPORTE", "PAS_DE_REPONSE",
];
// Money no longer expected (parcel cancelled / refused / returned).
const COD_LOST: ColisStatut[] = ["ANNULE", "REFUSE", "RETOUR"];

function rowOf(c: {
  id: string; trackingNumber: string; recipientName: string;
  destinationVille: { nom: string }; statut: ColisStatut;
  amountToCollect: unknown; tarif: unknown; createdAt: Date;
}): ClientColisRow {
  return {
    id: c.id,
    trk: c.trackingNumber,
    recipient: c.recipientName,
    destCity: c.destinationVille.nom,
    statut: c.statut,
    cod: Number(c.amountToCollect),
    tarif: Number(c.tarif),
    date: dtDay.format(c.createdAt),
  };
}

const ROW_INCLUDE = { destinationVille: { select: { nom: true } } } as const;

export async function getClientDashboard(clientId: string): Promise<ClientDashboard> {
  const [totalColis, enCours, livres, codAgg, recent] = await Promise.all([
    prisma.colis.count({ where: { clientId } }),
    prisma.colis.count({ where: { clientId, statut: { in: EN_COURS } } }),
    prisma.colis.count({ where: { clientId, statut: "LIVRE" } }),
    prisma.colis.aggregate({
      where: { clientId, statut: { notIn: COD_LOST } },
      _sum: { amountToCollect: true },
    }),
    prisma.colis.findMany({
      where: { clientId },
      include: ROW_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalColis,
    enCours,
    livres,
    codAttendu: Number(codAgg._sum.amountToCollect ?? 0),
    recent: recent.map(rowOf),
  };
}

export async function listClientColis(
  clientId: string,
  page = 1,
  perPage = PER_PAGE,
): Promise<ClientColisListResult> {
  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.colis.count({ where: { clientId } }),
    prisma.colis.findMany({
      where: { clientId },
      include: ROW_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);
  return {
    rows: rows.map(rowOf),
    total,
    page: safePage,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function listClientFactures(clientId: string): Promise<ClientFactureRow[]> {
  const rows = await prisma.factureClient.findMany({
    where: { clientId },
    include: { _count: { select: { lignes: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((f) => ({
    id: f.id,
    reference: f.reference ?? f.id.slice(0, 8).toUpperCase(),
    montantNet: Number(f.montantNet),
    statut: f.statut,
    colisCount: f._count.lignes,
    date: dtDay.format(f.createdAt),
  }));
}

// ─── Client-scoped colis mutations ───────────────────────
// A client may only create colis for themselves and edit them while still CREE.

/**
 * Clients do not choose the price for distance-priced vehicles (VOITURE/CAMION):
 * clamp the submitted tarif to at least the auto floor (per-km × straight-line
 * distance, with the vehicle minimum) so the UI value can't be under-submitted.
 */
function enforceClientTarif(data: Omit<CreateColisData, "clientId">): number {
  if (data.vehicle !== "VOITURE" && data.vehicle !== "CAMION") return data.tarif;
  let km: number | null = null;
  if (data.pickupLat != null && data.pickupLng != null && data.destLat != null && data.destLng != null) {
    km = haversineKm(
      { lat: data.pickupLat, lng: data.pickupLng },
      { lat: data.destLat, lng: data.destLng },
    );
  }
  const floor = autoTarifForVehicle(data.vehicle, km) ?? 0;
  return Math.max(data.tarif ?? 0, floor);
}

export async function createClientColis(
  clientId: string,
  data: Omit<CreateColisData, "clientId">,
  accountId: string,
) {
  return createColis({ ...data, clientId, tarif: enforceClientTarif(data) }, accountId);
}

export async function updateClientColis(
  clientId: string,
  colisId: string,
  data: Omit<CreateColisData, "clientId">,
) {
  const colis = await prisma.colis.findUnique({
    where: { id: colisId },
    select: { clientId: true, statut: true },
  });
  if (!colis || colis.clientId !== clientId) throw new ClientColisError("Colis introuvable.", 404);
  if (colis.statut !== "CREE") throw new ClientColisError("Ce colis ne peut plus être modifié.", 409);
  return updateColis(colisId, { ...data, clientId, tarif: enforceClientTarif(data) });
}

export async function getClientProfile(clientId: string): Promise<ClientProfile | null> {
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    include: { ville: { select: { nom: true } }, account: { select: { email: true } } },
  });
  if (!c) return null;
  return {
    nom: c.nom,
    telephone: c.telephone,
    cni: c.cni,
    ville: c.ville.nom,
    adresse: c.adresse,
    email: c.account.email ?? "—",
    banque: c.banque,
    rib: c.rib,
    memberSince: dtDay.format(c.createdAt),
  };
}
