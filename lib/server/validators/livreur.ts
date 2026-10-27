import { z } from "zod";

const STATUS = ["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"] as const;
const VEHICLES = ["MOTO", "VOITURE", "CAMION"] as const;
const opt = () => z.string().optional().nullable();

const baseLivreur = {
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  cni: z.string().min(3, "CNI requise"),
  telephone: z.string().min(6, "Téléphone requis"),
  vehicleType: z.enum(VEHICLES).default("MOTO"),
  matricule: opt(),
  ice: opt(),
  banque: opt(),
  rib: opt(),
  cniRectoFile: opt(),
  cniVersoFile: opt(),
  ribFile: opt(),
  ville: z.string().min(1, "Ville requise"),
  adresse: opt(),
  status: z.enum(STATUS).default("PENDING"),
  agenceId: z.string().min(1, "Agence requise"),
  email: z.string().email("Email invalide"),
};

export const createLivreurSchema = z.object({
  ...baseLivreur,
  password: z.string().min(6, "Mot de passe : 6 caractères minimum"),
});

export const updateLivreurSchema = z.object({
  ...baseLivreur,
  password: z.string().min(6).optional().or(z.literal("")),
});

export const livreurStatusSchema = z.object({ status: z.enum(STATUS) });

export type CreateLivreurInput = z.infer<typeof createLivreurSchema>;
export type UpdateLivreurInput = z.infer<typeof updateLivreurSchema>;
