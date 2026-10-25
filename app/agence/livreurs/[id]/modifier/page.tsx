import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LivreurForm } from "@/components/livreurs/LivreurForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getLivreur } from "@/lib/server/livreur.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getLivreur(id);
  return { title: l ? `Modifier ${l.prenom} ${l.nom}` : "Modifier livreur" };
}

export default async function AgenceModifierLivreurPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/livreurs");

  const { id } = await params;
  const { t } = await getServerT();
  const l = await getLivreur(id);
  if (!l || l.agenceId !== user.agence.id) notFound();

  return (
    <div className="space-y-5">
      <Link href={`/agence/livreurs/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {l.prenom} {l.nom}
      </Link>
      <PageHeader title={t("page.modifierLivreur")} subtitle={`${l.prenom} ${l.nom}`} />
      <LivreurForm
        agences={[{ id: user.agence.id, nom: user.agence.nom }]}
        mode="edit"
        livreurId={l.id}
        redirectTo={`/agence/livreurs/${l.id}`}
        initial={{
          nom: l.nom, prenom: l.prenom, cni: l.cni, telephone: l.telephone,
          ice: l.ice ?? "", banque: l.banque ?? "", rib: l.rib ?? "",
          cniRectoFile: l.cniRectoFile, cniVersoFile: l.cniVersoFile, ribFile: l.ribFile,
          ville: l.ville, adresse: l.adresse ?? "", status: l.status, agenceId: l.agenceId, email: l.email,
        }}
      />
    </div>
  );
}
