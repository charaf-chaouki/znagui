import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Printer, User, Phone, MapPin, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FactureStatutBadge } from "@/components/ui/StatutBadge";
import { FactureStatusControl } from "@/components/factures/FactureStatusControl";
import { getServerT } from "@/lib/i18n/server";
import { getFactureClientDetail } from "@/lib/server/facture-client.service";
import { formatMAD } from "@/lib/colis-ui";
import type { FactureLigneView } from "@/lib/types/facture-client";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await getFactureClientDetail(id);
  return { title: f ? `Facture ${f.reference}` : "Facture" };
}

export default async function FactureClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, tv } = await getServerT();
  const f = await getFactureClientDetail(id);
  if (!f) notFound();
  const paid = f.statut === "PAYE";

  const cols: Column<FactureLigneView>[] = [
    { header: t("col.trk"), cell: (l) => <span className="font-semibold text-brand-dark">{l.trk}</span> },
    { header: t("col.destinataire"), cell: (l) => <span>{l.recipient}<span className="block text-xs text-muted">{l.destCity}</span></span> },
    { header: t("col.cod"), cell: (l) => formatMAD(l.cod), className: "text-right", thClassName: "text-right" },
    { header: t("col.tarif"), cell: (l) => <span className="text-muted">{formatMAD(l.tarif)}</span>, className: "text-right", thClassName: "text-right" },
    { header: t("col.collecte"), cell: (l) => formatMAD(l.collecte), className: "text-right", thClassName: "text-right" },
    { header: t("col.aVerser"), cell: (l) => <span className="font-semibold text-brand-dark">{formatMAD(l.aVerser)}</span>, className: "text-right", thClassName: "text-right" },
  ];

  return (
    <div className="space-y-5">
      <Link href="/admin/factures-clients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.facturesClients")}
      </Link>

      <PageHeader
        title={tv("fd.factureRef", { ref: f.reference })}
        subtitle={tv("fd.subColis", { name: f.client.nom, n: f.lignes.length })}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a href={`/api/pdf/facture-client/${f.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /> {t("common.pdf")}
            </a>
            {!paid && (
              <Link href={`/admin/factures-clients/${f.id}/modifier`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Pencil className="h-4 w-4" /> {t("common.edit")}
              </Link>
            )}
            <FactureStatusControl id={f.id} statut={f.statut} />
          </div>
        }
      />
      <div className="flex items-center gap-2">
        <FactureStatutBadge statut={f.statut} />
        {f.paidAt && <span className="text-xs text-muted">{tv("fd.payeeLe", { d: f.paidAt })}</span>}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-foreground">{t("col.client")}</h3>
          <div className="space-y-3 text-sm">
            <Row icon={<User className="h-4 w-4" />} label={t("fd.nom")} value={f.client.nom} />
            <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={f.client.telephone} />
            <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={f.client.ville} />
            <Row icon={<CalendarDays className="h-4 w-4" />} label={t("fd.dateFacture")} value={f.date} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Tile label={t("stat.montantCollecte")} value={formatMAD(f.montantCollecte)} />
            <Tile label={t("col.totalTarifs")} value={formatMAD(f.tarifTotal)} />
            <Tile label={t("stat.montantAVerser")} value={formatMAD(f.montantNet)} strong />
          </div>
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
