import { cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import { DEFAULT_COMPANY, type CompanySettings } from "@/lib/types/settings";

const ID = "default";

/** Tag used to revalidate the cached company settings after an admin saves them. */
export const COMPANY_SETTINGS_TAG = "company-settings";

/**
 * Cached company settings for the public site (footer, contact section, …).
 * Lets the marketing pages stay static; revalidated via COMPANY_SETTINGS_TAG
 * whenever the admin saves the settings.
 */
export async function getCompanySettingsCached(): Promise<CompanySettings> {
  "use cache";
  cacheTag(COMPANY_SETTINGS_TAG);
  return getCompanySettings();
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const c = await prisma.company.findUnique({ where: { id: ID } });
  if (!c) return DEFAULT_COMPANY;
  return {
    raisonSociale: c.raisonSociale,
    nomCommercial: c.nomCommercial,
    formeJuridique: c.formeJuridique,
    logo: c.logo,
    ville: c.ville,
    adresse: c.adresse,
    telephone: c.telephone,
    email: c.email,
    siteWeb: c.siteWeb,
    ice: c.ice,
    rc: c.rc,
    if: c.idFiscal,
    patente: c.patente,
    cnss: c.cnss,
    capital: c.capital,
    facebook: c.facebook,
    instagram: c.instagram,
    linkedin: c.linkedin,
    youtube: c.youtube,
    tiktok: c.tiktok,
    whatsapp: c.whatsapp,
  };
}

export async function saveCompanySettings(d: CompanySettings): Promise<void> {
  const data = {
    raisonSociale: d.raisonSociale,
    nomCommercial: d.nomCommercial,
    formeJuridique: d.formeJuridique,
    logo: d.logo,
    ville: d.ville,
    adresse: d.adresse,
    telephone: d.telephone,
    email: d.email,
    siteWeb: d.siteWeb,
    ice: d.ice,
    rc: d.rc,
    idFiscal: d.if,
    patente: d.patente,
    cnss: d.cnss,
    capital: d.capital,
    facebook: d.facebook,
    instagram: d.instagram,
    linkedin: d.linkedin,
    youtube: d.youtube,
    tiktok: d.tiktok,
    whatsapp: d.whatsapp,
  };
  await prisma.company.upsert({ where: { id: ID }, update: data, create: { id: ID, ...data } });
}
