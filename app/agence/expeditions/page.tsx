import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ExpeditionStatutBadge } from "@/components/ui/StatutBadge";
import { ExpeditionScanInput } from "@/components/expedition/ExpeditionScanInput";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listExpeditions, PER_PAGE } from "@/lib/server/expedition.service";
import type { ExpeditionRow, ExpeditionDirection } from "@/lib/types/expedition";

export const metadata = { title: "Expéditions agences" };
export const instant = false;

export default async function AgenceExpeditionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/expeditions");

  const { t } = await getServerT();
  const cols: Column<ExpeditionRow>[] = [
    { header: t("col.reference"), cell: (e) => <Link href={`/agence/expeditions/${e.id}`} className="font-semibold text-brand-dark hover:text-brand">{e.reference}</Link> },
    { header: t("col.trajet"), cell: (e) => <span className="flex items-center gap-1 text-muted">{e.agenceSource} <ArrowRight className="h-3 w-3" /> {e.agenceDest}</span> },
    { header: t("col.colis"), cell: (e) => <span className="font-semibold">{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.recus"), cell: (e) => <span className="text-muted">{e.recus}/{e.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.date"), cell: (e) => <span className="whitespace-nowrap text-muted">{e.date}</span> },
    { header: t("col.statut"), cell: (e) => <ExpeditionStatutBadge statut={e.statut} /> },
  ];

  const sp = await searchParams;
  const direction: ExpeditionDirection = sp.dir === "reception" ? "reception" : "envoi";
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listExpeditions(user.agence.id, direction, { statut: sp.statut }, page, PER_PAGE);

  const tab = (dir: ExpeditionDirection, label: string) => {
    const active = direction === dir;
    return (
      <Link href={`/agence/expeditions?dir=${dir}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-brand text-brand-contrast" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</Link>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.expeditionsAgences")}
        subtitle={t("page.agenceExpeditions.sub")}
        action={
          <Link href="/agence/expeditions/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newExpedition")}
          </Link>
        }
      />

      <div className="flex gap-2">{tab("envoi", t("tab.envois"))}{tab("reception", t("tab.receptions"))}</div>

      {direction === "reception" && <ExpeditionScanInput endpoint="/api/agence/expeditions/scan" title={t("scan.expeditionTitle")} />}

      <DataTable columns={cols} rows={result.rows} rowKey={(e) => e.id} emptyLabel={direction === "envoi" ? t("empty.envoi") : t("empty.reception")} />
      <Pagination basePath="/agence/expeditions" params={{ ...sp, dir: direction }} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
