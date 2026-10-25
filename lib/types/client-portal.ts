import type { ColisStatut } from "@/lib/types/colis";
import type { FactureStatut } from "@prisma/client";

export interface ClientColisRow {
  id: string;
  trk: string;
  recipient: string;
  destCity: string;
  statut: ColisStatut;
  cod: number;
  tarif: number;
  date: string;
}

export interface ClientColisListResult {
  rows: ClientColisRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ClientDashboard {
  totalColis: number;
  enCours: number;
  livres: number;
  codAttendu: number;
  recent: ClientColisRow[];
}

export interface ClientFactureRow {
  id: string;
  reference: string;
  montantNet: number;
  statut: FactureStatut;
  colisCount: number;
  date: string;
}

export interface ClientProfile {
  nom: string;
  telephone: string;
  cni: string;
  ville: string;
  adresse: string | null;
  email: string;
  banque: string | null;
  rib: string | null;
  memberSince: string;
}
