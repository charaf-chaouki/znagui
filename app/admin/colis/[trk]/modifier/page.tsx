import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisForm } from "@/components/colis/ColisForm";
import { getServerT } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";
import { getColisDetail } from "@/lib/server/colis.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ trk: string }> }): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Modifier ${trk}` };
}

export default async function ModifierColisPage({ params }: { params: Promise<{ trk: string }> }) {
  const { trk } = await params;
  const { t } = await getServerT();
  const [c, clients] = await Promise.all([
    getColisDetail(decodeURIComponent(trk)),
    prisma.client.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
  ]);
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <Link href={`/admin/colis/${trk}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {trk}
      </Link>
      <PageHeader title={t("page.modifierColis")} subtitle={trk} />
      <ColisForm
        clients={clients}
        mode="edit"
        colisId={c.id}
        redirectTo={`/admin/colis/${trk}`}
        allowManualTarif
        initial={{
          clientId: c.clientId,
          clientName: c.client,
          pickupCity: c.pickupCity,
          pickupAddress: c.pickupAddress,
          pickupLat: c.pickupLat,
          pickupLng: c.pickupLng,
          recipient: c.recipient,
          recipientPhone: c.recipientPhone,
          destCity: c.destCity,
          destAddress: c.destAddress,
          destLat: c.destLat,
          destLng: c.destLng,
          mapLink: c.destMapLink ?? undefined,
          vehicle: c.vehicle,
          parcelCount: c.parcelCount,
          contents: c.contents,
          cod: c.cod,
          tarif: c.tarif,
          notes: c.notes ?? undefined,
        }}
      />
    </div>
  );
}
