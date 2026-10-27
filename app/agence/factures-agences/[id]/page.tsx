import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Printer, CalendarDays, Paperclip, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FactureLivStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { roleLabel } from "@/lib/i18n/labels";
import { getAgenceFactureDetail } from "@/lib/server/facture-agence.service";
import { formatMAD } from "@/lib/colis-ui";
import type { FactureAgenceLigneView } from "@/lib/types/facture-agence";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Facture ${id.slice(0, 8)}` };
}

export default async function AgenceFactureAgenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/factures-agences");

  const { id } = await params;
  const { t, tv, locale } = await getServerT();
  const f = await getAgenceFactureDetail(user.agence.id, id);
  if (!f) notFound();

  const cols: Column<FactureAgenceLigneView>[] = [
    { header: t("col.trk"), cell: (l) => <span className="font-semibold text-brand-dark">{l.trk}</span> },
    { header: t("col.trajet"), cell: (l) => <span className="text-muted">{l.trajet}</span> },
    { header: t("col.role"), cell: (l) => <span className="text-xs font-medium text-slate-600">{roleLabel(locale, l.role)}</span> },
    { header: t("col.collecte"), cell: (l) => formatMAD(l.collecte), className: "text-right", thClassName: "text-right" },
    { header: t("col.tarif"), cell: (l) => <span className="text-muted">{formatMAD(l.tarif)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.commission"), cell: (l) => <span className="text-muted">{formatMAD(l.commission)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.aVerser"), cell: (l) => <span className="font-semibold text-brand-dark">{formatMAD(l.montantAVerser)}</span>, className: "text-right", thClassName: "text-right" },
  ];

  return (
    <div className="space-y-5">
      <Link href="/agence/factures-agences" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.facturesAgences")}
      </Link>

      <PageHeader
        title={tv("fd.factureRef", { ref: f.reference })}
        subtitle={tv("fd.subColisDate", { n: f.lignes.length, d: f.date })}
        action={
          <a href={`/api/pdf/facture-agence/${f.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> {t("common.pdf")}
          </a>
        }
      />
      <div className="flex items-center gap-2">
        <FactureLivStatutBadge statut={f.statut} />
        {f.paidAt && <span className="text-xs text-muted">{tv("fd.payeeLe", { d: f.paidAt })}</span>}
        <span className="flex items-center gap-1.5 text-sm text-muted"><CalendarDays className="h-4 w-4 text-slate-400" /> {f.date}</span>
      </div>

      {f.pieceJointeUrl && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div>
            <p className="flex items-center gap-2 font-semibold text-sky-900"><Paperclip className="h-4 w-4" /> {t("fd.preuveDirectionAgence")}</p>
            <a href={f.pieceJointeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:underline">
              {t("fd.voirPiece")} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label={t("col.totalTarifs")} value={formatMAD(f.montantTarifTotal)} />
        <Tile label={t("stat.collecteCod")} value={formatMAD(f.montantCollecte)} />
        <Tile label={t("fd.commissionAgence")} value={formatMAD(f.commission)} strong />
        <Tile label={t("fd.aVerserDirection")} value={formatMAD(f.montantAVerser)} />
      </div>

      <DataTable columns={cols} rows={f.lignes} rowKey={(l) => l.colisId} emptyLabel={t("empty.colis")} />
    </div>
  );
}

function Tile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${strong ? "border-brand/30 bg-brand-light/30" : "border-slate-200 bg-white"}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 ${strong ? "text-2xl font-extrabold text-brand-dark" : "text-xl font-bold text-foreground"}`}>{value}</p>
    </div>
  );
}
