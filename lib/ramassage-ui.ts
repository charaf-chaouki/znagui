import type { RamassageStatut } from "@prisma/client";
import type { ColisRamassageState } from "@/lib/types/ramassage";
import type { Tone } from "@/lib/colis-ui";

export const RAMASSAGE_STATUT_LABEL: Record<RamassageStatut, string> = {
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export const RAMASSAGE_STATUT_TONE: Record<RamassageStatut, Tone> = {
  PLANIFIE: "warning",
  EN_COURS: "progress",
  TERMINE: "success",
  ANNULE: "neutral",
};

export const COLIS_RAMASSAGE_LABEL: Record<ColisRamassageState, string> = {
  EN_ATTENTE: "En attente",
  RAMASSE: "Ramassé",
  ENTREPOT: "Entrepôt",
};

export const COLIS_RAMASSAGE_TONE: Record<ColisRamassageState, Tone> = {
  EN_ATTENTE: "neutral",
  RAMASSE: "info",
  ENTREPOT: "success",
};
