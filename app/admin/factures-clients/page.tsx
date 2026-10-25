import Link from "next/link";
import { Plus, FileText, Wallet, Receipt, HandCoins } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { FactureStatutBadge } from "@/components/ui/StatutBadge";
import { FactureClientToolbar } from "@/components/factures/FactureClientToolbar";
import { FactureClientActionsMenu } from "@/components/factures/FactureClientActionsMenu";
import { getServerT } from "@/lib/i18n/server";
import { listFacturesClient, getFacturesClientTotals, PER_PAGE } from "@/lib/server/facture-client.service";
import { formatMAD, formatNum } from "@/lib/colis-ui";
import { prisma } from "@/lib/db";
import type { FactureClientRow } from "@/lib/types/facture-client";

export const metadata = { title: "Factures clients" };
export const instant = false;

export default async function FacturesClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t } = await getServerT();
  const cols: Column<FactureClientRow>[] = [
    {
      header: t("col.reference"),
      cell: (f) => (
        <Link href={`/admin/factures-clients/${f.id}`} className="font-semibold text-brand-dark hover:text-brand">
          {f.reference}
        </Link>
      ),
    },
    { header: t("col.client"), cell: (f) => f.client },
    { header: t("col.colis"), cell: (f) => <span className="font-semibold">{f.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.collecte"), cell: (f) => formatMAD(f.montantCollecte), className: "text-right", thClassName: "text-right" },
    { header: t("col.tarifs"), cell: (f) => <span className="text-muted">{formatMAD(f.tarifTotal)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.aVerser"), cell: (f) => <span className="font-semibold text-brand-dark">{formatMAD(f.montantNet)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.date"), cell: (f) => <span className="whitespace-nowrap text-muted">{f.date}</span> },
    { header: t("col.statut"), cell: (f) => <FactureStatutBadge statut={f.statut} /> },
    { header: "", cell: (f) => <FactureClientActionsMenu id={f.id} statut={f.statut} />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filters = { statut: sp.statut, clientId: sp.clientId, dateFrom: sp.dateFrom, dateTo: sp.dateTo, search: sp.search };

  const [result, totals, clients] = await Promise.all([
    listFacturesClient(filters, page, PER_PAGE),
    getFacturesClientTotals(filters),
    prisma.client.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.facturesClients")}
        subtitle={t("page.facturesClients.sub")}
        action={
          <Link href="/admin/factures-clients/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newFacture")}
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stat.factures")} value={totals.count.toLocaleString("fr-FR")} icon={FileText} tone="slate" />
        <StatCard label={t("stat.montantCollecte")} value={formatNum(totals.montantCollecte)} unit="DH" icon={Wallet} tone="info" />
        <StatCard label={t("stat.totalTarifs")} value={formatNum(totals.tarifTotal)} unit="DH" icon={Receipt} tone="warning" />
        <StatCard label={t("stat.montantAVerser")} value={formatNum(totals.montantNet)} unit="DH" icon={HandCoins} tone="brand" />
      </div>

      <FactureClientToolbar clients={clients} />
      <DataTable columns={cols} rows={result.rows} rowKey={(f) => f.id} emptyLabel={t("empty.factures")} />
      <Pagination basePath="/admin/factures-clients" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
