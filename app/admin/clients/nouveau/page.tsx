import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { getServerT } from "@/lib/i18n/server";

export const metadata = { title: "Nouveau client" };
export const instant = false;

export default async function NouveauClientPage() {
  const { t } = await getServerT();
  return (
    <div className="space-y-5">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.clients")}
      </Link>
      <PageHeader title={t("btn.newClient")} subtitle={t("page.nouveauClient.sub")} />
      <ClientForm mode="create" />
    </div>
  );
}
