import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { createColis, updateColis } from "@/lib/server/colis.service";
import { hashPassword } from "@/lib/auth/password";
import type { AgenceColisInput } from "@/lib/server/validators/colis";
import type { ColisRow, ColisListResult } from "@/lib/types/colis";
import type { Prisma, ColisStatut } from "@prisma/client";

export const PER_PAGE = 20;

export class AgenceColisError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
const dtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export type AgenceColisTab =
  | "tous" | "nouveaux" | "ramassage" | "entrepot" | "expedies" | "recus" | "livraison" | "termines";

const SOURCE_STATUTS: ColisStatut[] = ["AFFECTE_RAMASSAGE", "RAMASSE", "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION"];
const DEST_STATUTS: ColisStatut[] = ["RECU_PAR_AGENCE_DEST", "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE", "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE"];
const TERMINAL: ColisStatut[] = ["LIVRE", "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE"];

/** Where-clause for one tab (agence A, ville V).
 *  An agence only operates in its own ville: it is the ramassage agence for
 *  colis picked up in V, and the livraison agence for colis delivered to V. The
 *  ville guards below enforce that relation in the query, so a colis wrongly
 *  tagged with another ville's agence never leaks into this agence's lists. */
export function tabWhere(agenceId: string, villeId: string, tab: AgenceColisTab): Prisma.ColisWhereInput {
  // Source side (ramassage): colis this agence picks up — pickup in its ville.
  const source = { agenceRamassageId: agenceId, pickupVilleId: villeId };
  // Destination side (livraison): colis this agence delivers — destination in its ville.
  const dest = { agenceLivraisonId: agenceId, destinationVilleId: villeId };
  const nouveaux: Prisma.ColisWhereInput = {
    agenceRamassageId: null,
    pickupVilleId: villeId,
    statut: { in: ["CREE", "DISPONIBLE_A_RAMASSER"] },
  };
  switch (tab) {
    case "nouveaux": return nouveaux;
    case "ramassage": return { ...source, statut: { in: ["AFFECTE_RAMASSAGE", "RAMASSE"] } };
    case "entrepot": return { ...source, statut: "RECU_ENTREPOT_SOURCE" };
    case "expedies": return { ...source, statut: "EN_EXPEDITION" };
    case "recus": return { ...dest, statut: "RECU_PAR_AGENCE_DEST" };
    case "livraison": return { ...dest, statut: { in: ["DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON"] } };
    case "termines":
      // Delivered / failed-during-delivery → the delivery agence; failed before shipping → the source agence.
      return { statut: { in: TERMINAL }, OR: [dest, { agenceLivraisonId: null, ...source }] };
    case "tous":
    default:
      return {
        OR: [
          { ...source, statut: { in: SOURCE_STATUTS } },
          { ...dest, statut: { in: DEST_STATUTS } },
          { agenceLivraisonId: null, ...source, statut: { in: TERMINAL } },
          nouveaux,
        ],
      };
  }
}

export async function getAgenceColisTabCounts(agenceId: string, villeId: string): Promise<Record<AgenceColisTab, number>> {
  const tabs: AgenceColisTab[] = ["tous", "nouveaux", "ramassage", "entrepot", "expedies", "recus", "livraison", "termines"];
  const counts = await Promise.all(tabs.map((t) => prisma.colis.count({ where: tabWhere(agenceId, villeId, t) })));
  return Object.fromEntries(tabs.map((t, i) => [t, counts[i]])) as Record<AgenceColisTab, number>;
}

export async function listAgenceColis(
  agenceId: string,
  villeId: string,
  tab: AgenceColisTab,
  filters: { search?: string },
  page = 1,
  perPage = PER_PAGE,
): Promise<ColisListResult> {
  const where = tabWhere(agenceId, villeId, tab);
  if (filters.search) {
    where.AND = [{
      OR: [
        { trackingNumber: { contains: filters.search } },
        { recipientName: { contains: filters.search } },
        { client: { is: { nom: { contains: filters.search } } } },
      ],
    }];
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
      orderBy: { updatedAt: "desc" },
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

// ─────────────────────────────────────────────────────────────────────────────
// Agence counter drop-off ("dépôt en agence")
//
// The parcel is physically handed over at the agence, so the whole pickup
// (ramassage) phase is skipped. The colis starts already received:
//   • INTER (dest ≠ agence ville) → RECU_ENTREPOT_SOURCE, source = this agence
//                                    → flows into the normal inter-agence expedition
//   • INTRA (dest = agence ville) → RECU_PAR_AGENCE_DEST, source & dest = this agence
//                                    → ready for immediate dispatch to a local livreur
// ─────────────────────────────────────────────────────────────────────────────

/** Clients the agence can pick as the sender (any client, newest first by name). */
export async function listAgenceClients(): Promise<{ id: string; nom: string }[]> {
  return prisma.client.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });
}

/** Resolve the sender: an existing client, a reused walk-in (same phone), or a
 *  freshly created "comptoir" client (no-login account). */
