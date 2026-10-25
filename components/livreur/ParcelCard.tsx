import Link from "next/link";
import { MapPin, Phone, ChevronRight, Package, Route } from "lucide-react";
import { ColisStatutBadge } from "@/components/ui/StatutBadge";
import { formatMAD } from "@/lib/colis-ui";
import { getServerT } from "@/lib/i18n/server";
import type { LivreurColisCard } from "@/lib/types/livreur-portal";

export async function ParcelCard({ c }: { c: LivreurColisCard }) {
  const { t } = await getServerT();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/livreur/colis/${encodeURIComponent(c.trk)}`} className="flex items-center gap-2 font-mono text-sm font-bold text-brand-dark">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark"><Package className="h-4 w-4" /></span>
          {c.trk}
        </Link>
        <ColisStatutBadge statut={c.statut} />
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand-darker">
          <Route className="h-3.5 w-3.5" /> {c.pickupCity} → {c.destCity}
        </p>
        <p className="font-semibold text-foreground">{c.recipient}</p>
        <p className="flex items-start gap-1.5 text-sm text-muted">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{c.destAddress}, {c.destCity}</span>
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{t("livreur.aEncaisser")}</p>
            <p className="font-bold text-foreground">{formatMAD(c.cod)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{t("col.tarif")}</p>
            <p className="font-semibold text-muted">{formatMAD(c.tarif)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${c.recipientPhone}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 active:scale-95" aria-label={t("livreur.appeler")}>
            <Phone className="h-4 w-4" />
          </a>
          <Link href={`/livreur/colis/${encodeURIComponent(c.trk)}`} className="inline-flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast active:scale-95">
            {t("common.details")} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
