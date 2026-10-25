import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, HandCoins, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FactureStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listClientFactures } from "@/lib/server/client-portal.service";
import { getFacturesClientTotals } from "@/lib/server/facture-client.service";
import { formatMAD, formatNum } from "@/lib/colis-ui";
import type { ClientFactureRow } from "@/lib/types/client-portal";

export const metadata = { title: "Mes factures" };
export const instant = false;

export default async function ClientFacturesPage() {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/factures");

  const { t, tv } = await getServerT();
  const cols: Column<ClientFactureRow>[] = [
    {
      header: t("col.reference"),
      cell: (f) => (
        <Link href={`/client/factures/${f.id}`} className="font-semibold text-brand-dark hover:text-brand">
          {f.reference}
        </Link>
      ),
    },
    { header: t("col.colis"), cell: (f) => <span className="font-semibold">{f.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.montantARecevoir"), cell: (f) => <span className="font-semibold text-brand-dark">{formatMAD(f.montantNet)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.date"), cell: (f) => <span className="whitespace-nowrap text-muted">{f.date}</span> },
    { header: t("col.statut"), cell: (f) => <FactureStatutBadge statut={f.statut} /> },
  ];

  const [factures, totals] = await Promise.all([
    listClientFactures(user.client.id),
    getFacturesClientTotals({ clientId: user.client.id }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("page.mesFactures")} subtitle={tv("count.factures", { n: factures.length })} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t("stat.factures")} value={totals.count.toLocaleString("fr-FR")} icon={FileText} tone="slate" />
        <StatCard label={t("stat.montantARecevoir")} value={formatNum(totals.montantNet)} unit="DH" icon={HandCoins} tone="brand" />
        <StatCard label={t("stat.enAttente")} value={formatNum(totals.nonPayeNet)} unit="DH" icon={Clock} tone="warning" />
      </div>

      <DataTable columns={cols} rows={factures} rowKey={(f) => f.id} emptyLabel={t("empty.facturesNone")} />
    </div>
  );
}
