import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { ClientActionsMenu } from "@/components/clients/ClientActionsMenu";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listClients, PER_PAGE } from "@/lib/server/client.service";
import { prisma } from "@/lib/db";
import type { ClientRow } from "@/lib/types/client";

export const metadata = { title: "Clients" };
export const instant = false;

export default async function AgenceClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/clients");

  const { t, tv } = await getServerT();
  const cols: Column<ClientRow>[] = [
    {
      header: t("col.client"),
      cell: (c) => (
        <Link href={`/agence/clients/${c.id}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand-dark">{c.nom.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
          <span>
            <span className="block font-semibold text-foreground hover:text-brand">{c.nom}</span>
            <span className="block text-xs text-muted">{c.telephone}</span>
          </span>
        </Link>
      ),
    },
    { header: t("col.colisTotal"), cell: (c) => <span className="font-semibold">{c.colisTotal}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.inscritLe"), cell: (c) => <span className="whitespace-nowrap text-muted">{c.createdAt}</span> },
    { header: t("col.statut"), cell: (c) => <AccountStatutBadge statut={c.status} /> },
    { header: "", cell: (c) => <ClientActionsMenu id={c.id} status={c.status} basePath="/agence/clients" />, thClassName: "w-12" },
  ];

  const agence = await prisma.agence.findUnique({ where: { id: user.agence.id }, select: { ville: { select: { nom: true } } } });
  const villeNom = agence?.ville.nom ?? "";

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listClients({ ville: villeNom, status: sp.status, search: sp.search }, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.clients")}
        subtitle={tv("sub.clientsVille", { n: result.total, v: villeNom })}
        action={
          <Link href="/agence/clients/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newClient")}
          </Link>
        }
      />
      <form action="/agence/clients" method="get" className="relative w-full max-w-xs">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="search" defaultValue={sp.search ?? ""} placeholder={t("search.client")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </form>
      <DataTable columns={cols} rows={result.rows} rowKey={(c) => c.id} emptyLabel={t("empty.clients")} />
      <Pagination basePath="/agence/clients" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
