import type { ExpeditionStatut } from "@prisma/client";

export type { ExpeditionStatut };

export type ExpeditionDirection = "envoi" | "reception";

export interface AvailableExpColis {
  id: string;
  trk: string;
  client: string;
  recipient: string;
  destCity: string;
  destVilleId: string;
  cod: number;
}

export interface ExpeditionRow {
  id: string;
  reference: string;
  agenceSource: string;
  agenceDest: string;
  colisCount: number;
  recus: number;
  statut: ExpeditionStatut;
  date: string;
}

export interface ExpeditionLineView {
  colisId: string;
  trk: string;
  recipient: string;
  destCity: string;
  received: boolean;
}

export interface ExpeditionDetail {
  id: string;
  reference: string;
  agenceSourceId: string;
  agenceDestId: string;
  agenceSource: string;
  agenceSourceVille: string;
  agenceDest: string;
  agenceDestVille: string;
  statut: ExpeditionStatut;
  date: string;
  sentAt: string | null;
  receivedAt: string | null;
  notes: string | null;
  total: number;
  recus: number;
  lignes: ExpeditionLineView[];
}
