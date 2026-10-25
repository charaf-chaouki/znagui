import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ExpLivStatutBadge } from "@/components/ui/StatutBadge";
import { getServerT } from "@/lib/i18n/server";
import { listExpeditionsLivreur, PER_PAGE } from "@/lib/server/expedition-livreur.service";
import type { ExpeditionLivreurRow } from "@/lib/types/expedition-livreur";

export const metadata = { title: "Expéditions livreurs" };
export const instant = false;

export default async function AdminExpeditionsLivreurPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t, tv } = await getServerT();
  const cols: Column<ExpeditionLivreurRow>[] = [
    { header: t("col.reference"), cell: (e) => <Link href={`/admin/expeditions-livreur/${e.id}`} className="font-semibold text-brand-dark hover:text-brand">{e.reference}</Link> },
    { header: t("col.agence"), cell: (e) => e.agence },
    { header: t("col.livreur"), cell: (e) => e.livreur },
    { header: t("col.colis"), cell: (e) => <span className="font-semibold">{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.livres"), cell: (e) => <span className="text-muted">{e.livres}/{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.date"), cell: (e) => <span className="whitespace-nowrap text-muted">{e.date}</span> },
    { header: t("col.statut"), cell: (e) => <ExpLivStatutBadge statut={e.statut} /> },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listExpeditionsLivreur({}, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.expeditionsLivreurs")} subtitle={tv("sub.dispatchs", { n: result.total })} />
      <DataTable columns={cols} rows={result.rows} rowKey={(e) => e.id} emptyLabel={t("empty.dispatchs")} />
      <Pagination basePath="/admin/expeditions-livreur" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
