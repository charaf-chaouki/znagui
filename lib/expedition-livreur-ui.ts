import type { ExpeditionLivreurStatut } from "@prisma/client";
import type { DispatchColisState } from "@/lib/types/expedition-livreur";
import type { Tone } from "@/lib/colis-ui";

export const EXP_LIV_STATUT_LABEL: Record<ExpeditionLivreurStatut, string> = {
  NOUVEAU: "Nouveau",
  RECEPTIONNE: "Réceptionné",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export const EXP_LIV_STATUT_TONE: Record<ExpeditionLivreurStatut, Tone> = {
  NOUVEAU: "warning",
  RECEPTIONNE: "info",
  EN_COURS: "progress",
  TERMINE: "success",
  ANNULE: "neutral",
};

export const DISPATCH_STATE_LABEL: Record<DispatchColisState, string> = {
  DISPATCHE: "Dispatché",
  EN_LIVRAISON: "En livraison",
  LIVRE: "Livré",
  ECHEC: "Échoué",
};

export const DISPATCH_STATE_TONE: Record<DispatchColisState, Tone> = {
  DISPATCHE: "neutral",
  EN_LIVRAISON: "progress",
  LIVRE: "success",
  ECHEC: "danger",
};
