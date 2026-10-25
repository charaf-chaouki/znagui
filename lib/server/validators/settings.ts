import { z } from "zod";

const s = () => z.string().max(300).optional().default("");

export const companySchema = z.object({
  raisonSociale: z.string().min(1, "Raison sociale requise").max(300),
  nomCommercial: s(),
  formeJuridique: s(),
  logo: s(),
  ville: s(),
  adresse: s(),
  telephone: s(),
  email: z.string().email("Email invalide").or(z.literal("")).optional().default(""),
  siteWeb: s(),
  ice: s(),
  rc: s(),
  if: s(),
  patente: s(),
  cnss: s(),
  capital: s(),
  facebook: s(),
  instagram: s(),
  linkedin: s(),
  youtube: s(),
  tiktok: s(),
  whatsapp: s(),
});

export type CompanyInput = z.infer<typeof companySchema>;
