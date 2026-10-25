import { Search, PackageSearch, MapPin, User, Truck, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { getServerT } from "@/lib/i18n/server";
import { getColisTracking } from "@/lib/server/colis.service";
import type { Tone } from "@/lib/colis-ui";
import type { StatusTone } from "@/lib/types/tracking";

export const metadata = { title: "Suivre un colis" };
export const instant = false;

const TONE: Record<StatusTone, Tone> = {
  done: "success",
  progress: "progress",
  pending: "warning",
  failed: "danger",
};

export default async function ClientSuiviPage({
  searchParams,
}: {
  searchParams: Promise<{ trk?: string }>;
}) {
  const { t } = await getServerT();
  const { trk } = await searchParams;
  const query = trk?.trim();
  const info = query ? await getColisTracking(query) : null;

  return (
    <div className="space-y-5">
      <PageHeader title={t("page.suivi.title")} subtitle={t("page.suivi.sub")} />

      <form action="/client/suivi" method="get" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <Search className="ms-2 h-5 w-5 shrink-0 text-muted" />
        <input
          name="trk"
          defaultValue={query ?? ""}
          placeholder={t("suivi.placeholder")}
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
        />
        <button type="submit" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark">
          {t("suivi.btn")}
        </button>
      </form>

      {query && !info && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t("suivi.notFound")} <b className="mx-1">{query}</b>. {t("suivi.verify")}
        </div>
      )}

      {info && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-brand-dark">
                <PackageSearch className="h-5 w-5" />
                <span className="font-mono text-sm font-bold">{info.trk}</span>
              </div>
              <div className="mt-3">
                <Badge tone={TONE[info.statusTone]}>{info.status}</Badge>
              </div>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                <Row icon={<MapPin className="h-4 w-4" />} label={t("col.trajet")} value={`${info.pickupCity} → ${info.destinationCity}`} />
                <Row icon={<User className="h-4 w-4" />} label={t("col.destinataire")} value={info.recipientName} />
                {info.vehicle && <Row icon={<Truck className="h-4 w-4" />} label={t("col.vehicule")} value={info.vehicle} />}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <h3 className="mb-5 font-semibold text-foreground">{t("suivi.historique")}</h3>
            {info.events.length > 0 ? (
              <TrackingTimeline events={info.events} />
            ) : (
              <p className="text-sm text-muted">{t("suivi.noEvent")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
