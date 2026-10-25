import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Phone, MapPin, ExternalLink, Package, Wallet, FileText, User, Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { ColisActions } from "@/components/livreur/ColisActions";
import { TakeButton } from "@/components/livreur/TakeButton";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLivreurColisDetail } from "@/lib/server/livreur-portal.service";
import { COLIS_STATUT_LABEL, COLIS_STATUT_TONE, formatMAD } from "@/lib/colis-ui";
import { googleMapsUrl, haversineKm } from "@/lib/geo";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ trk: string }> }): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Colis ${decodeURIComponent(trk)}` };
}

export default async function LivreurColisDetailPage({ params }: { params: Promise<{ trk: string }> }) {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/colis");

  const { trk } = await params;
  const res = await getLivreurColisDetail(user.livreur.id, decodeURIComponent(trk));
  if (!res) notFound();
  const { detail: c, isRamasseur, isLivreur, canTake } = res;

  const DELIVERY_DOMAIN = ["RAMASSE", "RECU_PAR_AGENCE_DEST", "EN_COURS_DE_LIVRAISON", "LIVRE", "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE"];
  const hasAction =
    !canTake &&
    ((isRamasseur && ["DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE"].includes(c.statut)) ||
      (isLivreur && DELIVERY_DOMAIN.includes(c.statut)));

  const destMap = googleMapsUrl({ lat: c.destLat, lng: c.destLng, link: c.destMapLink, address: c.destAddress, city: c.destCity });
  const pickupMap = googleMapsUrl({ lat: c.pickupLat, lng: c.pickupLng, address: c.pickupAddress, city: c.pickupCity });
  const distanceKm =
    c.pickupLat != null && c.pickupLng != null && c.destLat != null && c.destLng != null
      ? Math.round(haversineKm({ lat: c.pickupLat, lng: c.pickupLng }, { lat: c.destLat, lng: c.destLng }))
      : null;
  const events = c.events.map((e) => ({ label: e.label, city: e.city, date: e.date, stage: e.stage }));

  return (
    <div className="space-y-4">
      <Link href="/livreur/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Mes colis
      </Link>

      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-brand-dark">{c.trk}</span>
        <Badge tone={COLIS_STATUT_TONE[c.statut]}>{COLIS_STATUT_LABEL[c.statut]}</Badge>
      </div>

      {/* Expéditeur (client) */}
      <ContactCard
        role="Expéditeur"
        icon={<User className="h-4 w-4" />}
        name={c.client}
        phone={c.clientPhone}
        address={`${c.pickupAddress}, ${c.pickupCity}`}
        mapHref={pickupMap}
      />

      {/* Destinataire */}
      <ContactCard
        role="Destinataire"
        icon={<MapPin className="h-4 w-4" />}
        name={c.recipient}
        phone={c.recipientPhone}
        address={`${c.destAddress}, ${c.destCity}`}
        mapHref={destMap}
      />

      {/* Trajet / kilométrage */}
      <div className="flex items-center justify-between rounded-2xl border border-brand/30 bg-brand-light/40 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-brand-darker">
          <Route className="h-4 w-4" /> {c.pickupCity} → {c.destCity}
        </span>
        {distanceKm != null ? (
          <span className="text-sm font-bold text-brand-dark">≈ {distanceKm} km</span>
        ) : (
          <span className="text-xs text-muted">{c.type === "INTRA" ? "Même ville" : "Inter-villes"}</span>
        )}
      </div>

      {/* Colis */}
      <div className="grid grid-cols-2 gap-3">
        <Info icon={<Wallet className="h-4 w-4" />} label="À encaisser (COD)" value={formatMAD(c.cod)} strong />
        <Info icon={<FileText className="h-4 w-4" />} label="Tarif" value={formatMAD(c.tarif)} />
        <Info icon={<Package className="h-4 w-4" />} label="Contenu" value={c.contents} />
        <Info icon={<Package className="h-4 w-4" />} label="Nb colis" value={String(c.parcelCount)} />
      </div>

      {c.notes && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Note : </span>{c.notes}
        </div>
      )}

      {/* Prendre (available same-ville colis) */}
      {canTake && (
        <div className="rounded-2xl border border-brand/30 bg-brand-light/30 p-4">
          <p className="mb-1 font-semibold text-foreground">Colis disponible</p>
          <p className="mb-3 text-sm text-muted">Prenez ce colis pour le ramasser puis le livrer.</p>
          <TakeButton colisId={c.id} trk={c.trk} />
        </div>
      )}

      {/* Actions */}
      {hasAction && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 font-semibold text-foreground">Mettre à jour le statut</p>
          <ColisActions colisId={c.id} statut={c.statut} isRamasseur={isRamasseur} isLivreur={isLivreur} />
        </div>
      )}

      {/* Historique */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-4 font-semibold text-foreground">Historique</p>
        {events.length > 0 ? <TrackingTimeline events={events} /> : <p className="text-sm text-muted">Aucun événement.</p>}
      </div>
    </div>
  );
}

function ContactCard({
  role, icon, name, phone, address, mapHref,
}: {
  role: string; icon: React.ReactNode; name: string; phone: string; address: string; mapHref: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{icon} {role}</p>
      <p className="mt-1 font-bold text-foreground">{name}</p>
      <p className="flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {address}</p>
      <div className="mt-3 flex gap-2">
        <a href={`tel:${phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 active:scale-95">
          <Phone className="h-4 w-4" /> Appeler
        </a>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-contrast active:scale-95">
          <ExternalLink className="h-4 w-4" /> Voir sur Maps
        </a>
      </div>
    </div>
  );
}

function Info({ icon, label, value, strong }: { icon: React.ReactNode; label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{icon} {label}</p>
      <p className={`mt-1 ${strong ? "text-lg font-extrabold text-brand-dark" : "font-semibold text-foreground"}`}>{value}</p>
    </div>
  );
}
