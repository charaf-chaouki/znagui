import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RamassageBuilder } from "@/components/ramassage/RamassageBuilder";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listAvailableColis } from "@/lib/server/ramassage.service";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau ramassage" };
export const instant = false;

export default async function NouveauRamassagePage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/ramassages/nouveau");

  const agence = await prisma.agence.findUnique({ where: { id: user.agence.id }, select: { villeId: true } });
  const [livreursRaw, colis] = await Promise.all([
    prisma.livreur.findMany({ where: { agenceId: user.agence.id, statusAccount: "ACTIVE" }, select: { id: true, nom: true, prenom: true }, orderBy: { nom: "asc" } }),
    listAvailableColis(agence?.villeId ?? ""),
  ]);
  const livreurs = livreursRaw.map((l) => ({ id: l.id, nom: `${l.prenom} ${l.nom}` }));

  return (
    <div className="space-y-5">
      <Link href="/agence/ramassages" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Ramassages
      </Link>
      <PageHeader title="Nouveau ramassage" subtitle="Affectez un livreur ramasseur et cochez les colis de votre ville" />
      <RamassageBuilder livreurs={livreurs} colis={colis} />
    </div>
  );
}
