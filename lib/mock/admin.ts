import type { ColisStatut, ColisType, VehicleType } from "@/lib/types/colis";

// ─── Dashboard KPIs ──────────────────────────────────────
export const dashboardStats = {
  totalColis: 1284,
  enLivraison: 143,
  livresMois: 912,
  aEncaisser: 184500, // DH (COD en attente)
  caTarif: 42150, // DH (tarifs du mois)
  agences: 6,
  livreurs: 38,
  clients: 214,
};

export const activite7j = [
  { jour: "Lun", colis: 48 },
  { jour: "Mar", colis: 62 },
  { jour: "Mer", colis: 55 },
  { jour: "Jeu", colis: 71 },
  { jour: "Ven", colis: 83 },
  { jour: "Sam", colis: 67 },
  { jour: "Dim", colis: 29 },
];

export const statutDistribution: { statut: ColisStatut; count: number }[] = [
  { statut: "EN_COURS_DE_LIVRAISON", count: 143 },
  { statut: "EN_EXPEDITION", count: 98 },
  { statut: "DISPONIBLE_A_RAMASSER", count: 76 },
  { statut: "LIVRE", count: 912 },
  { statut: "RETOUR", count: 41 },
  { statut: "RECU_PAR_AGENCE_DEST", count: 14 },
];

// ─── Colis ───────────────────────────────────────────────
export type MockColis = {
  trk: string;
  client: string;
  pickupCity: string;
  destCity: string;
  type: ColisType;
  statut: ColisStatut;
  vehicle: VehicleType;
  tarif: number;
  cod: number;
  date: string;
};

export const colisList: MockColis[] = [
  { trk: "TRK-A1B2C3", client: "Said Benani", pickupCity: "Casablanca", destCity: "Fès", type: "INTER", statut: "EN_COURS_DE_LIVRAISON", vehicle: "VOITURE", tarif: 50, cod: 350, date: "21 oct. 2026" },
  { trk: "TRK-D4E5F6", client: "Fatima Zahra", pickupCity: "Rabat", destCity: "Rabat", type: "INTRA", statut: "LIVRE", vehicle: "MOTO", tarif: 25, cod: 180, date: "21 oct. 2026" },
  { trk: "TRK-G7H8I9", client: "Youssef Alami", pickupCity: "Tanger", destCity: "Tétouan", type: "INTER", statut: "RAMASSE", vehicle: "VOITURE", tarif: 35, cod: 540, date: "20 oct. 2026" },
  { trk: "TRK-J1K2L3", client: "Nadia Chaoui", pickupCity: "Marrakech", destCity: "Agadir", type: "INTER", statut: "EN_EXPEDITION", vehicle: "CAMION", tarif: 60, cod: 1200, date: "20 oct. 2026" },
  { trk: "TRK-M4N5O6", client: "Hamid Idrissi", pickupCity: "Casablanca", destCity: "Casablanca", type: "INTRA", statut: "DISPONIBLE_A_RAMASSER", vehicle: "MOTO", tarif: 20, cod: 90, date: "20 oct. 2026" },
  { trk: "TRK-P7Q8R9", client: "Salma Bennis", pickupCity: "Fès", destCity: "Meknès", type: "INTER", statut: "RECU_PAR_AGENCE_DEST", vehicle: "VOITURE", tarif: 35, cod: 260, date: "19 oct. 2026" },
  { trk: "TRK-S1T2U3", client: "Omar Tazi", pickupCity: "Rabat", destCity: "Kénitra", type: "INTER", statut: "LIVRE", vehicle: "MOTO", tarif: 35, cod: 320, date: "19 oct. 2026" },
  { trk: "TRK-V4W5X6", client: "Imane Fassi", pickupCity: "Casablanca", destCity: "Mohammedia", type: "INTER", statut: "RETOUR", vehicle: "VOITURE", tarif: 35, cod: 0, date: "18 oct. 2026" },
  { trk: "TRK-Y7Z8A9", client: "Karim Saidi", pickupCity: "Agadir", destCity: "Agadir", type: "INTRA", statut: "EN_COURS_DE_LIVRAISON", vehicle: "MOTO", tarif: 30, cod: 410, date: "18 oct. 2026" },
  { trk: "TRK-B1C2D3", client: "Leila Ouardi", pickupCity: "Marrakech", destCity: "Marrakech", type: "INTRA", statut: "LIVRE", vehicle: "MOTO", tarif: 25, cod: 150, date: "18 oct. 2026" },
  { trk: "TRK-E4F5G6", client: "Rachid Berrada", pickupCity: "Tanger", destCity: "Casablanca", type: "INTER", statut: "CREE", vehicle: "CAMION", tarif: 60, cod: 2100, date: "17 oct. 2026" },
  { trk: "TRK-H7I8J9", client: "Hanane Mansouri", pickupCity: "Meknès", destCity: "Fès", type: "INTER", statut: "ANNULE", vehicle: "VOITURE", tarif: 35, cod: 0, date: "17 oct. 2026" },
];

export const recentColis = colisList.slice(0, 6);

