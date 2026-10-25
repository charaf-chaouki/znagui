import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getClientFactureDetail } from "@/lib/server/facture-client.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { FacturePrint } from "@/components/factures/FacturePrint";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Facture ${id.slice(0, 8)}` };
}

export default async function ClientFacturePdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/factures");

  const { id } = await params;
  const [facture, company] = await Promise.all([
    getClientFactureDetail(user.client.id, id),
    getCompanySettings(),
  ]);
  if (!facture) notFound();

  return <FacturePrint facture={facture} company={company} />;
}
