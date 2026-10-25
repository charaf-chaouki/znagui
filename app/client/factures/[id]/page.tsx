import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FactureStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getClientFactureDetail } from "@/lib/server/facture-client.service";
import { formatMAD } from "@/lib/colis-ui";
import type { FactureLigneView } from "@/lib/types/facture-client";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Facture ${id.slice(0, 8)}` };
}

export default async function ClientFactureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/factures");

  const { id } = await params;
  const { t, tv } = await getServerT();
  const f = await getClientFactureDetail(user.client.id, id);
  if (!f) notFound();

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
      <Link href="/client/factures" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("page.mesFactures")}
      </Link>

      <PageHeader
        title={tv("fd.factureRef", { ref: f.reference })}
        subtitle={tv("fd.subColisDate", { n: f.lignes.length, d: f.date })}
        action={
          <a href={`/client/factures/${f.id}/pdf`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark">
            <Printer className="h-4 w-4" /> {t("fd.telechargerPdf")}
          </a>
        }
      />
      <div className="flex items-center gap-2">
        <FactureStatutBadge statut={f.statut} />
        {f.paidAt && <span className="text-xs text-muted">{tv("fd.payeeLe", { d: f.paidAt })}</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tile label={t("stat.montantCollecte")} value={formatMAD(f.montantCollecte)} />
        <Tile label={t("col.totalTarifs")} value={formatMAD(f.tarifTotal)} />
        <Tile label={t("fd.montantARecevoir")} value={formatMAD(f.montantNet)} strong />
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
