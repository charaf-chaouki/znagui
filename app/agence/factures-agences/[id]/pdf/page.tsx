import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAgenceFactureDetail } from "@/lib/server/facture-agence.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { FactureAgencePrint } from "@/components/factures/FactureAgencePrint";

export const instant = false;

export default async function AgenceFactureAgencePdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion");

  const { id } = await params;
  const [facture, company] = await Promise.all([
    getAgenceFactureDetail(user.agence.id, id),
    getCompanySettings(),
  ]);
  if (!facture) notFound();

  return <FactureAgencePrint facture={facture} company={company} />;
}
