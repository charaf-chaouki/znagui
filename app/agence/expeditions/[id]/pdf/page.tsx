import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExpeditionDetail } from "@/lib/server/expedition.service";
import { getCompanySettings } from "@/lib/server/settings.service";
import { ExpeditionPrint } from "@/components/expedition/ExpeditionPrint";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = await getExpeditionDetail(id);
  return { title: e ? `Expédition ${e.reference}` : "Expédition" };
}

export default async function ExpeditionPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion");

  const { id } = await params;
  const [expedition, company] = await Promise.all([getExpeditionDetail(id), getCompanySettings()]);
  if (!expedition || (expedition.agenceSourceId !== user.agence.id && expedition.agenceDestId !== user.agence.id)) notFound();

  return <ExpeditionPrint expedition={expedition} company={company} />;
}
