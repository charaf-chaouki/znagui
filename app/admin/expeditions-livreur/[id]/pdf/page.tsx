import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExpeditionLivreurDetail } from "@/lib/server/expedition-livreur.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { ExpeditionLivreurPrint } from "@/components/expedition/ExpeditionLivreurPrint";

export const instant = false;

export default async function AdminDispatchPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) redirect("/connexion");

  const { id } = await params;
  const [dispatch, company] = await Promise.all([getExpeditionLivreurDetail(id), getCompanySettings()]);
  if (!dispatch) notFound();

  return <ExpeditionLivreurPrint dispatch={dispatch} company={company} />;
}
