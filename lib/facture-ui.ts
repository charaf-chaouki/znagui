import type { FactureStatut } from "@prisma/client";
import type { Tone } from "@/lib/colis-ui";

// Client factures use only two states operationally: Nouveau (not paid) and Payé.
export const FACTURE_STATUT_LABEL: Record<FactureStatut, string> = {
  EN_ATTENTE: "Nouveau",
  MONTANT_VERSE: "Montant versé",
  PAYE: "Payé",
};

export const FACTURE_STATUT_TONE: Record<FactureStatut, Tone> = {
  EN_ATTENTE: "warning",
  MONTANT_VERSE: "info",
  PAYE: "success",
};

// Livreur factures use the three states from the SFD (§4.3).
export const FACTURE_LIVREUR_STATUT_LABEL: Record<FactureStatut, string> = {
  EN_ATTENTE: "En attente",
  MONTANT_VERSE: "Montant versé",
  PAYE: "Payé",
};

// Livreur commission (% of the tarif), per delivered colis.
// Same-ville: a single livreur does ramassage + livraison and keeps 60% of the
// tarif (the direction keeps the other 40%). Inter-villes: the livreurs earn
// nothing — the two agences split the tarif (20% each) and the direction keeps
// the rest — so their facture only records the COD they must hand back.
export const COMMISSION_SAME_VILLE = 0.6;

// Agence commission (% of the tarif) on each delivered inter-villes colis,
// for both the source agence and the destination agence.
export const COMMISSION_AGENCE = 0.2;

/**
 * Per-colis settlement:
 *  - COD = 0  → the client owes the delivery fee, so the collected amount is the tarif.
 *  - COD > 0  → the tarif is included inside the COD, so the collected amount is the COD.
 * Amount to pay back to the client = collected − tarif.
 */
export function calcLigne(cod: number, tarif: number): { collecte: number; aVerser: number } {
  const collecte = cod === 0 ? tarif : cod;
  return { collecte, aVerser: collecte - tarif };
}
