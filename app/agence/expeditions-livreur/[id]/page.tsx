import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Printer, Bike, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExpeditionLivreurDetail } from "@/lib/server/expedition-livreur.service";
import { EXP_LIV_STATUT_LABEL, EXP_LIV_STATUT_TONE, DISPATCH_STATE_LABEL, DISPATCH_STATE_TONE } from "@/lib/expedition-livreur-ui";
import { formatMAD } from "@/lib/colis-ui";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = await getExpeditionLivreurDetail(id);
  return { title: e ? `Dispatch ${e.reference}` : "Dispatch" };
}

export default async function AgenceDispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/expeditions-livreur");

  const { id } = await params;
  const e = await getExpeditionLivreurDetail(id);
  if (!e || e.agenceId !== user.agence.id) notFound();

  return (
    <div className="space-y-5">
      <Link href="/agence/expeditions-livreur" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Expéditions livreurs
      </Link>
      <PageHeader
        title={`Dispatch ${e.reference}`}
        subtitle={`${e.livreur} · ${e.date}`}
        action={
          <a href={`/api/pdf?p=${encodeURIComponent(`/agence/expeditions-livreur/${e.id}/pdf`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> Bordereau PDF
          </a>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={EXP_LIV_STATUT_TONE[e.statut]}>{EXP_LIV_STATUT_LABEL[e.statut]}</Badge>
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground"><Bike className="h-4 w-4 text-slate-400" /> {e.livreur}</span>
        <span className="text-sm text-muted">Livrés {e.livres}/{e.total}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-foreground"><Package className="h-4 w-4 text-brand" /> Colis ({e.total})</div>
        <div className="divide-y divide-slate-100">
          {e.lignes.map((l) => (
            <div key={l.colisId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-mono text-sm font-semibold text-brand-dark">{l.trk}</p>
                <p className="text-xs text-muted">{l.recipient} · {l.destAddress}, {l.destCity}</p>
              </div>
              <div className="shrink-0 text-right">
                <Badge tone={DISPATCH_STATE_TONE[l.state]}>{DISPATCH_STATE_LABEL[l.state]}</Badge>
                <p className="mt-1 text-xs text-muted">{formatMAD(l.cod)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
