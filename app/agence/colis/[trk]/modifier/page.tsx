import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisForm } from "@/components/colis/ColisForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getColisDetail } from "@/lib/server/colis.service";
import { agenceCanAccessColis } from "@/lib/server/agence-colis.service";

export const metadata = { title: "Modifier le colis" };
export const instant = false;

const EDITABLE: string[] = ["RECU_ENTREPOT_SOURCE", "RECU_PAR_AGENCE_DEST"];

export default async function AgenceModifierColisPage({ params }: { params: Promise<{ trk: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/colis");

  const { trk } = await params;
  const { t } = await getServerT();
  const c = await getColisDetail(decodeURIComponent(trk));
  if (!c) notFound();
  if (!(await agenceCanAccessColis(user.agence.id, user.agence.villeId, c.id))) notFound();
  // Only editable while still at the agence (not yet shipped / dispatched).
  if (!EDITABLE.includes(c.statut)) redirect(`/agence/colis/${trk}`);

  const fixedPickup = { city: c.pickupCity, address: c.pickupAddress };

  return (
    <div className="space-y-5">
      <Link href={`/agence/colis/${trk}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {trk}
      </Link>
      <PageHeader title={t("page.modifierColis")} subtitle={trk} />
      <ColisForm
        clients={[]}
        mode="edit"
        colisId={c.id}
        apiBase="/api/agence/colis"
        redirectTo={`/agence/colis/${trk}`}
        allowManualTarif
        depotMode
        fixedPickup={fixedPickup}
        initial={{
          clientId: c.clientId,
          clientName: c.client,
          pickupCity: c.pickupCity,
          pickupAddress: c.pickupAddress,
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
