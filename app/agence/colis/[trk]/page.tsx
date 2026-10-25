import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, User, Phone, Package, Truck, Boxes, Wallet, FileText, Pencil, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisStatutBadge, ColisTypeBadge } from "@/components/ui/StatutBadge";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { formatMAD } from "@/lib/colis-ui";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import { getColisDetail } from "@/lib/server/colis.service";
import { agenceCanAccessColis } from "@/lib/server/agence-colis.service";

export const instant = false;

const VEH_KEY: Record<string, MessageKey> = { MOTO: "veh.MOTO", VOITURE: "veh.VOITURE", CAMION: "veh.CAMION" };
const EDITABLE: string[] = ["RECU_ENTREPOT_SOURCE", "RECU_PAR_AGENCE_DEST"];

export async function generateMetadata({ params }: { params: Promise<{ trk: string }> }): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Colis ${trk}` };
}

export default async function AgenceColisDetailPage({ params }: { params: Promise<{ trk: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/colis");

  const { trk } = await params;
  const { t, tv } = await getServerT();
  const c = await getColisDetail(decodeURIComponent(trk));
  if (!c) notFound();
  if (!(await agenceCanAccessColis(user.agence.id, user.agence.villeId, c.id))) notFound();

  const editable = EDITABLE.includes(c.statut);
  const outline = "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <div className="space-y-5">
      <Link href="/agence/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.colis")}
      </Link>

      <PageHeader
        title={c.trk}
        subtitle={tv("detail.creeLe", { d: c.date })}
        action={
          <div className="flex flex-wrap gap-2">
            {editable && (
              <Link href={`/agence/colis/${c.trk}/modifier`} className={outline}>
                <Pencil className="h-4 w-4" /> {t("common.edit")}
              </Link>
            )}
            <Link href={`/ticket/${c.trk}`} target="_blank" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark">
              <Printer className="h-4 w-4" /> {t("action.imprimerTicket")}
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <ColisStatutBadge statut={c.statut} />
        <ColisTypeBadge type={c.type} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <Card title={t("detail.retraitExp")} icon={<MapPin className="h-4 w-4" />}>
              <Row icon={<User className="h-4 w-4" />} label={t("col.client")} value={c.client} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={c.pickupCity} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={c.pickupAddress} />
            </Card>
            <Card title={t("detail.livraisonDest")} icon={<MapPin className="h-4 w-4" />}>
              <Row icon={<User className="h-4 w-4" />} label={t("col.destinataire")} value={c.recipient} />
              <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={c.recipientPhone} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={c.destCity} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={c.destAddress} />
            </Card>
          </div>

          <Card title={t("detail.detailsColis")} icon={<Package className="h-4 w-4" />}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<FileText className="h-4 w-4" />} label={t("detail.contenu")} value={c.contents} />
              <Row icon={<Boxes className="h-4 w-4" />} label={t("detail.nbColis")} value={String(c.parcelCount)} />
              <Row icon={<Truck className="h-4 w-4" />} label={t("col.vehicule")} value={t(VEH_KEY[c.vehicle] ?? "veh.MOTO")} />
              <Row icon={<Wallet className="h-4 w-4" />} label={t("col.tarif")} value={formatMAD(c.tarif)} />
              <Row icon={<Wallet className="h-4 w-4" />} label={t("detail.prixCollecter")} value={formatMAD(c.cod)} />
            </div>
            {c.notes && (
              <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="font-semibold">{t("detail.note")}</span>{c.notes}
              </div>
            )}
          </Card>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-5 flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
              <Package className="h-4 w-4" />
            </span>
            {t("detail.historique")}
          </h3>
          {c.events.length ? (
            <TrackingTimeline events={c.events.map((e) => ({ label: e.label, city: e.city, date: e.date, stage: e.stage }))} />
          ) : (
            <p className="text-sm text-muted">{t("detail.aucunEvenement")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
