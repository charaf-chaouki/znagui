import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExpeditionBuilder } from "@/components/expedition/ExpeditionBuilder";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listAvailableForExpedition } from "@/lib/server/expedition.service";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouvelle expédition" };
export const instant = false;

export default async function NouvelleExpeditionPage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/expeditions/nouveau");

  const [agencesRaw, colis] = await Promise.all([
    prisma.agence.findMany({ where: { id: { not: user.agence.id } }, select: { id: true, nom: true, villeId: true, ville: { select: { nom: true } } }, orderBy: { nom: "asc" } }),
    listAvailableForExpedition(user.agence.id),
  ]);
  const agences = agencesRaw.map((a) => ({ id: a.id, nom: a.nom, villeId: a.villeId, ville: a.ville.nom }));

  return (
    <div className="space-y-5">
      <Link href="/agence/expeditions" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Expéditions
      </Link>
      <PageHeader title="Nouvelle expédition" subtitle="Choisissez l'agence de destination et les colis reçus à votre entrepôt" />
      <ExpeditionBuilder agences={agences} colis={colis} />
    </div>
  );
}
