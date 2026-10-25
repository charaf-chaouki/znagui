import type { RamassageStatut, LigneStatut } from "@prisma/client";

export type { RamassageStatut, LigneStatut };

/** Per-colis state inside a ramassage, as the agence/livreur sees it. */
export type ColisRamassageState = "EN_ATTENTE" | "RAMASSE" | "ENTREPOT";

export interface AvailableColis {
  id: string;
  trk: string;
  client: string;
  destCity: string;
  pickupAddress: string;
  cod: number;
  tarif: number;
}

export interface RamassageRow {
  id: string;
  reference: string;
  agence: string;
  livreur: string;
  colisCount: number;
  recus: number; // colis received at entrepôt
  statut: RamassageStatut;
  date: string;
}

export interface RamassageListResult {
  rows: RamassageRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface RamassageLineView {
  colisId: string;
  trk: string;
  client: string;
  recipient: string;
  destCity: string;
  pickupAddress: string;
  cod: number;
  state: ColisRamassageState;
}

export interface RamassageDetail {
  id: string;
  reference: string;
  agenceId: string;
  livreurId: string;
  livreur: string;
  agence: string;
  statut: RamassageStatut;
  date: string;
  notes: string | null;
  total: number;
  recus: number;
  ramasses: number;
  lignes: RamassageLineView[];
}
