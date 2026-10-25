import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AgenceForm } from "@/components/agences/AgenceForm";
import { getServerT } from "@/lib/i18n/server";

export const metadata = { title: "Nouvelle agence" };
export const instant = false;

export default async function NouvelleAgencePage() {
  const { t } = await getServerT();
  return (
    <div className="space-y-5">
      <Link href="/admin/agences" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.agences")}
      </Link>
      <PageHeader title={t("btn.newAgence")} subtitle={t("page.nouvelleAgence.sub")} />
      <AgenceForm mode="create" />
    </div>
  );
}