async function resolveSender(villeId: string, data: AgenceColisInput): Promise<string> {
  if (data.clientId) {
    const c = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } });
    if (c) return c.id;
  }
  if (data.newClient) {
    const tel = data.newClient.telephone.trim();
    const existing = await prisma.client.findFirst({ where: { telephone: tel }, select: { id: true } });
    if (existing) return existing.id;
    const account = await prisma.account.create({
      data: {
        role: "CLIENT",
        status: "INACTIVE", // comptoir account: no login
        passwordHash: await hashPassword(randomBytes(16).toString("hex")),
        client: { create: { nom: data.newClient.nom.trim(), telephone: tel, villeId } },
      },
      select: { client: { select: { id: true } } },
    });
    if (account.client) return account.client.id;
  }
  throw new AgenceColisError("Client requis.", 400);
}

async function agencePickup(agenceId: string, villeId: string): Promise<{ city: string; address: string }> {
  const [agence, ville] = await Promise.all([
    prisma.agence.findUnique({ where: { id: agenceId }, select: { adresse: true } }),
    prisma.ville.findUnique({ where: { id: villeId }, select: { nom: true } }),
  ]);
  return { city: ville?.nom ?? "", address: agence?.adresse?.trim() || "Déposé en agence" };
}

function dropOffState(pickupCity: string, destCity: string, agenceId: string) {
  const intra = pickupCity === destCity;
  return {
    statut: (intra ? "RECU_PAR_AGENCE_DEST" : "RECU_ENTREPOT_SOURCE") as ColisStatut,
    agenceRamassageId: agenceId,
    agenceLivraisonId: intra ? agenceId : null,
  };
}

export async function createAgenceColis(
  agenceId: string,
  villeId: string,
  data: AgenceColisInput,
  actorAccountId: string,
) {
  const pickup = await agencePickup(agenceId, villeId);
  const clientId = await resolveSender(villeId, data);

  const base = await createColis(
    {
      clientId,
      pickupCity: pickup.city,
      pickupAddress: pickup.address,
      pickupLat: null,
      pickupLng: null,
      recipient: data.recipient,
      recipientPhone: data.recipientPhone,
      destCity: data.destCity,
      destAddress: data.destAddress,
      destLat: data.destLat ?? null,
      destLng: data.destLng ?? null,
      destMapLink: data.destMapLink ?? null,
      vehicle: data.vehicle,
      parcelCount: data.parcelCount,
      contents: data.contents,
      cod: data.cod,
      tarif: data.tarif,
      notes: data.notes ?? null,
    },
    actorAccountId,
  );

  const state = dropOffState(pickup.city, data.destCity, agenceId);
  await prisma.colis.update({ where: { id: base.id }, data: state });
  await prisma.colisEvent.create({
    data: {
      colisId: base.id,
      statut: state.statut,
      label: "Déposé en agence (comptoir)",
      city: pickup.city,
      createdByAccountId: actorAccountId,
    },
  });
  return base;
}

/** True when the colis is part of this agence's workload (source or destination,
 *  or an unassigned colis waiting in the agence's ville). */
export async function agenceCanAccessColis(agenceId: string, villeId: string, colisId: string): Promise<boolean> {
  const c = await prisma.colis.findFirst({
    where: {
      id: colisId,
      OR: [
        { agenceRamassageId: agenceId },
        { agenceLivraisonId: agenceId },
        { agenceRamassageId: null, pickupVilleId: villeId },
      ],
    },
    select: { id: true },
  });
  return Boolean(c);
}

export async function updateAgenceColis(
  agenceId: string,
  villeId: string,
  colisId: string,
  data: AgenceColisInput,
  _actorAccountId: string,
) {
  // Editable only while the drop-off is still at the agence (not shipped/dispatched).
  const colis = await prisma.colis.findFirst({
    where: {
      id: colisId,
      OR: [{ agenceRamassageId: agenceId }, { agenceLivraisonId: agenceId }],
      statut: { in: ["RECU_ENTREPOT_SOURCE", "RECU_PAR_AGENCE_DEST"] },
    },
    select: { id: true, clientId: true },
  });
  if (!colis) throw new AgenceColisError("Ce colis ne peut plus être modifié.", 409);

  const pickup = await agencePickup(agenceId, villeId);
  const clientId = data.clientId || data.newClient ? await resolveSender(villeId, data) : colis.clientId;

  await updateColis(colisId, {
    clientId,
    pickupCity: pickup.city,
    pickupAddress: pickup.address,
    pickupLat: null,
    pickupLng: null,
    recipient: data.recipient,
    recipientPhone: data.recipientPhone,
    destCity: data.destCity,
    destAddress: data.destAddress,
    destLat: data.destLat ?? null,
    destLng: data.destLng ?? null,
    destMapLink: data.destMapLink ?? null,
    vehicle: data.vehicle,
    parcelCount: data.parcelCount,
    contents: data.contents,
    cod: data.cod,
    tarif: data.tarif,
    notes: data.notes ?? null,
  });

  // Re-derive the drop-off routing (dest ville may have changed INTRA↔INTER).
  await prisma.colis.update({ where: { id: colisId }, data: dropOffState(pickup.city, data.destCity, agenceId) });
  return { id: colisId };
}
