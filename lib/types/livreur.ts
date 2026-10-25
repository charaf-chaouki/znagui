export type LivreurStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

export interface LivreurRow {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  agence: string;
  livraisons: number;
  status: LivreurStatus;
  email: string;
}

export interface LivreurListResult {
  rows: LivreurRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface LivreurDetail {
  id: string;
  nom: string;
  prenom: string;
  cni: string;
  telephone: string;
  ice: string | null;
  banque: string | null;
  rib: string | null;
  cniRectoFile: string | null;
  cniVersoFile: string | null;
  ribFile: string | null;
  ville: string;
  adresse: string | null;
  email: string;
  agenceId: string;
  agence: string;
  status: LivreurStatus;
  createdAt: string;
  livraisons: number;
  ramassages: number;
}
