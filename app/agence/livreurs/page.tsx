import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { LivreurActionsMenu } from "@/components/livreurs/LivreurActionsMenu";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listLivreurs, PER_PAGE } from "@/lib/server/livreur.service";
import type { LivreurRow } from "@/lib/types/livreur";

export const metadata = { title: "Livreurs" };
export const instant = false;

export default async function AgenceLivreursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/livreurs");

  const { t, tv } = await getServerT();
  const cols: Column<LivreurRow>[] = [
    {
      header: t("col.livreur"),
      cell: (l) => (
        <Link href={`/agence/livreurs/${l.id}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{(l.prenom[0] ?? "") + (l.nom[0] ?? "")}</span>
          <span>
            <span className="block font-semibold text-foreground hover:text-brand">{l.prenom} {l.nom}</span>
            <span className="block text-xs text-muted">{l.telephone}</span>
          </span>
        </Link>
      ),
    },
    { header: t("col.ville"), cell: (l) => <span className="text-muted">{l.ville}</span> },
    { header: t("col.vehicule"), cell: (l) => <span className="text-muted">{t(`veh.${l.vehicleType}`)}</span> },
    { header: t("col.livraisons"), cell: (l) => <span className="font-semibold">{l.livraisons}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.statut"), cell: (l) => <AccountStatutBadge statut={l.status} /> },
    { header: "", cell: (l) => <LivreurActionsMenu id={l.id} status={l.status} basePath="/agence/livreurs" />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listLivreurs({ agenceId: user.agence.id, status: sp.status, search: sp.search }, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.livreurs")}
        subtitle={tv("count.livreursPlain", { n: result.total })}
        action={
          <Link href="/agence/livreurs/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newLivreur")}
          </Link>
        }
      />
      <DataTable columns={cols} rows={result.rows} rowKey={(l) => l.id} emptyLabel={t("empty.livreurs")} />
      <Pagination basePath="/agence/livreurs" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
