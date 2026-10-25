import type { ColisStatut } from "@/lib/types/colis";

export type LivreurColisGroup = "EN_COURS" | "LIVRE" | "ECHOUEE";

export interface LivreurColisCard {
  id: string;
  trk: string;
  recipient: string;
  recipientPhone: string;
  pickupCity: string;
  destCity: string;
  destAddress: string;
  cod: number;
  tarif: number;
  statut: ColisStatut;
  date: string;
}

export interface LivreurColisListResult {
  rows: LivreurColisCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface LivreurDashboard {
  prenom: string;
  nom: string;
  agence: string;
  ville: string;
  aRamasser: number;
  enLivraison: number;
  livresAujourdhui: number;
  codAEncaisser: number;
  tournee: LivreurColisCard[]; // next deliveries
}

/** Statuses a livreur can set along the pickup → delivery flow. */
export type LivreurActionStatut =
  | "RAMASSE"
  | "EN_COURS_DE_LIVRAISON"
  | "LIVRE"
  | "REPORTE"
  | "PAS_DE_REPONSE"
  | "REFUSE"
  | "RETOUR";
