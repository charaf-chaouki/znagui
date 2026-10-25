import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FactureBuilder } from "@/components/factures/FactureBuilder";
import { getFactureClientDetail, listUninvoicedLivreColis } from "@/lib/server/facture-client.service";
import type { UninvoicedColis } from "@/lib/types/facture-client";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await getFactureClientDetail(id);
  return { title: f ? `Modifier ${f.reference}` : "Modifier facture" };
}

export default async function ModifierFactureClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await getFactureClientDetail(id);
  if (!f) notFound();
  // A paid facture is locked.
  if (f.statut === "PAYE") redirect(`/admin/factures-clients/${id}`);

  // Eligible colis = still-uninvoiced LIVRE colis + the colis already on this facture.
  const available = await listUninvoicedLivreColis(f.clientId);
  const onFacture: UninvoicedColis[] = f.lignes.map((l) => ({
    id: l.colisId, trk: l.trk, recipient: l.recipient, destCity: l.destCity,
    cod: l.cod, tarif: l.tarif, collecte: l.collecte, aVerser: l.aVerser, date: l.date,
  }));
  const seen = new Set(available.map((c) => c.id));
  const colis = [...onFacture.filter((c) => !seen.has(c.id)), ...available];
  const preselected = onFacture.map((c) => c.id);

  return (
    <div className="space-y-5">
      <Link href={`/admin/factures-clients/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Facture {f.reference}
      </Link>
      <PageHeader title={`Modifier ${f.reference}`} subtitle={`${f.client.nom} — ajoutez ou retirez des colis`} />
      <FactureBuilder
        clients={[]}
        colis={colis}
        mode="edit"
        factureId={f.id}
        preselected={preselected}
        clientName={f.client.nom}
      />
    </div>
  );
}
