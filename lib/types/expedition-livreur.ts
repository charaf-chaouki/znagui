import type { ExpeditionLivreurStatut } from "@prisma/client";

export type { ExpeditionLivreurStatut };

export type DispatchColisState = "DISPATCHE" | "EN_LIVRAISON" | "LIVRE" | "ECHEC";

export interface AvailableDispatchColis {
  id: string;
  trk: string;
  recipient: string;
  destCity: string;
  destAddress: string;
  cod: number;
}

export interface ExpeditionLivreurRow {
  id: string;
  reference: string;
  agence: string;
  livreur: string;
  colisCount: number;
  livres: number;
  statut: ExpeditionLivreurStatut;
  date: string;
}

export interface ExpeditionLivreurLineView {
  colisId: string;
  trk: string;
  recipient: string;
  destCity: string;
  destAddress: string;
  cod: number;
  state: DispatchColisState;
}

export interface ExpeditionLivreurDetail {
  id: string;
  reference: string;
  agenceId: string;
  livreurId: string;
  agence: string;
  livreur: string;
  statut: ExpeditionLivreurStatut;
  date: string;
  total: number;
  livres: number;
  recus: number; // received by livreur (en livraison or delivered)
  lignes: ExpeditionLivreurLineView[];
}
