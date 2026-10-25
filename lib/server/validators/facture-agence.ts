import { z } from "zod";

export const factureAgenceStatusSchema = z.object({
  statut: z.enum(["EN_ATTENTE", "MONTANT_VERSE", "PAYE"]),
});

export const factureAgencePieceSchema = z.object({
  pieceJointeUrl: z.string().min(1, "Pièce jointe requise."),
});
