import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Truck, CheckCircle2, Wallet, ArrowRight, PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ClientColisTable } from "@/components/client/ClientColisTable";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getClientDashboard } from "@/lib/server/client-portal.service";
import { formatNum } from "@/lib/colis-ui";

export const metadata = { title: "Dashboard" };
export const instant = false;

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client");

  const { t, tv } = await getServerT();
  const d = await getClientDashboard(user.client.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={tv("client.bonjour", { n: user.client.nom })}
        subtitle={t("client.dashSub")}
        action={
          <Link href="/client/suivi" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <PackageSearch className="h-4 w-4" /> {t("btn.suivreColis")}
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stat.totalColis")} value={d.totalColis.toLocaleString("fr-FR")} icon={Package} tone="brand" />
        <StatCard label={t("stat.enCours")} value={d.enCours} icon={Truck} tone="info" />
        <StatCard label={t("stat.livres")} value={d.livres.toLocaleString("fr-FR")} icon={CheckCircle2} tone="brand" />
        <StatCard label={t("stat.codAttendu")} value={formatNum(d.codAttendu)} unit="DH" icon={Wallet} tone="warning" hint={t("stat.montantARecevoirHint")} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t("dash.recentColis")}</h3>
          <Link href="/client/colis" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
            {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ClientColisTable rows={d.recent} emptyLabel={t("empty.clientNoColis")} />
      </div>
    </div>
  );
}
