import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFactureLivreurDetail } from "@/lib/server/facture-livreur.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { FactureLivreurPrint } from "@/components/factures/FactureLivreurPrint";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await getFactureLivreurDetail(id);
  return { title: f ? `Facture ${f.reference}` : "Facture livreur" };
}

export default async function FactureLivreurPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) redirect("/connexion");

  const { id } = await params;
  const [facture, company] = await Promise.all([getFactureLivreurDetail(id), getCompanySettings()]);
  if (!facture) notFound();

  return <FactureLivreurPrint facture={facture} company={company} />;
}
