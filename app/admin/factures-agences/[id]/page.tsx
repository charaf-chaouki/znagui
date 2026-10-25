import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, Building2, Phone, MapPin, CalendarDays, Paperclip, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FactureLivStatutBadge } from "@/components/ui/StatutBadge";
import { FactureAgenceStatusControl } from "@/components/factures/FactureAgenceStatusControl";
import { FactureAgencePieceUpload } from "@/components/factures/FactureAgencePieceUpload";
import { getServerT } from "@/lib/i18n/server";
import { roleLabel } from "@/lib/i18n/labels";
import { getFactureAgenceDetail } from "@/lib/server/facture-agence.service";
import { formatMAD } from "@/lib/colis-ui";
import type { FactureAgenceLigneView } from "@/lib/types/facture-agence";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await getFactureAgenceDetail(id);
  return { title: f ? `Facture ${f.reference}` : "Facture agence" };
}

export default async function FactureAgenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, tv, locale } = await getServerT();
  const f = await getFactureAgenceDetail(id);
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
      <Link href="/admin/factures-agences" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.facturesAgences")}
      </Link>

      <PageHeader
        title={tv("fd.factureRef", { ref: f.reference })}
        subtitle={tv("fd.subColis", { name: f.agence.nom, n: f.lignes.length })}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a href={`/admin/factures-agences/${f.id}/pdf`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /> {t("common.pdf")}
            </a>
            <FactureAgenceStatusControl id={f.id} statut={f.statut} />
          </div>
        }
      />
      <div className="flex items-center gap-2">
        <FactureLivStatutBadge statut={f.statut} />
        {f.paidAt && <span className="text-xs text-muted">{tv("fd.payeeLe", { d: f.paidAt })}</span>}
      </div>

      {f.pieceJointeUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div>
            <p className="flex items-center gap-2 font-semibold text-sky-900"><Paperclip className="h-4 w-4" /> {t("fd.preuveDirection")}</p>
            <a href={f.pieceJointeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:underline">
              {t("fd.voirPiece")} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ) : f.statut !== "PAYE" && f.montantAVerser > 0 ? (
        <FactureAgencePieceUpload factureId={f.id} montant={f.montantAVerser} />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-foreground">{t("col.agence")}</h3>
          <div className="space-y-3 text-sm">
            <Row icon={<Building2 className="h-4 w-4" />} label={t("col.agence")} value={f.agence.nom} />
            <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={f.agence.ville} />
            {f.agence.adresse && <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={f.agence.adresse} />}
            {f.agence.telephone && <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={f.agence.telephone} />}
            <Row icon={<CalendarDays className="h-4 w-4" />} label={t("col.date")} value={f.date} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
          <Tile label={t("col.totalTarifs")} value={formatMAD(f.montantTarifTotal)} />
          <Tile label={t("stat.collecteCod")} value={formatMAD(f.montantCollecte)} />
          <Tile label={t("fd.commissionAgence")} value={formatMAD(f.commission)} />
          <Tile label={t("fd.aVerserDirection")} value={formatMAD(f.montantAVerser)} strong />
        </div>
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
