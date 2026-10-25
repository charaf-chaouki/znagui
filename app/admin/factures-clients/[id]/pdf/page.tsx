import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFactureClientDetail } from "@/lib/server/facture-client.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { FacturePrint } from "@/components/factures/FacturePrint";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await getFactureClientDetail(id);
  return { title: f ? `Facture ${f.reference}` : "Facture" };
}

export default async function FactureClientPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) redirect("/connexion");

  const { id } = await params;
  const [facture, company] = await Promise.all([getFactureClientDetail(id), getCompanySettings()]);
  if (!facture) notFound();

  return <FacturePrint facture={facture} company={company} />;
}
