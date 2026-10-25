import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisForm } from "@/components/colis/ColisForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getColisDetail } from "@/lib/server/colis.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ trk: string }> }): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Modifier ${trk}` };
}

export default async function ClientModifierColisPage({ params }: { params: Promise<{ trk: string }> }) {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/colis");

  const { trk } = await params;
  const c = await getColisDetail(trk);
  if (!c || c.clientId !== user.client.id) notFound();
  // Only a colis still at "Créé" can be edited by the client.
  if (c.statut !== "CREE") redirect("/client/colis");

  const { t, tv } = await getServerT();
  return (
    <div className="space-y-5">
      <Link href="/client/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("page.mesColis")}
      </Link>
      <PageHeader title={tv("page.modifierTrk", { trk: c.trk })} subtitle={t("page.clientModifierColis.sub")} />
      <ColisForm
        clients={[]}
        mode="edit"
        colisId={c.id}
        lockClient
        apiBase="/api/client/colis"
        redirectTo="/client/colis"
        initial={{
          clientId: c.clientId,
          clientName: user.client.nom,
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
