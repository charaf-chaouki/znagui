import Link from "next/link";
import { MapPin, Package, Route, ChevronRight } from "lucide-react";
import { formatMAD } from "@/lib/colis-ui";
import { getServerT } from "@/lib/i18n/server";
import { TakeButton } from "@/components/livreur/TakeButton";
import type { LivreurColisCard } from "@/lib/types/livreur-portal";

// A same-ville INTRA colis nobody has taken yet. Clickable to view, with a Prendre action.
export async function AvailableColisCard({ c }: { c: LivreurColisCard }) {
  const { t } = await getServerT();
  const href = `/livreur/colis/${encodeURIComponent(c.trk)}`;
  return (
    <div className="rounded-2xl border border-brand/30 bg-white p-4 shadow-sm">
      <Link href={href} className="block">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-mono text-sm font-bold text-brand-dark">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark"><Package className="h-4 w-4" /></span>
            {c.trk}
          </span>
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-darker">{t("livreur.disponible")}</span>
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-brand-darker">
            <Route className="h-3.5 w-3.5" /> {c.pickupCity} → {c.destCity}
          </p>
          <p className="font-semibold text-foreground">{c.recipient}</p>
          <p className="flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {c.destAddress}, {c.destCity}</p>
        </div>
      </Link>

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
          <Link href={href} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 active:scale-95" aria-label={t("common.details")}>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <TakeButton colisId={c.id} trk={c.trk} />
        </div>
      </div>
    </div>
  );
}
