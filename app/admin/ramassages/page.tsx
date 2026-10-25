import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { RamassageStatutBadge } from "@/components/ui/StatutBadge";
import { AdminRamassageToolbar } from "@/components/ramassage/AdminRamassageToolbar";
import { getServerT } from "@/lib/i18n/server";
import { listRamassages, PER_PAGE } from "@/lib/server/ramassage.service";
import { prisma } from "@/lib/db";
import type { RamassageRow } from "@/lib/types/ramassage";

export const metadata = { title: "Ramassages" };
export const instant = false;

export default async function AdminRamassagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t, tv } = await getServerT();
  const cols: Column<RamassageRow>[] = [
    { header: t("col.reference"), cell: (r) => <Link href={`/admin/ramassages/${r.id}`} className="font-semibold text-brand-dark hover:text-brand">{r.reference}</Link> },
    { header: t("col.agence"), cell: (r) => r.agence },
    { header: t("col.livreur"), cell: (r) => r.livreur },
    { header: t("col.colis"), cell: (r) => <span className="font-semibold">{r.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.recus"), cell: (r) => <span className="text-muted">{r.recus}/{r.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.date"), cell: (r) => <span className="whitespace-nowrap text-muted">{r.date}</span> },
    { header: t("col.statut"), cell: (r) => <RamassageStatutBadge statut={r.statut} /> },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [result, agences] = await Promise.all([
    listRamassages(undefined, { statut: sp.statut, agenceId: sp.agenceId, search: sp.search }, page, PER_PAGE),
    prisma.agence.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.ramassages")} subtitle={tv("sub.ramassagesAll", { n: result.total })} />
      <AdminRamassageToolbar agences={agences} />
      <DataTable columns={cols} rows={result.rows} rowKey={(r) => r.id} emptyLabel={t("empty.ramassages")} />
      <Pagination basePath="/admin/ramassages" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
