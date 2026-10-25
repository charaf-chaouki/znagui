import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExpeditionDetail } from "@/lib/server/expedition.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { ExpeditionPrint } from "@/components/expedition/ExpeditionPrint";

export const instant = false;

export default async function AdminExpeditionPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) redirect("/connexion");

  const { id } = await params;
  const [expedition, company] = await Promise.all([getExpeditionDetail(id), getCompanySettings()]);
  if (!expedition) notFound();

  return <ExpeditionPrint expedition={expedition} company={company} />;
}
