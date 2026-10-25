import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { ClientToolbar } from "@/components/clients/ClientToolbar";
import { ClientActionsMenu } from "@/components/clients/ClientActionsMenu";
import { getServerT } from "@/lib/i18n/server";
import { listClients, PER_PAGE } from "@/lib/server/client.service";
import type { ClientRow } from "@/lib/types/client";

export const metadata = { title: "Clients" };
export const instant = false;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t, tv } = await getServerT();
  const cols: Column<ClientRow>[] = [
    {
      header: t("col.client"),
      cell: (c) => (
        <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand-dark">
            {c.nom.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <span>
            <span className="block font-semibold text-foreground hover:text-brand">{c.nom}</span>
            <span className="block text-xs text-muted">{c.telephone}</span>
          </span>
        </Link>
      ),
    },
    { header: t("col.ville"), cell: (c) => <span className="text-muted">{c.ville}</span> },
    { header: t("col.colisTotal"), cell: (c) => <span className="font-semibold">{c.colisTotal}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.inscritLe"), cell: (c) => <span className="whitespace-nowrap text-muted">{c.createdAt}</span> },
    { header: t("col.statut"), cell: (c) => <AccountStatutBadge statut={c.status} /> },
    { header: "", cell: (c) => <ClientActionsMenu id={c.id} status={c.status} />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listClients({ ville: sp.ville, status: sp.status, search: sp.search }, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.clients")}
        subtitle={tv("count.clients", { n: result.total })}
        action={
          <Link href="/admin/clients/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newClient")}
          </Link>
        }
      />
      <ClientToolbar />
      <DataTable columns={cols} rows={result.rows} rowKey={(c) => c.id} emptyLabel={t("empty.clients")} />
      <Pagination basePath="/admin/clients" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
