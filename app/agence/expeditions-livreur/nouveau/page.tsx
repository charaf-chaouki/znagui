import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DispatchBuilder } from "@/components/expedition/DispatchBuilder";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listAvailableForDispatch } from "@/lib/server/expedition-livreur.service";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau dispatch" };
export const instant = false;

export default async function NouveauDispatchPage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/expeditions-livreur/nouveau");

  const [livreursRaw, colis] = await Promise.all([
    prisma.livreur.findMany({ where: { agenceId: user.agence.id, statusAccount: "ACTIVE" }, select: { id: true, nom: true, prenom: true }, orderBy: { nom: "asc" } }),
    listAvailableForDispatch(user.agence.id),
  ]);
  const livreurs = livreursRaw.map((l) => ({ id: l.id, nom: `${l.prenom} ${l.nom}` }));

  return (
    <div className="space-y-5">
      <Link href="/agence/expeditions-livreur" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Expéditions livreurs
      </Link>
      <PageHeader title="Nouveau dispatch" subtitle="Affectez un livreur de livraison et cochez les colis reçus à livrer" />
      <DispatchBuilder livreurs={livreurs} colis={colis} />
    </div>
  );
}
