export interface CompanySettings {
  // Identité
  raisonSociale: string; // nom légal
  nomCommercial: string;
  formeJuridique: string; // SARL, SA, Auto-entrepreneur…
  logo: string;

  // Coordonnées
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  siteWeb: string;

  // Légal (Maroc)
  ice: string; // Identifiant Commun de l'Entreprise
  rc: string; // Registre de Commerce
  if: string; // Identifiant Fiscal
  patente: string;
  cnss: string;
  capital: string; // capital social (DH)

  // Réseaux sociaux
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  whatsapp: string;
}

export const DEFAULT_COMPANY: CompanySettings = {
  raisonSociale: "",
  nomCommercial: "Znagui Express",
  formeJuridique: "",
  logo: "",
  ville: "",
  adresse: "",
  telephone: "",
  email: "",
  siteWeb: "",
  ice: "",
  rc: "",
  if: "",
  patente: "",
  cnss: "",
  capital: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  tiktok: "",
  whatsapp: "",
};
