import { z } from "zod";

const STATUS = ["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"] as const;
const opt = () => z.string().optional().nullable();

const baseClient = {
  nom: z.string().min(2, "Nom requis"),
  telephone: z.string().min(6, "Téléphone requis"),
  cni: z.string().min(3, "CNI requise"),
  banque: opt(),
  rib: opt(),
  cniRectoFile: opt(),
  cniVersoFile: opt(),
  ribFile: opt(),
  ville: z.string().min(1, "Ville requise"),
  adresse: opt(),
  status: z.enum(STATUS).default("ACTIVE"),
  email: z.string().email("Email invalide"),
};

export const createClientSchema = z.object({
  ...baseClient,
  password: z.string().min(6, "Mot de passe : 6 caractères minimum"),
});

export const updateClientSchema = z.object({
  ...baseClient,
  password: z.string().min(6).optional().or(z.literal("")),
});

export const clientStatusSchema = z.object({ status: z.enum(STATUS) });

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
