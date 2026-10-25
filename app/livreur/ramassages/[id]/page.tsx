import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { RamassageStatutBadge, ColisRamBadge } from "@/components/ui/StatutBadge";
import { RamasseColisButton } from "@/components/livreur/RamasseColisButton";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getLivreurRamassageDetail } from "@/lib/server/ramassage.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Ramassage ${id.slice(0, 8)}` };
}

export default async function LivreurRamassageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/ramassages");

  const { id } = await params;
  const { t, tv } = await getServerT();
  const r = await getLivreurRamassageDetail(user.livreur.id, id);
  if (!r) notFound();

  return (
    <div className="space-y-4">
      <Link href="/livreur/ramassages" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.ramassages")}
      </Link>

      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-brand-dark">{r.reference}</span>
        <RamassageStatutBadge statut={r.statut} />
      </div>
      <p className="text-sm text-muted">{tv("rd.livreurProgress", { agence: r.agence, ramasses: r.ramasses, total: r.total })}</p>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("rd.livreurHint")}
      </div>

      <div className="space-y-3">
        {r.lignes.map((l) => (
          <div key={l.colisId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-brand-dark">{l.trk}</span>
              <ColisRamBadge state={l.state} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground"><User className="h-4 w-4 text-slate-400" /> {l.client}</p>
            <p className="flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {l.pickupAddress}</p>
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <RamasseColisButton ramassageId={r.id} colisId={l.colisId} done={l.state !== "EN_ATTENTE"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
