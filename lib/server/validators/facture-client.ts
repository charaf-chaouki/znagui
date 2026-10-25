import { z } from "zod";

export const createFactureClientSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  colisIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un colis"),
});

export const updateFactureClientSchema = z.object({
  colisIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un colis"),
});

// Admin toggles between Nouveau (EN_ATTENTE) and Payé (PAYE).
export const factureClientStatusSchema = z.object({
  statut: z.enum(["EN_ATTENTE", "MONTANT_VERSE", "PAYE"]),
});

export type CreateFactureClientInput = z.infer<typeof createFactureClientSchema>;
export type UpdateFactureClientInput = z.infer<typeof updateFactureClientSchema>;
