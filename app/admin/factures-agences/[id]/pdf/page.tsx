import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFactureAgenceDetail } from "@/lib/server/facture-agence.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { FactureAgencePrint } from "@/components/factures/FactureAgencePrint";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await getFactureAgenceDetail(id);
  return { title: f ? `Facture ${f.reference}` : "Facture agence" };
}

export default async function FactureAgencePdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) redirect("/connexion");

  const { id } = await params;
  const [facture, company] = await Promise.all([getFactureAgenceDetail(id), getCompanySettings()]);
  if (!facture) notFound();

  return <FactureAgencePrint facture={facture} company={company} />;
}
