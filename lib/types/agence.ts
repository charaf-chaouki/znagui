export type AgenceStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface AgenceRow {
  id: string;
  nom: string;
  responsable: string;
  ville: string;
  telephone: string;
  email: string;
  livreurs: number;
  status: AgenceStatus;
}

export interface AgenceListResult {
  rows: AgenceRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface AgenceLivreurMini {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  status: string;
}

export interface AgenceDetail {
  id: string;
  nom: string;
  responsable: string;
  ville: string;
  adresse: string | null;
  telephone: string | null;
  email: string;
  notes: string | null;
  locationMap: string | null;
  status: AgenceStatus;
  createdAt: string;
  livreursCount: number;
  colisCount: number;
  livreurs: AgenceLivreurMini[];
}
