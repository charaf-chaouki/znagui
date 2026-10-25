import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Paperclip, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { FactureLivStatutBadge } from "@/components/ui/StatutBadge";
import { VirementUpload } from "@/components/livreur/VirementUpload";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT, type ServerT } from "@/lib/i18n/server";
import { roleLabel } from "@/lib/i18n/labels";
import { getLivreurFactureDetail } from "@/lib/server/facture-livreur.service";
import { formatMAD } from "@/lib/colis-ui";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Facture ${id.slice(0, 8)}` };
}

export default async function LivreurFactureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/factures");

  const { id } = await params;
  const { t, tv, locale } = await getServerT();
  const f = await getLivreurFactureDetail(user.livreur.id, id);
  if (!f) notFound();

  return (
    <div className="space-y-4">
      <Link href="/livreur/factures" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("page.mesFactures")}
      </Link>

      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-brand-dark">{f.reference}</span>
        <FactureLivStatutBadge statut={f.statut} />
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <Tile label={t("col.collecte")} value={formatMAD(f.montantCollecte)} />
        <Tile label={t("col.commission")} value={formatMAD(f.commission)} />
        <Tile label={t("col.aVerser")} value={formatMAD(f.montantAVerser)} strong />
      </div>

      {/* Virement flow */}
      {f.statut === "EN_ATTENTE" && <VirementUpload factureId={f.id} montant={f.montantAVerser} />}

      {f.statut === "MONTANT_VERSE" && (
        <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-sky-800"><Clock className="h-4 w-4" /> {t("lf2.virementDeclare")}</p>
          <p className="text-sm text-sky-700">{t("lf2.enAttenteValidation")}</p>
          {f.pieceJointeUrl && <PieceJointe url={f.pieceJointeUrl} tt={t} />}
        </div>
      )}

      {f.statut === "PAYE" && (
        <div className="space-y-3 rounded-2xl border border-brand/30 bg-brand-light/40 p-4">
          <p className="flex items-center gap-2 font-semibold text-brand-darker"><CheckCircle2 className="h-4 w-4" /> {f.paidAt ? tv("lf2.paiementValideLe", { d: f.paidAt }) : t("lf2.paiementValide")}</p>
          {f.pieceJointeUrl && <PieceJointe url={f.pieceJointeUrl} tt={t} />}
        </div>
      )}

      {/* Lines */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-foreground">{tv("lf2.colisCount", { n: f.lignes.length })}</div>
        <div className="divide-y divide-slate-100">
          {f.lignes.map((l) => (
            <div key={l.colisId} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-brand-dark">{l.trk}</span>
                <span className="text-sm font-bold text-brand-dark">{formatMAD(l.commission)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted">
                <span>{l.trajet} · {roleLabel(locale, l.role)}</span>
                <span>{tv("lf2.collecteTarif", { c: formatMAD(l.cod), t: formatMAD(l.tarif) })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PieceJointe({ url, tt }: { url: string; tt: ServerT["t"] }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
      <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> {tt("fd.preuveVirement")}</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function Tile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${strong ? "border-brand/30 bg-brand-light/30" : "border-slate-200 bg-white"}`}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 ${strong ? "text-base font-extrabold text-brand-dark" : "text-sm font-bold text-foreground"}`}>{value}</p>
    </div>
  );
}
