import { z } from "zod";

const STATUS = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

const baseAgence = {
  nom: z.string().min(2, "Nom requis"),
  responsable: z.string().min(2, "Responsable requis"),
  ville: z.string().min(1, "Ville requise"),
  adresse: z.string().optional().nullable(),
  telephone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  locationMap: z.string().optional().nullable(),
  status: z.enum(STATUS).default("ACTIVE"),
  email: z.string().email("Email invalide"),
};

export const createAgenceSchema = z.object({
  ...baseAgence,
  password: z.string().min(6, "Mot de passe : 6 caractères minimum"),
});

export const updateAgenceSchema = z.object({
  ...baseAgence,
  password: z.string().min(6).optional().or(z.literal("")),
});

export const agenceStatusSchema = z.object({ status: z.enum(STATUS) });

export type CreateAgenceInput = z.infer<typeof createAgenceSchema>;
export type UpdateAgenceInput = z.infer<typeof updateAgenceSchema>;
