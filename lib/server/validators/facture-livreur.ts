import { z } from "zod";

export const factureLivreurStatusSchema = z.object({
  statut: z.enum(["EN_ATTENTE", "MONTANT_VERSE", "PAYE"]),
});
