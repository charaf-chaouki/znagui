import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Printer, Package, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExpeditionStatutBadge } from "@/components/ui/StatutBadge";
import { getServerT } from "@/lib/i18n/server";
import { getExpeditionDetail } from "@/lib/server/expedition.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = await getExpeditionDetail(id);
  return { title: e ? `Expédition ${e.reference}` : "Expédition" };
}

export default async function AdminExpeditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, tv } = await getServerT();
  const e = await getExpeditionDetail(id);
  if (!e) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/expeditions" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("ed.expeditionsAgences")}
      </Link>
      <PageHeader
        title={tv("ed.ref", { ref: e.reference })}
        subtitle={e.date}
        action={
          <a href={`/api/pdf/expedition-agence/${e.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> {t("ed.bordereauPdf")}
          </a>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <ExpeditionStatutBadge statut={e.statut} />
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">{e.agenceSource} ({e.agenceSourceVille}) <ArrowRight className="h-4 w-4 text-slate-400" /> {e.agenceDest} ({e.agenceDestVille})</span>
        <span className="text-sm text-muted">{tv("ed.recusProgress", { recus: e.recus, total: e.total })}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-foreground"><Package className="h-4 w-4 text-brand" /> {tv("ed.colisCount", { n: e.total })}</div>
        <div className="divide-y divide-slate-100">
          {e.lignes.map((l) => (
            <div key={l.colisId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-mono text-sm font-semibold text-brand-dark">{l.trk}</p>
                <p className="text-xs text-muted">{l.recipient} · {l.destCity}</p>
              </div>
              {l.received
                ? <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-darker"><Check className="h-3.5 w-3.5" /> {t("ed.recu")}</span>
                : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{t("ed.enTransit")}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
