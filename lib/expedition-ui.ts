import type { ExpeditionStatut } from "@prisma/client";
import type { Tone } from "@/lib/colis-ui";

export const EXPEDITION_STATUT_LABEL: Record<ExpeditionStatut, string> = {
  NOUVEAU: "Nouveau",
  EN_TRANSIT: "En transit",
  RECEPTIONNE: "Réceptionné",
  ANNULE: "Annulé",
};

export const EXPEDITION_STATUT_TONE: Record<ExpeditionStatut, Tone> = {
  NOUVEAU: "warning",
  EN_TRANSIT: "progress",
  RECEPTIONNE: "success",
  ANNULE: "neutral",
};
