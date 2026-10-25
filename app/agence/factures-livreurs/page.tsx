import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Wallet, Percent, HandCoins } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { FactureLivStatutBadge } from "@/components/ui/StatutBadge";
import { FactureLivreurActionsMenu } from "@/components/factures/FactureLivreurActionsMenu";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listFacturesLivreur, getFacturesLivreurTotals, PER_PAGE } from "@/lib/server/facture-livreur.service";
import { formatMAD, formatNum } from "@/lib/colis-ui";
import type { FactureLivreurRow } from "@/lib/types/facture-livreur";

export const metadata = { title: "Factures livreurs" };
export const instant = false;

export default async function AgenceFacturesLivreursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/factures-livreurs");

  const { t, tv } = await getServerT();
  const cols: Column<FactureLivreurRow>[] = [
    {
      header: t("col.reference"),
      cell: (f) => <Link href={`/agence/factures-livreurs/${f.id}`} className="font-semibold text-brand-dark hover:text-brand">{f.reference}</Link>,
    },
    { header: t("col.livreur"), cell: (f) => <span className="font-medium">{f.livreur}</span> },
    { header: t("col.colis"), cell: (f) => <span className="font-semibold">{f.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.collecte"), cell: (f) => formatMAD(f.montantCollecte), className: "text-right", thClassName: "text-right" },
    { header: t("col.commission"), cell: (f) => <span className="text-muted">{formatMAD(f.commission)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.aVerser"), cell: (f) => <span className="font-semibold text-brand-dark">{formatMAD(f.montantAVerser)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.date"), cell: (f) => <span className="whitespace-nowrap text-muted">{f.date}</span> },
    { header: t("col.statut"), cell: (f) => <FactureLivStatutBadge statut={f.statut} /> },
    { header: "", cell: (f) => <FactureLivreurActionsMenu id={f.id} statut={f.statut} basePath="/agence/factures-livreurs" />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filters = { agenceId: user.agence.id, statut: sp.statut, dateFrom: sp.dateFrom, dateTo: sp.dateTo, search: sp.search };

  const [result, totals] = await Promise.all([
    listFacturesLivreur(filters, page, PER_PAGE),
    getFacturesLivreurTotals(filters),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.facturesLivreurs")} subtitle={t("page.facturesLivreurs.subAgence")} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stat.factures")} value={totals.count.toLocaleString("fr-FR")} icon={FileText} tone="slate" />
        <StatCard label={t("stat.montantCollecte")} value={formatNum(totals.montantCollecte)} unit="DH" icon={Wallet} tone="info" />
        <StatCard label={t("stat.commissions")} value={formatNum(totals.commission)} unit="DH" icon={Percent} tone="warning" />
        <StatCard label={t("stat.aRecevoir")} value={formatNum(totals.montantAVerser)} unit="DH" icon={HandCoins} tone="brand" hint={tv("stat.nonRegle", { m: formatMAD(totals.nonPayeAVerser) })} />
      </div>

      <DataTable columns={cols} rows={result.rows} rowKey={(f) => f.id} emptyLabel={t("empty.facturesNone")} />
      <Pagination basePath="/agence/factures-livreurs" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
