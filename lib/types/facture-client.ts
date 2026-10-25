import type { FactureStatut } from "@prisma/client";

export type { FactureStatut };

/** A LIVRE colis eligible to be invoiced (not yet on any facture). */
export interface UninvoicedColis {
  id: string;
  trk: string;
  recipient: string;
  destCity: string;
  cod: number;
  tarif: number;
  collecte: number;
  aVerser: number;
  date: string;
}

/** A line inside a facture (one colis). */
export interface FactureLigneView {
  colisId: string;
  trk: string;
  recipient: string;
  destCity: string;
  cod: number;
  tarif: number;
  collecte: number;
  aVerser: number;
  date: string;
}

export interface FactureClientRow {
  id: string;
  reference: string;
  clientId: string;
  client: string;
  colisCount: number;
  montantCollecte: number;
  tarifTotal: number;
  montantNet: number;
  statut: FactureStatut;
  date: string;
}

export interface FactureClientListResult {
  rows: FactureClientRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FactureClientTotals {
  count: number;
  montantCollecte: number;
  tarifTotal: number;
  montantNet: number;
  nonPayeNet: number;
}

export interface FactureClientDetail {
  id: string;
  reference: string;
  clientId: string;
  client: { nom: string; telephone: string; ville: string; adresse: string | null };
  statut: FactureStatut;
  date: string;
  paidAt: string | null;
  montantCollecte: number;
  tarifTotal: number;
  montantNet: number;
  notes: string | null;
  lignes: FactureLigneView[];
}
