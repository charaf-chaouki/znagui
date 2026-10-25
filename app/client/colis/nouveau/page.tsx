import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisForm } from "@/components/colis/ColisForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";

export const metadata = { title: "Nouveau colis" };
export const instant = false;

export default async function ClientNouveauColisPage() {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/colis/nouveau");

  const { t } = await getServerT();
  return (
    <div className="space-y-5">
      <Link href="/client/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("page.mesColis")}
      </Link>
      <PageHeader title={t("btn.newColis")} subtitle={t("page.clientNouveauColis.sub")} />
      <ColisForm
        clients={[]}
        mode="create"
        lockClient
        apiBase="/api/client/colis"
        createRedirect="/client/colis"
        initial={{ clientId: user.client.id, clientName: user.client.nom }}
      />
    </div>
  );
}
