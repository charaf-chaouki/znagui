import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { AgenceToolbar } from "@/components/agences/AgenceToolbar";
import { AgenceActionsMenu } from "@/components/agences/AgenceActionsMenu";
import { getServerT } from "@/lib/i18n/server";
import { listAgences, PER_PAGE } from "@/lib/server/agence.service";
import type { AgenceRow } from "@/lib/types/agence";

export const metadata = { title: "Agences" };
export const instant = false;

export default async function AgencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t, tv } = await getServerT();
  const cols: Column<AgenceRow>[] = [
    {
      header: t("col.agence"),
      cell: (a) => (
        <Link href={`/admin/agences/${a.id}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
            <Building2 className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-semibold text-foreground hover:text-brand">{a.nom}</span>
            <span className="block text-xs text-muted">{a.ville}</span>
          </span>
        </Link>
      ),
    },
    { header: t("col.responsable"), cell: (a) => a.responsable },
    { header: t("col.telephone"), cell: (a) => <span className="text-muted">{a.telephone}</span> },
    { header: t("col.email"), cell: (a) => <span className="text-muted">{a.email}</span> },
    { header: t("nav.livreurs"), cell: (a) => <span className="font-semibold">{a.livreurs}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.statut"), cell: (a) => <AccountStatutBadge statut={a.status} /> },
    { header: "", cell: (a) => <AgenceActionsMenu id={a.id} status={a.status} />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listAgences(
    { ville: sp.ville, status: sp.status, search: sp.search },
    page,
    PER_PAGE,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.agences")}
        subtitle={tv("count.agences", { n: result.total })}
        action={
          <Link href="/admin/agences/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newAgence")}
          </Link>
        }
      />
      <AgenceToolbar />
      <DataTable columns={cols} rows={result.rows} rowKey={(a) => a.id} emptyLabel={t("empty.agences")} />
      <Pagination
        basePath="/admin/agences"
        params={sp}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        perPage={result.perPage}
      />
    </div>
  );
}
