import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ColisStatutBadge } from "@/components/ui/StatutBadge";
import { ColisActionsMenu } from "@/components/colis/ColisActionsMenu";
import { ColisFilters } from "@/components/colis/ColisFilters";
import { ColisSearch } from "@/components/colis/ColisSearch";
import { formatMAD } from "@/lib/colis-ui";
import { getServerT } from "@/lib/i18n/server";
import { listColis, PER_PAGE } from "@/lib/server/colis.service";
import type { ColisRow } from "@/lib/types/colis";

export const metadata = { title: "Colis" };
export const instant = false;

const VEHICLE_KEY = { MOTO: "veh.MOTO", VOITURE: "veh.VOITURE", CAMION: "veh.CAMION" } as const;

export default async function ColisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t } = await getServerT();
  const cols: Column<ColisRow>[] = [
    { header: t("col.trk"), cell: (c) => <Link href={`/admin/colis/${c.trk}`} className="font-semibold text-brand-dark hover:underline">{c.trk}</Link> },
    { header: t("col.client"), cell: (c) => c.client },
    { header: t("col.trajet"), cell: (c) => <span className="text-muted">{c.pickupCity} → {c.destCity}</span> },
    { header: t("col.zone"), cell: (c) => <Badge tone={c.type === "INTRA" ? "info" : "progress"}>{c.type === "INTRA" ? t("type.intra") : t("type.interVilles")}</Badge> },
    { header: t("col.vehicule"), cell: (c) => <span className="text-muted">{t(VEHICLE_KEY[c.vehicle as keyof typeof VEHICLE_KEY] ?? "veh.MOTO")}</span> },
    { header: t("col.statut"), cell: (c) => <ColisStatutBadge statut={c.statut} /> },
    { header: t("col.tarif"), cell: (c) => formatMAD(c.tarif), thClassName: "text-right", className: "text-right" },
    { header: t("col.cod"), cell: (c) => <span className="font-medium">{formatMAD(c.cod)}</span>, thClassName: "text-right", className: "text-right" },
    { header: t("col.date"), cell: (c) => <span className="whitespace-nowrap text-muted">{c.date}</span> },
    { header: "", cell: (c) => <ColisActionsMenu id={c.id} trk={c.trk} statut={c.statut} />, thClassName: "w-12" },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listColis(
    {
      statut: sp.statut,
      depart: sp.depart,
      destination: sp.destination,
      vehicle: sp.vehicle,
      dateFrom: sp.dateFrom,
      dateTo: sp.dateTo,
      search: sp.search,
    },
    page,
    PER_PAGE,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.colis")}
        subtitle={t("count.colis").replace("{n}", String(result.total))}
        action={
          <Link href="/admin/colis/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.addColis")}
          </Link>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ColisSearch />
        <ColisFilters />
      </div>

      <DataTable columns={cols} rows={result.rows} rowKey={(c) => c.id} emptyLabel={t("empty.colisFilters")} />

      <Pagination
        basePath="/admin/colis"
        params={sp}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        perPage={result.perPage}
      />
    </div>
  );
}
