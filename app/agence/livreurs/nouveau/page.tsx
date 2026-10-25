import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LivreurForm } from "@/components/livreurs/LivreurForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";

export const metadata = { title: "Nouveau livreur" };
export const instant = false;

export default async function AgenceNouveauLivreurPage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/livreurs/nouveau");

  const { t } = await getServerT();
  const agences = [{ id: user.agence.id, nom: user.agence.nom }];

  return (
    <div className="space-y-5">
      <Link href="/agence/livreurs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.livreurs")}
      </Link>
      <PageHeader title={t("btn.newLivreur")} subtitle={t("page.nouveauLivreur.subAgence")} />
      <LivreurForm agences={agences} mode="create" redirectTo="/agence/livreurs" initial={{ agenceId: user.agence.id }} />
    </div>
  );
}
