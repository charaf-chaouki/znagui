import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Inbox } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ParcelCard } from "@/components/livreur/ParcelCard";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import { listLivreurColis, PER_PAGE } from "@/lib/server/livreur-portal.service";
import type { LivreurColisGroup } from "@/lib/types/livreur-portal";

export const metadata = { title: "Mes colis" };
export const instant = false;

const TABS: { key: LivreurColisGroup; labelKey: MessageKey }[] = [
  { key: "EN_COURS", labelKey: "livreur.enCours" },
  { key: "LIVRE", labelKey: "livreur.tabLivre" },
  { key: "ECHOUEE", labelKey: "livreur.echouee" },
];

export default async function LivreurColisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/colis");

  const { t, tv } = await getServerT();
  const sp = await searchParams;
  const tab = (TABS.find((x) => x.key === sp.tab)?.key ?? "EN_COURS") as LivreurColisGroup;
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listLivreurColis(user.livreur.id, tab, search, page, PER_PAGE);

  const tabHref = (key: string) => {
    const p = new URLSearchParams();
    p.set("tab", key);
    if (search) p.set("search", search);
    return `/livreur/colis?${p}`;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">{t("page.mesColis")}</h1>

      {/* Search */}
      <form action="/livreur/colis" method="get" className="relative">
        <input type="hidden" name="tab" value={tab} />
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="search" defaultValue={search ?? ""} placeholder={t("livreur.searchColis2")} className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </form>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tb) => {
          const active = tb.key === tab;
          return (
            <Link
              key={tb.key}
              href={tabHref(tb.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-brand text-brand-contrast" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {t(tb.labelKey)}
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-muted">{tv("count.colis", { n: result.total })}</p>

      {result.rows.length > 0 ? (
        <div className="space-y-3">{result.rows.map((c) => <ParcelCard key={c.id} c={c} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-muted">{t("livreur.noColisCat")}</p>
        </div>
      )}

      <Pagination basePath="/livreur/colis" params={{ ...sp, tab }} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
