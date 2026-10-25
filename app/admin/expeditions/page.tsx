import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ExpeditionStatutBadge } from "@/components/ui/StatutBadge";
import { getServerT } from "@/lib/i18n/server";
import { listAllExpeditions, PER_PAGE } from "@/lib/server/expedition.service";
import type { ExpeditionRow } from "@/lib/types/expedition";

export const metadata = { title: "Expéditions agences" };
export const instant = false;

export default async function AdminExpeditionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t, tv } = await getServerT();
  const cols: Column<ExpeditionRow>[] = [
    { header: t("col.reference"), cell: (e) => <Link href={`/admin/expeditions/${e.id}`} className="font-semibold text-brand-dark hover:text-brand">{e.reference}</Link> },
    { header: t("col.trajet"), cell: (e) => <span className="flex items-center gap-1 text-muted">{e.agenceSource} <ArrowRight className="h-3 w-3" /> {e.agenceDest}</span> },
    { header: t("col.colis"), cell: (e) => <span className="font-semibold">{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.recus"), cell: (e) => <span className="text-muted">{e.recus}/{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.date"), cell: (e) => <span className="whitespace-nowrap text-muted">{e.date}</span> },
    { header: t("col.statut"), cell: (e) => <ExpeditionStatutBadge statut={e.statut} /> },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listAllExpeditions({ statut: sp.statut, search: sp.search }, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.expeditionsAgences")} subtitle={tv("sub.expeditionsInter", { n: result.total })} />
      <DataTable columns={cols} rows={result.rows} rowKey={(e) => e.id} emptyLabel={t("empty.expeditions")} />
      <Pagination basePath="/admin/expeditions" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
