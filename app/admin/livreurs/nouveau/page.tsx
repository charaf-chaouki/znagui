import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LivreurForm } from "@/components/livreurs/LivreurForm";
import { getServerT } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau livreur" };
export const instant = false;

export default async function NouveauLivreurPage() {
  const { t } = await getServerT();
  const agences = await prisma.agence.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });

  return (
    <div className="space-y-5">
      <Link href="/admin/livreurs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.livreurs")}
      </Link>
      <PageHeader title={t("btn.newLivreur")} subtitle={t("page.nouveauLivreur.sub")} />
      <LivreurForm agences={agences} mode="create" />
    </div>
  );
}
