import type { FactureStatut } from "@prisma/client";

export type { FactureStatut };

export interface FactureAgenceLigneView {
  colisId: string;
  trk: string;
  recipient: string;
  trajet: string; // "Ville X → Ville Y"
  role: string; // "Agence source" | "Agence destination"
  tarif: number;
  collecte: number; // COD collected by this agence (0 for source/ramassage)
  commission: number;
  montantAVerser: number; // collecte − commission (0 for source/ramassage)
  date: string;
}

export interface FactureAgenceRow {
  id: string;
  reference: string;
  agenceId: string;
  agence: string;
  ville: string;
  colisCount: number;
  montantTarifTotal: number;
  montantCollecte: number;
  commission: number;
  montantAVerser: number;
  statut: FactureStatut;
  date: string;
}

export interface FactureAgenceListResult {
  rows: FactureAgenceRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FactureAgenceTotals {
  count: number;
  montantTarifTotal: number;
  montantCollecte: number;
  commission: number;
  montantAVerser: number;
  nonPayeCommission: number;
  nonPayeAVerser: number;
}

export interface FactureAgenceDetail {
  id: string;
  reference: string;
  agence: { nom: string; ville: string; telephone: string | null; adresse: string | null };
  statut: FactureStatut;
  date: string;
  paidAt: string | null;
  pieceJointeUrl: string | null;
  montantTarifTotal: number;
  montantCollecte: number;
  commission: number;
  montantAVerser: number;
  notes: string | null;
  lignes: FactureAgenceLigneView[];
}
