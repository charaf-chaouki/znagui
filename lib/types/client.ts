export type ClientStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

export interface ClientRow {
  id: string;
  nom: string;
  telephone: string;
  ville: string;
  colisTotal: number;
  status: ClientStatus;
  email: string;
  createdAt: string;
}

export interface ClientListResult {
  rows: ClientRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ClientDetail {
  id: string;
  nom: string;
  telephone: string;
  cni: string;
  banque: string | null;
  rib: string | null;
  cniRectoFile: string | null;
  cniVersoFile: string | null;
  ribFile: string | null;
  ville: string;
  adresse: string | null;
  email: string;
  status: ClientStatus;
  createdAt: string;
  colisTotal: number;
  colisEnCours: number;
  factures: number;
}
