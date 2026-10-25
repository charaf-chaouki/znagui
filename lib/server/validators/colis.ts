import { z } from "zod";

const STATUTS = [
  "CREE", "DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE", "RAMASSE",
  "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION", "RECU_PAR_AGENCE_DEST",
  "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE",
  "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE",
] as const;

export const colisSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  pickupCity: z.string().min(1, "Ville de départ requise"),
  pickupAddress: z.string().min(2, "Adresse de retrait requise"),
  pickupLat: z.number().nullable().optional(),
  pickupLng: z.number().nullable().optional(),
  recipient: z.string().min(2, "Nom du destinataire requis"),
  recipientPhone: z.string().min(6, "Téléphone requis"),
  destCity: z.string().min(1, "Ville de destination requise"),
  destAddress: z.string().min(2, "Adresse de livraison requise"),
  destLat: z.number().nullable().optional(),
  destLng: z.number().nullable().optional(),
  destMapLink: z.string().optional().nullable(),
  vehicle: z.enum(["MOTO", "VOITURE", "CAMION"]),
  parcelCount: z.coerce.number().int().min(1).max(100),
  contents: z.string().min(1, "Contenu requis"),
  cod: z.coerce.number().min(0),
  tarif: z.coerce.number().min(0),
  notes: z.string().optional().nullable(),
});

export const statusSchema = z.object({
  statut: z.enum(STATUTS),
  note: z.string().optional().nullable(),
});

/**
 * Agence counter drop-off. The sender is either an existing client or a quick
 * "comptoir" client (nom + téléphone). Pickup is the agence itself, so pickup
 * fields are not required here — the server fills them from the agence.
 */
export const agenceColisSchema = z
  .object({
    clientId: z.string().optional().nullable(),
    newClient: z
      .object({
        nom: z.string().min(2, "Nom du client requis"),
        telephone: z.string().min(6, "Téléphone du client requis"),
      })
      .optional()
      .nullable(),
    recipient: z.string().min(2, "Nom du destinataire requis"),
    recipientPhone: z.string().min(6, "Téléphone requis"),
    destCity: z.string().min(1, "Ville de destination requise"),
    destAddress: z.string().min(2, "Adresse de livraison requise"),
    destLat: z.number().nullable().optional(),
    destLng: z.number().nullable().optional(),
    destMapLink: z.string().optional().nullable(),
    vehicle: z.enum(["MOTO", "VOITURE", "CAMION"]),
    parcelCount: z.coerce.number().int().min(1).max(100),
    contents: z.string().min(1, "Contenu requis"),
    cod: z.coerce.number().min(0),
    tarif: z.coerce.number().min(0),
    notes: z.string().optional().nullable(),
  })
  .refine((d) => Boolean(d.clientId) || Boolean(d.newClient), {
    message: "Sélectionnez un client ou saisissez un nouveau client.",
    path: ["clientId"],
  });

export type ColisInput = z.infer<typeof colisSchema>;
export type AgenceColisInput = z.infer<typeof agenceColisSchema>;