// ─── Agences ─────────────────────────────────────────────
export type MockAgence = {
  nom: string; responsable: string; ville: string; telephone: string;
  livreurs: number; colisActifs: number; statut: "ACTIVE" | "INACTIVE";
};
export const agences: MockAgence[] = [
  { nom: "Agence Casablanca", responsable: "Mehdi Alaoui", ville: "Casablanca", telephone: "0522 00 11 22", livreurs: 12, colisActifs: 86, statut: "ACTIVE" },
  { nom: "Agence Rabat", responsable: "Sara El Amrani", ville: "Rabat", telephone: "0537 00 33 44", livreurs: 8, colisActifs: 54, statut: "ACTIVE" },
  { nom: "Agence Fès", responsable: "Anas Bennani", ville: "Fès", telephone: "0535 00 55 66", livreurs: 6, colisActifs: 41, statut: "ACTIVE" },
  { nom: "Agence Marrakech", responsable: "Khadija Nassiri", ville: "Marrakech", telephone: "0524 00 77 88", livreurs: 7, colisActifs: 63, statut: "ACTIVE" },
  { nom: "Agence Tanger", responsable: "Younes Rifi", ville: "Tanger", telephone: "0539 00 99 00", livreurs: 5, colisActifs: 29, statut: "ACTIVE" },
  { nom: "Agence Agadir", responsable: "Salima Oujdi", ville: "Agadir", telephone: "0528 00 12 34", livreurs: 4, colisActifs: 18, statut: "INACTIVE" },
];

// ─── Livreurs ────────────────────────────────────────────
export type MockLivreur = {
  nom: string; telephone: string; agence: string; ville: string;
  vehicle: VehicleType; colisEnCours: number; statut: "ACTIVE" | "PENDING" | "SUSPENDED";
};
export const livreurs: MockLivreur[] = [
  { nom: "Youssef Alami", telephone: "0612 00 00 01", agence: "Agence Casablanca", ville: "Casablanca", vehicle: "MOTO", colisEnCours: 9, statut: "ACTIVE" },
  { nom: "Hamza Berrada", telephone: "0612 00 00 02", agence: "Agence Casablanca", ville: "Casablanca", vehicle: "VOITURE", colisEnCours: 14, statut: "ACTIVE" },
  { nom: "Ayoub Tazi", telephone: "0612 00 00 03", agence: "Agence Rabat", ville: "Rabat", vehicle: "MOTO", colisEnCours: 7, statut: "ACTIVE" },
  { nom: "Bilal Saidi", telephone: "0612 00 00 04", agence: "Agence Fès", ville: "Fès", vehicle: "MOTO", colisEnCours: 5, statut: "PENDING" },
  { nom: "Reda Chaoui", telephone: "0612 00 00 05", agence: "Agence Marrakech", ville: "Marrakech", vehicle: "CAMION", colisEnCours: 11, statut: "ACTIVE" },
  { nom: "Nabil Fassi", telephone: "0612 00 00 06", agence: "Agence Tanger", ville: "Tanger", vehicle: "VOITURE", colisEnCours: 6, statut: "SUSPENDED" },
  { nom: "Walid Oujdi", telephone: "0612 00 00 07", agence: "Agence Agadir", ville: "Agadir", vehicle: "MOTO", colisEnCours: 3, statut: "ACTIVE" },
  { nom: "Tarik Mansouri", telephone: "0612 00 00 08", agence: "Agence Rabat", ville: "Rabat", vehicle: "MOTO", colisEnCours: 8, statut: "ACTIVE" },
];

// ─── Clients ─────────────────────────────────────────────
export type MockClient = {
  nom: string; telephone: string; ville: string;
  colisTotal: number; colisEnCours: number; statut: "ACTIVE" | "INACTIVE"; date: string;
};
export const clients: MockClient[] = [
  { nom: "Said Benani", telephone: "0613 00 00 01", ville: "Casablanca", colisTotal: 142, colisEnCours: 8, statut: "ACTIVE", date: "12 janv. 2026" },
  { nom: "Fatima Zahra", telephone: "0613 00 00 02", ville: "Rabat", colisTotal: 88, colisEnCours: 3, statut: "ACTIVE", date: "03 févr. 2026" },
  { nom: "Nadia Chaoui", telephone: "0613 00 00 03", ville: "Marrakech", colisTotal: 56, colisEnCours: 5, statut: "ACTIVE", date: "21 févr. 2026" },
  { nom: "Omar Tazi", telephone: "0613 00 00 04", ville: "Rabat", colisTotal: 34, colisEnCours: 0, statut: "ACTIVE", date: "10 mars 2026" },
  { nom: "Imane Fassi", telephone: "0613 00 00 05", ville: "Casablanca", colisTotal: 203, colisEnCours: 12, statut: "ACTIVE", date: "28 mars 2026" },
  { nom: "Rachid Berrada", telephone: "0613 00 00 06", ville: "Tanger", colisTotal: 19, colisEnCours: 2, statut: "INACTIVE", date: "15 avr. 2026" },
  { nom: "Leila Ouardi", telephone: "0613 00 00 07", ville: "Marrakech", colisTotal: 71, colisEnCours: 4, statut: "ACTIVE", date: "02 mai 2026" },
  { nom: "Karim Saidi", telephone: "0613 00 00 08", ville: "Agadir", colisTotal: 45, colisEnCours: 1, statut: "ACTIVE", date: "19 mai 2026" },
];

export const VEHICLE_LABEL: Record<VehicleType, string> = {
  MOTO: "Moto",
  VOITURE: "Voiture",
  CAMION: "Camion",
};
