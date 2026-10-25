import Link from "next/link";
import { FileText, Wallet, Percent, HandCoins } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { FactureLivStatutBadge } from "@/components/ui/StatutBadge";
import { FactureAgenceToolbar } from "@/components/factures/FactureAgenceToolbar";
import { FactureAgenceActionsMenu } from "@/components/factures/FactureAgenceActionsMenu";
import { GenerateFacturesAgenceButton } from "@/components/factures/GenerateFacturesAgenceButton";
import { getServerT } from "@/lib/i18n/server";
import { listFacturesAgence, getFacturesAgenceTotals, PER_PAGE } from "@/lib/server/facture-agence.service";
import { formatMAD, formatNum } from "@/lib/colis-ui";
import { prisma } from "@/lib/db";
import type { FactureAgenceRow } from "@/lib/types/facture-agence";

export const metadata = { title: "Factures agences" };
export const instant = false;

export default async function FacturesAgencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t, tv } = await getServerT();
  const cols: Column<FactureAgenceRow>[] = [
    {
      header: t("col.reference"),
      cell: (f) => <Link href={`/admin/factures-agences/${f.id}`} className="font-semibold text-brand-dark hover:text-brand">{f.reference}</Link>,
    },
    { header: t("col.agence"), cell: (f) => <span><span className="block">{f.agence}</span><span className="block text-xs text-muted">{f.ville}</span></span> },
    { header: t("col.colis"), cell: (f) => <span className="font-semibold">{f.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.collecte"), cell: (f) => <span className="text-muted">{formatMAD(f.montantCollecte)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.commission20"), cell: (f) => <span className="text-muted">{formatMAD(f.commission)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.aVerser"), cell: (f) => <span className="font-semibold text-brand-dark">{formatMAD(f.montantAVerser)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.date"), cell: (f) => <span className="whitespace-nowrap text-muted">{f.date}</span> },
    { header: t("col.statut"), cell: (f) => <FactureLivStatutBadge statut={f.statut} /> },
    { header: "", cell: (f) => <FactureAgenceActionsMenu id={f.id} statut={f.statut} />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filters = { statut: sp.statut, agenceId: sp.agenceId, dateFrom: sp.dateFrom, dateTo: sp.dateTo, search: sp.search };

  const [result, totals, agences] = await Promise.all([
    listFacturesAgence(filters, page, PER_PAGE),
    getFacturesAgenceTotals(filters),
    prisma.agence.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.facturesAgences")}
        subtitle={t("page.facturesAgences.sub")}
        action={<GenerateFacturesAgenceButton />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stat.factures")} value={totals.count.toLocaleString("fr-FR")} icon={FileText} tone="slate" />
        <StatCard label={t("stat.collecteCod")} value={formatNum(totals.montantCollecte)} unit="DH" icon={Wallet} tone="info" />
        <StatCard label={t("stat.commissions")} value={formatNum(totals.commission)} unit="DH" icon={Percent} tone="warning" />
        <StatCard label={t("stat.aVerserDirection")} value={formatNum(totals.montantAVerser)} unit="DH" icon={HandCoins} tone="brand" hint={tv("stat.nonRegle", { m: formatMAD(totals.nonPayeAVerser) })} />
      </div>

      <FactureAgenceToolbar agences={agences} />
      <DataTable columns={cols} rows={result.rows} rowKey={(f) => f.id} emptyLabel={t("empty.facturesGenerate")} />
      <Pagination basePath="/admin/factures-agences" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
