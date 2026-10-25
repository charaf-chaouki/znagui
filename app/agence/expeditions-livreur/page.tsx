import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ExpLivStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listExpeditionsLivreur, PER_PAGE } from "@/lib/server/expedition-livreur.service";
import type { ExpeditionLivreurRow } from "@/lib/types/expedition-livreur";

export const metadata = { title: "Expéditions livreurs" };
export const instant = false;

export default async function AgenceExpeditionsLivreurPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/expeditions-livreur");

  const { t } = await getServerT();
  const cols: Column<ExpeditionLivreurRow>[] = [
    { header: t("col.reference"), cell: (e) => <Link href={`/agence/expeditions-livreur/${e.id}`} className="font-semibold text-brand-dark hover:text-brand">{e.reference}</Link> },
    { header: t("col.livreur"), cell: (e) => e.livreur },
    { header: t("col.colis"), cell: (e) => <span className="font-semibold">{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.livres"), cell: (e) => <span className="text-muted">{e.livres}/{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.date"), cell: (e) => <span className="whitespace-nowrap text-muted">{e.date}</span> },
    { header: t("col.statut"), cell: (e) => <ExpLivStatutBadge statut={e.statut} /> },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listExpeditionsLivreur({ agenceId: user.agence.id }, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.expeditionsLivreurs")}
        subtitle={t("page.agenceExpLiv.sub")}
        action={
          <Link href="/agence/expeditions-livreur/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newDispatch")}
          </Link>
        }
      />
      <DataTable columns={cols} rows={result.rows} rowKey={(e) => e.id} emptyLabel={t("empty.dispatchs")} />
      <Pagination basePath="/agence/expeditions-livreur" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
