import type { FactureStatut } from "@prisma/client";

export type { FactureStatut };

export interface FactureLivreurLigneView {
  colisId: string;
  trk: string;
  recipient: string;
  trajet: string; // "Ville X → Ville Y"
  role: string; // "Ramassage + Livraison" | "Ramassage" | "Livraison"
  cod: number;
  tarif: number;
  commission: number;
  date: string;
}

export interface FactureLivreurRow {
  id: string;
  reference: string;
  livreurId: string;
  livreur: string;
  agence: string;
  colisCount: number;
  montantCollecte: number;
  commission: number;
  montantAVerser: number;
  statut: FactureStatut;
  date: string;
}

export interface FactureLivreurListResult {
  rows: FactureLivreurRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FactureLivreurTotals {
  count: number;
  montantCollecte: number;
  commission: number;
  montantAVerser: number;
  nonPayeAVerser: number;
}

export interface FactureLivreurDetail {
  id: string;
  reference: string;
  livreur: { nom: string; prenom: string; telephone: string; ville: string; agence: string };
  statut: FactureStatut;
  date: string;
  paidAt: string | null;
  pieceJointeUrl: string | null;
  montantCollecte: number;
  tarifTotal: number;
  commission: number;
  montantAVerser: number;
  notes: string | null;
  lignes: FactureLivreurLigneView[];
}
