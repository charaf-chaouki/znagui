import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FactureBuilder } from "@/components/factures/FactureBuilder";
import { listUninvoicedLivreColis } from "@/lib/server/facture-client.service";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouvelle facture client" };
export const instant = false;

export default async function NouvelleFactureClientPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const clients = await prisma.client.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });
  const selectedClientId = client && clients.some((c) => c.id === client) ? client : undefined;
  const colis = selectedClientId ? await listUninvoicedLivreColis(selectedClientId) : [];

  return (
    <div className="space-y-5">
      <Link href="/admin/factures-clients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Factures clients
      </Link>
      <PageHeader title="Nouvelle facture" subtitle="Choisissez un client, cochez ses colis livrés, puis enregistrez" />
      <FactureBuilder clients={clients} selectedClientId={selectedClientId} colis={colis} mode="create" />
    </div>
  );
}
