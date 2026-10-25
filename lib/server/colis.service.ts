import { prisma } from "@/lib/db";
import type { TrackingInfo, StatusTone, TrackingEvent } from "@/lib/types/tracking";
import type { ColisRow, ColisDetail, ColisListResult } from "@/lib/types/colis";
import type { ColisStatut, VehicleType, Prisma } from "@prisma/client";
import { generateTrackingNumber, generateQrToken } from "@/lib/server/tracking";

export const STATUT_LABEL: Record<ColisStatut, string> = {
  CREE: "Colis créé",
  DISPONIBLE_A_RAMASSER: "Disponible à ramasser",
  AFFECTE_RAMASSAGE: "Affecté au ramassage",
  RAMASSE: "Ramassé",
  RECU_ENTREPOT_SOURCE: "Reçu à l'entrepôt",
  EN_EXPEDITION: "En expédition",
  RECU_PAR_AGENCE_DEST: "Reçu par l'agence de destination",
  DISPATCHE_LIVREUR: "Dispatché au livreur",
  EN_COURS_DE_LIVRAISON: "En cours de livraison",
  LIVRE: "Livré",
  REPORTE: "Reporté",
  PAS_DE_REPONSE: "Pas de réponse",
  REFUSE: "Refusé",
  RETOUR: "Retour",
  ANNULE: "Annulé",
};

const STATUT_TONE: Record<ColisStatut, StatusTone> = {
  CREE: "pending",
  DISPONIBLE_A_RAMASSER: "pending",
  AFFECTE_RAMASSAGE: "pending",
  RAMASSE: "progress",
  RECU_ENTREPOT_SOURCE: "progress",
  EN_EXPEDITION: "progress",
  RECU_PAR_AGENCE_DEST: "progress",
  DISPATCHE_LIVREUR: "progress",
  EN_COURS_DE_LIVRAISON: "progress",
  LIVRE: "done",
  REPORTE: "progress",
  PAS_DE_REPONSE: "progress",
  REFUSE: "failed",
  RETOUR: "failed",
  ANNULE: "failed",
};

const VEHICLE_LABEL: Record<VehicleType, string> = {
  MOTO: "Moto",
  VOITURE: "Voiture",
  CAMION: "Camion",
};

const TERMINAL: ColisStatut[] = ["LIVRE", "RETOUR", "ANNULE", "REFUSE"];

const dtFull = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
});
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export const PER_PAGE = 20;

