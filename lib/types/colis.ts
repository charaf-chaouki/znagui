import type { TrackingStage } from "@/lib/types/tracking";

export type ColisType = "INTRA" | "INTER";
export type VehicleType = "MOTO" | "VOITURE" | "CAMION";

export type ColisStatut =
  | "CREE"
  | "DISPONIBLE_A_RAMASSER"
  | "AFFECTE_RAMASSAGE"
  | "RAMASSE"
  | "RECU_ENTREPOT_SOURCE"
  | "EN_EXPEDITION"
  | "RECU_PAR_AGENCE_DEST"
  | "DISPATCHE_LIVREUR"
  | "EN_COURS_DE_LIVRAISON"
  | "LIVRE"
  | "REPORTE"
  | "PAS_DE_REPONSE"
  | "REFUSE"
  | "RETOUR"
  | "ANNULE";

export interface Ville {
  id: string;
  nom: string;
}

/** A row in the admin colis table. */
export interface ColisRow {
  id: string;
  trk: string;
  client: string;
  pickupCity: string;
  destCity: string;
  type: ColisType;
  statut: ColisStatut;
  vehicle: VehicleType;
  tarif: number;
  cod: number;
  date: string;
}

export interface ColisListResult {
  rows: ColisRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ColisHistoEvent {
  statut: ColisStatut;
  label: string;
  city?: string;
  note?: string;
  date: string;
  stage: TrackingStage;
}

export interface ColisDetail {
  id: string;
  trk: string;
  clientId: string;
  client: string;
  clientPhone: string;
  statut: ColisStatut;
  type: ColisType;
  pickupCity: string;
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  recipient: string;
  recipientPhone: string;
  destCity: string;
  destAddress: string;
  destLat: number | null;
  destLng: number | null;
  destMapLink: string | null;
  vehicle: VehicleType;
  parcelCount: number;
  contents: string;
  cod: number;
  tarif: number;
  notes: string | null;
  date: string;
  events: ColisHistoEvent[];
}
