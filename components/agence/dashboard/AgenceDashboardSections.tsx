import Link from "next/link";
import { Package, PackageCheck, Truck, UserRound, CheckCircle2, Boxes, Wallet, Building2, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { ColisStatutBadge } from "@/components/ui/StatutBadge";
import { formatMAD, formatNum } from "@/lib/colis-ui";
import { getServerT } from "@/lib/i18n/server";
import { colisStatutLabel } from "@/lib/i18n/labels";
import {
  getAgenceKpis, getAgenceActivity7j, getAgenceStatutDistribution, getAgenceRecentColis,
  type RecentColisRow,
} from "@/lib/server/agence-dashboard.service";

// ─── KPI cards ──────────────────────────────────────────
export async function AgenceKpiCards({ agenceId, villeId }: { agenceId: string; villeId: string }) {
  const [{ t }, k] = await Promise.all([getServerT(), getAgenceKpis(agenceId, villeId)]);
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label={t("stat.colisMaVille")} value={k.colisVille.toLocaleString("fr-FR")} icon={Package} tone="brand" />
      <StatCard label={t("stat.aRamasser")} value={k.aRamasser} icon={PackageCheck} tone="warning" />
      <StatCard label={t("stat.enLivraison")} value={k.enLivraison} icon={Truck} tone="info" />
      <StatCard label={t("stat.livresCeMois")} value={k.livresMois.toLocaleString("fr-FR")} icon={CheckCircle2} tone="brand" />
      <StatCard label={t("stat.ramassagesActifs")} value={k.ramassagesActifs} icon={Boxes} tone="info" />
      <StatCard label={t("stat.livreurs")} value={k.livreurs} icon={UserRound} tone="slate" />
      <StatCard label={t("stat.aEncaisserShort")} value={formatNum(k.codAEncaisser)} unit="DH" icon={Wallet} tone="warning" hint={t("stat.encoursLivraison")} />
      <StatCard label={t("stat.aVerserDirection")} value={formatNum(k.aVerserDirection)} unit="DH" icon={Building2} tone="brand" hint={t("stat.facturesNonReglees")} />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Charts (7-day activity + status distribution) ──────
export async function AgenceCharts({ agenceId, villeId }: { agenceId: string; villeId: string }) {
  const [{ t, locale }, activite, distribution] = await Promise.all([
    getServerT(),
    getAgenceActivity7j(villeId),
    getAgenceStatutDistribution(agenceId, villeId),
  ]);
  const maxJour = Math.max(1, ...activite.map((d) => d.colis));
  const maxStatut = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t("dash.activity7j")}</h3>
          <span className="text-xs text-muted">{t("dash.colisCreatedMyCity")}</span>
        </div>
        <div className="mt-6 flex h-44 items-end justify-between gap-3">
          {activite.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{d.colis}</span>
              <div className="flex w-full flex-1 items-end">
                <div className="w-full rounded-t-md bg-brand/85 transition-all hover:bg-brand" style={{ height: `${(d.colis / maxJour) * 100}%` }} />
              </div>
              <span className="text-xs capitalize text-muted">{d.jour}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-foreground">{t("dash.statutDistribution")}</h3>
        {distribution.length === 0 ? (
          <p className="mt-6 text-sm text-muted">{t("dash.noColisYet")}</p>
        ) : (
          <div className="mt-5 max-h-44 space-y-3 overflow-y-auto pr-1">
            {distribution.map((d) => (
              <div key={d.statut}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{colisStatutLabel(locale, d.statut)}</span>
                  <span className="font-semibold text-foreground">{d.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(d.count / maxStatut) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <Skeleton className="h-5 w-56" />
        <div className="mt-6 flex h-44 items-end justify-between gap-3">
          {[40, 70, 55, 90, 50, 75, 60].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end"><Skeleton className="w-full rounded-t-md" style={{ height: `${h}%` }} /></div>
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-6" /></div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recent colis ───────────────────────────────────────
export async function AgenceRecentColis({ agenceId, villeId }: { agenceId: string; villeId: string }) {
  const [{ t }, rows] = await Promise.all([getServerT(), getAgenceRecentColis(agenceId, villeId)]);
  const cols: Column<RecentColisRow>[] = [
    { header: t("col.trk"), cell: (c) => <Link href={`/agence/colis/${c.trk}`} className="font-semibold text-brand-dark hover:text-brand">{c.trk}</Link> },
    { header: t("col.client"), cell: (c) => c.client },
    { header: t("col.trajet"), cell: (c) => <span className="text-muted">{c.pickupCity} → {c.destCity}</span> },
    { header: t("col.statut"), cell: (c) => <ColisStatutBadge statut={c.statut} /> },
    { header: t("col.cod"), cell: (c) => <span className="font-medium">{formatMAD(c.cod)}</span>, thClassName: "text-right", className: "text-right" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{t("dash.recentColis")}</h3>
        <Link href="/agence/colis" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
          {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <DataTable columns={cols} rows={rows} rowKey={(c) => c.id} emptyLabel={t("empty.colis")} />
    </div>
  );
}

export function RecentSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5 last:border-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
