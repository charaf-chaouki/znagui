import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Package, MapPin, Building2, Bike } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RamassageStatutBadge, ColisRamBadge } from "@/components/ui/StatutBadge";
import { getServerT } from "@/lib/i18n/server";
import { getRamassageDetail } from "@/lib/server/ramassage.service";
import { formatMAD } from "@/lib/colis-ui";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await getRamassageDetail(id);
  return { title: r ? `Ramassage ${r.reference}` : "Ramassage" };
}

export default async function AdminRamassageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, tv } = await getServerT();
  const r = await getRamassageDetail(id);
  if (!r) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/ramassages" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.ramassages")}
      </Link>

      <PageHeader title={tv("rd.ref", { ref: r.reference })} subtitle={tv("rd.subAgenceDate", { agence: r.agence, date: r.date })} />
      <div className="flex flex-wrap items-center gap-3">
        <RamassageStatutBadge statut={r.statut} />
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground"><Building2 className="h-4 w-4 text-slate-400" /> {r.agence}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground"><Bike className="h-4 w-4 text-slate-400" /> {r.livreur}</span>
        <span className="text-sm text-muted">{tv("rd.progress", { ramasses: r.ramasses, total: r.total, recus: r.recus })}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-foreground">
          <Package className="h-4 w-4 text-brand" /> {tv("rd.colisCount", { n: r.total })}
        </div>
        <div className="divide-y divide-slate-100">
          {r.lignes.map((l) => (
            <div key={l.colisId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-brand-dark">{l.trk}</p>
                <p className="flex items-center gap-1 text-xs text-muted"><User className="h-3 w-3" /> {l.client} · → {l.destCity}</p>
                <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {l.pickupAddress}</p>
              </div>
              <div className="shrink-0 text-right">
                <ColisRamBadge state={l.state} />
                <p className="mt-1 text-xs text-muted">{formatMAD(l.cod)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
