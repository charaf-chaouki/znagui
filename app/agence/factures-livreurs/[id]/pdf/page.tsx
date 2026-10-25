import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAgenceFactureLivreurDetail } from "@/lib/server/facture-livreur.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { FactureLivreurPrint } from "@/components/factures/FactureLivreurPrint";

export const instant = false;

export default async function AgenceFactureLivreurPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion");

  const { id } = await params;
  const [facture, company] = await Promise.all([
    getAgenceFactureLivreurDetail(user.agence.id, id),
    getCompanySettings(),
  ]);
  if (!facture) notFound();

  return <FactureLivreurPrint facture={facture} company={company} />;
}
