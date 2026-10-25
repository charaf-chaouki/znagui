import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { ExpLivStatutBadge, DispatchStateBadge } from "@/components/ui/StatutBadge";
import { ValiderReceptionButton } from "@/components/livreur/ValiderReceptionButton";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getLivreurDispatchDetail } from "@/lib/server/expedition-livreur.service";
import { formatMAD } from "@/lib/colis-ui";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Dispatch ${id.slice(0, 8)}` };
}

export default async function LivreurDispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/expeditions");

  const { id } = await params;
  const { t, tv } = await getServerT();
  const e = await getLivreurDispatchDetail(user.livreur.id, id);
  if (!e) notFound();

  const toReceive = e.lignes.some((l) => l.state === "DISPATCHE");

  return (
    <div className="space-y-4">
      <Link href="/livreur/expeditions" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("ed.expeditions")}
      </Link>
      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-brand-dark">{e.reference}</span>
        <ExpLivStatutBadge statut={e.statut} />
      </div>
      <p className="text-sm text-muted">{tv("ed.subColisCount", { agence: e.agence, n: e.total })}</p>

      {toReceive && (
        <div className="space-y-3 rounded-2xl border border-brand/30 bg-brand-light/30 p-4">
          <p className="text-sm text-foreground">{t("ed.confirmRecup")}</p>
          <ValiderReceptionButton dispatchId={e.id} />
        </div>
      )}

      <div className="space-y-3">
        {e.lignes.map((l) => (
          <div key={l.colisId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/livreur/colis/${encodeURIComponent(l.trk)}`} className="font-mono text-sm font-bold text-brand-dark hover:text-brand">{l.trk}</Link>
              <DispatchStateBadge state={l.state} />
            </div>
            <p className="mt-2 font-medium text-foreground">{l.recipient}</p>
            <p className="flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {l.destAddress}, {l.destCity}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{tv("ed.aEncaisser", { m: formatMAD(l.cod) })}</p>
          </div>
        ))}
      </div>

      {!toReceive && (
        <Link href="/livreur/colis" className="block rounded-xl bg-brand py-3 text-center text-sm font-bold text-brand-contrast active:scale-[0.99]">
          {t("ed.allerLivrer")}
        </Link>
      )}
    </div>
  );
}