// ─── Public tracking (used by /suivi) ────────────────────
export async function getColisTracking(trk: string): Promise<TrackingInfo | null> {
  const colis = await prisma.colis.findUnique({
    where: { trackingNumber: trk },
    include: {
      pickupVille: { select: { nom: true } },
      destinationVille: { select: { nom: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!colis) return null;
  const isTerminal = TERMINAL.includes(colis.statut);
  const lastIndex = colis.events.length - 1;
  const events: TrackingEvent[] = colis.events.map((e, i) => ({
    label: e.label || STATUT_LABEL[e.statut],
    city: e.city ?? undefined,
    date: dtFull.format(e.createdAt),
    stage: !isTerminal && i === lastIndex ? "current" : "done",
  }));
  return {
    trk: colis.trackingNumber,
    status: STATUT_LABEL[colis.statut],
    statusTone: STATUT_TONE[colis.statut],
    pickupCity: colis.pickupVille.nom,
    destinationCity: colis.destinationVille.nom,
    recipientName: colis.recipientName,
    vehicle: VEHICLE_LABEL[colis.vehicleType],
    demo: false,
    events,
  };
}

// ─── Admin list (filters + pagination) ───────────────────
export type ColisFilters = {
  statut?: string;
  depart?: string;
  destination?: string;
  vehicle?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export async function listColis(
  filters: ColisFilters,
  page = 1,
  perPage = PER_PAGE,
): Promise<ColisListResult> {
  const where: Prisma.ColisWhereInput = {};
  if (filters.statut) where.statut = filters.statut as ColisStatut;
  if (filters.vehicle) where.vehicleType = filters.vehicle as VehicleType;
  if (filters.depart) where.pickupVille = { nom: filters.depart };
  if (filters.destination) where.destinationVille = { nom: filters.destination };
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const d = new Date(filters.dateTo);
      d.setHours(23, 59, 59, 999);
      where.createdAt.lte = d;
    }
  }
  if (filters.search) {
    where.OR = [
      { trackingNumber: { contains: filters.search } },
      { recipientName: { contains: filters.search } },
      { client: { is: { nom: { contains: filters.search } } } },
    ];
  }

  const safePage = Math.max(1, page);
  const [total, rows] = await Promise.all([
    prisma.colis.count({ where }),
    prisma.colis.findMany({
      where,
      include: {
        client: { select: { nom: true } },
        pickupVille: { select: { nom: true } },
        destinationVille: { select: { nom: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const mapped: ColisRow[] = rows.map((c) => ({
    id: c.id,
    trk: c.trackingNumber,
    client: c.client.nom,
    pickupCity: c.pickupVille.nom,
    destCity: c.destinationVille.nom,
    type: c.type,
    statut: c.statut,
    vehicle: c.vehicleType,
    tarif: Number(c.tarif),
    cod: Number(c.amountToCollect),
    date: dtDay.format(c.createdAt),
  }));

  return { rows: mapped, total, page: safePage, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// ─── Detail (view / edit / ticket) ───────────────────────
export async function getColisDetail(trk: string): Promise<ColisDetail | null> {
  const c = await prisma.colis.findUnique({
    where: { trackingNumber: trk },
    include: {
      client: { select: { id: true, nom: true, telephone: true } },
      pickupVille: { select: { nom: true } },
      destinationVille: { select: { nom: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!c) return null;

  const isTerminal = TERMINAL.includes(c.statut);
  const lastIndex = c.events.length - 1;

  return {
    id: c.id,
    trk: c.trackingNumber,
    clientId: c.clientId,
    client: c.client.nom,
    clientPhone: c.client.telephone,
    statut: c.statut,
    type: c.type,
    pickupCity: c.pickupVille.nom,
    pickupAddress: c.pickupAddress,
    pickupLat: c.pickupLat,
    pickupLng: c.pickupLng,
    recipient: c.recipientName,
    recipientPhone: c.recipientPhone,
    destCity: c.destinationVille.nom,
    destAddress: c.destinationAddress,
    destLat: c.destinationLat,
    destLng: c.destinationLng,
    destMapLink: c.destinationMapLink,
    vehicle: c.vehicleType,
    parcelCount: c.parcelCount,
    contents: c.contents,
    cod: Number(c.amountToCollect),
    tarif: Number(c.tarif),
    notes: c.notes,
    date: dtDay.format(c.createdAt),
    events: c.events.map((e, i) => ({
      statut: e.statut,
      label: e.label || STATUT_LABEL[e.statut],
      city: e.city ?? undefined,
      note: e.note ?? undefined,
      date: dtFull.format(e.createdAt),
      stage: !isTerminal && i === lastIndex ? "current" : "done",
    })),
  };
}

// ─── Mutations ───────────────────────────────────────────
export type CreateColisData = {
  clientId: string;
  pickupCity: string;
  pickupAddress: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  recipient: string;
  recipientPhone: string;
  destCity: string;
  destAddress: string;
  destLat?: number | null;
  destLng?: number | null;
  destMapLink?: string | null;
  vehicle: VehicleType;
  parcelCount: number;
  contents: string;
  cod: number;
  tarif: number;
  notes?: string | null;
};

async function villeId(nom: string): Promise<string> {
  const v = await prisma.ville.upsert({ where: { nom }, update: {}, create: { nom } });
  return v.id;
}

export async function createColis(data: CreateColisData, actorAccountId?: string | null) {
  const [pickupVilleId, destinationVilleId] = await Promise.all([
    villeId(data.pickupCity),
    villeId(data.destCity),
  ]);
  const type = data.pickupCity === data.destCity ? "INTRA" : "INTER";
  const colis = await prisma.colis.create({
    data: {
      trackingNumber: generateTrackingNumber(),
      qrToken: generateQrToken(),
      clientId: data.clientId,
      type,
      statut: "CREE",
      pickupVilleId,
      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat ?? null,
      pickupLng: data.pickupLng ?? null,
      recipientName: data.recipient,
      recipientPhone: data.recipientPhone,
      destinationVilleId,
      destinationAddress: data.destAddress,
      destinationLat: data.destLat ?? null,
      destinationLng: data.destLng ?? null,
      destinationMapLink: data.destMapLink ?? null,
      vehicleType: data.vehicle,
      parcelCount: data.parcelCount,
      contents: data.contents,
      amountToCollect: data.cod,
      tarif: data.tarif,
      notes: data.notes ?? null,
      events: {
        create: { statut: "CREE", label: "Colis créé", city: data.pickupCity, createdByAccountId: actorAccountId ?? null },
      },
    },
    select: { id: true, trackingNumber: true },
  });
  return colis;
}

export async function updateColis(id: string, data: CreateColisData) {
  const [pickupVilleId, destinationVilleId] = await Promise.all([
    villeId(data.pickupCity),
    villeId(data.destCity),
  ]);
  const type = data.pickupCity === data.destCity ? "INTRA" : "INTER";
  return prisma.colis.update({
    where: { id },
    data: {
      type,
      pickupVilleId,
      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat ?? null,
      pickupLng: data.pickupLng ?? null,
      recipientName: data.recipient,
      recipientPhone: data.recipientPhone,
      destinationVilleId,
      destinationAddress: data.destAddress,
      destinationLat: data.destLat ?? null,
      destinationLng: data.destLng ?? null,
      destinationMapLink: data.destMapLink ?? null,
      vehicleType: data.vehicle,
      parcelCount: data.parcelCount,
      contents: data.contents,
      amountToCollect: data.cod,
      tarif: data.tarif,
      notes: data.notes ?? null,
    },
    select: { id: true, trackingNumber: true },
  });
}

export async function updateColisStatus(
  id: string,
  statut: ColisStatut,
  note: string | null,
  actorAccountId?: string | null,
) {
  await prisma.colis.update({ where: { id }, data: { statut } });
  await prisma.colisEvent.create({
    data: { colisId: id, statut, label: STATUT_LABEL[statut], note: note || null, createdByAccountId: actorAccountId ?? null },
  });
}
