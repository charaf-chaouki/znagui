import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ColisStatutBadge, ColisTypeBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import { listAgenceColis, getAgenceColisTabCounts, PER_PAGE, type AgenceColisTab } from "@/lib/server/agence-colis.service";
import { formatMAD } from "@/lib/colis-ui";
import { prisma } from "@/lib/db";
import type { ColisRow } from "@/lib/types/colis";

export const metadata = { title: "Colis" };
export const instant = false;

const TABS: { key: AgenceColisTab; labelKey: MessageKey }[] = [
  { key: "tous", labelKey: "tab.tous" },
  { key: "nouveaux", labelKey: "tab.nouveaux" },
  { key: "ramassage", labelKey: "tab.ramassage" },
  { key: "entrepot", labelKey: "tab.entrepot" },
  { key: "expedies", labelKey: "tab.expedies" },
  { key: "recus", labelKey: "tab.recus" },
  { key: "livraison", labelKey: "tab.livraison" },
  { key: "termines", labelKey: "tab.termines" },
];

export default async function AgenceColisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/colis");

  const { t } = await getServerT();
  const cols: Column<ColisRow>[] = [
    { header: t("col.trk"), cell: (c) => <Link href={`/agence/colis/${c.trk}`} className="font-semibold text-brand-dark hover:text-brand">{c.trk}</Link> },
    { header: t("col.client"), cell: (c) => c.client },
    { header: t("col.trajet"), cell: (c) => <span className="text-muted">{c.pickupCity} → {c.destCity}</span> },
    { header: t("col.type"), cell: (c) => <ColisTypeBadge type={c.type} /> },
    { header: t("col.statut"), cell: (c) => <ColisStatutBadge statut={c.statut} /> },
    { header: t("col.cod"), cell: (c) => <span className="font-medium">{formatMAD(c.cod)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.date"), cell: (c) => <span className="whitespace-nowrap text-muted">{c.date}</span> },
  ];

  const agence = await prisma.agence.findUnique({ where: { id: user.agence.id }, select: { villeId: true } });
  const villeId = agence?.villeId ?? "";

  const sp = await searchParams;
  const tab = (TABS.find((x) => x.key === sp.tab)?.key ?? "tous") as AgenceColisTab;
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const [result, counts] = await Promise.all([
    listAgenceColis(user.agence.id, villeId, tab, { search }, page, PER_PAGE),
    getAgenceColisTabCounts(user.agence.id, villeId),
  ]);

  const tabHref = (key: string) => {
    const p = new URLSearchParams();
    p.set("tab", key);
    if (search) p.set("search", search);
    return `/agence/colis?${p}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.colis")}
        subtitle={t("page.agenceColis.sub")}
        action={
          <Link href="/agence/colis/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.addColis")}
          </Link>
        }
      />

      <form action="/agence/colis" method="get" className="relative w-full max-w-xs">
        <input type="hidden" name="tab" value={tab} />
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="search" defaultValue={search ?? ""} placeholder={t("search.colisAgence")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </form>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tb) => {
          const active = tb.key === tab;
          return (
            <Link key={tb.key} href={tabHref(tb.key)} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? "bg-brand text-brand-contrast" : "border border-slate-200 bg-white text-slate-600 hover:border-brand"}`}>
              {t(tb.labelKey)}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{counts[tb.key]}</span>
            </Link>
          );
        })}
      </div>

      <DataTable columns={cols} rows={result.rows} rowKey={(c) => c.id} emptyLabel={t("empty.colisCategory")} />
      <Pagination basePath="/agence/colis" params={{ ...sp, tab }} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
