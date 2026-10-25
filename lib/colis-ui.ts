import type { ColisStatut } from "@/lib/types/colis";

export type Tone = "neutral" | "info" | "progress" | "success" | "warning" | "danger";

export const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-sky-50 text-sky-700",
  progress: "bg-indigo-50 text-indigo-700",
  success: "bg-brand-light text-brand-darker",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

export const COLIS_STATUT_LABEL: Record<ColisStatut, string> = {
  CREE: "Créé",
  DISPONIBLE_A_RAMASSER: "Disponible à ramasser",
  AFFECTE_RAMASSAGE: "Affecté ramassage",
  RAMASSE: "Ramassé",
  RECU_ENTREPOT_SOURCE: "Reçu entrepôt",
  EN_EXPEDITION: "En expédition",
  RECU_PAR_AGENCE_DEST: "Reçu agence dest.",
  DISPATCHE_LIVREUR: "Dispatché livreur",
  EN_COURS_DE_LIVRAISON: "En livraison",
  LIVRE: "Livré",
  REPORTE: "Reporté",
  PAS_DE_REPONSE: "Pas de réponse",
  REFUSE: "Refusé",
  RETOUR: "Retour",
  ANNULE: "Annulé",
};

export const COLIS_STATUT_TONE: Record<ColisStatut, Tone> = {
  CREE: "neutral",
  DISPONIBLE_A_RAMASSER: "warning",
  AFFECTE_RAMASSAGE: "warning",
  RAMASSE: "info",
  RECU_ENTREPOT_SOURCE: "info",
  EN_EXPEDITION: "info",
  RECU_PAR_AGENCE_DEST: "info",
  DISPATCHE_LIVREUR: "progress",
  EN_COURS_DE_LIVRAISON: "progress",
  LIVRE: "success",
  REPORTE: "warning",
  PAS_DE_REPONSE: "warning",
  REFUSE: "danger",
  RETOUR: "danger",
  ANNULE: "neutral",
};

export const formatMAD = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " DH";

// Grouped number "8.500,00" (dot thousands, comma decimals), no currency suffix —
// for stat cards that render the unit as a separate small element.
export const formatNum = (n: number) => {
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "-" : "") + grouped + "," + dec;
};
