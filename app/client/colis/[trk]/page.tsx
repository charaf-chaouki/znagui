import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft, Pencil, Printer, User, Phone, MapPin, Package, Truck, Hash, Boxes,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getColisDetail } from "@/lib/server/colis.service";
import { formatMAD } from "@/lib/colis-ui";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ trk: string }> }): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Colis ${decodeURIComponent(trk)}` };
}

export default async function ClientColisDetailPage({ params }: { params: Promise<{ trk: string }> }) {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/colis");

  const { trk } = await params;
  const { t } = await getServerT();
  const c = await getColisDetail(decodeURIComponent(trk));
  // Ownership: a client may only view its own colis.
  if (!c || c.clientId !== user.client.id) notFound();

  return (
    <div className="space-y-5">
      <Link href="/client/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("page.mesColis")}
      </Link>

      <PageHeader
        title={t("page.colisDetail")}
        subtitle={c.trk}
        action={
          <div className="flex items-center gap-2">
            <a
              href={`/ticket/${encodeURIComponent(c.trk)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 text-brand" /> {t("cdet.voirTicket")}
            </a>
            {c.statut === "CREE" && (
              <Link
                href={`/client/colis/${encodeURIComponent(c.trk)}/modifier`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" /> {t("common.edit")}
              </Link>
            )}
          </div>
        }
      />
      <ColisStatutBadge statut={c.statut} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title={t("cdet.informations")} icon={<Package className="h-4 w-4" />}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<Hash className="h-4 w-4" />} label={t("col.trk")} value={c.trk} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.type")} value={c.type === "INTRA" ? t("cdet.typeIntra") : t("cdet.typeInter")} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.trajet")} value={`${c.pickupCity} → ${c.destCity}`} />
              <Row icon={<Truck className="h-4 w-4" />} label={t("col.vehicule")} value={t(`veh.${c.vehicle}`)} />
              <Row icon={<Package className="h-4 w-4" />} label={t("cdet.contenu")} value={c.contents} />
              <Row icon={<Boxes className="h-4 w-4" />} label={t("cdet.nbColis")} value={String(c.parcelCount)} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.date")} value={c.date} />
            </div>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card title={t("cdet.expediteur")} icon={<User className="h-4 w-4" />}>
              <div className="space-y-3">
                <Row icon={<User className="h-4 w-4" />} label={t("cdet.expediteur")} value={c.client} />
                <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={`${c.pickupAddress ? c.pickupAddress + ", " : ""}${c.pickupCity}`} />
              </div>
            </Card>
            <Card title={t("col.destinataire")} icon={<User className="h-4 w-4" />}>
              <div className="space-y-3">
                <Row icon={<User className="h-4 w-4" />} label={t("col.destinataire")} value={c.recipient} />
                <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={c.recipientPhone} />
                <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={`${c.destAddress ? c.destAddress + ", " : ""}${c.destCity}`} />
              </div>
            </Card>
          </div>

          {c.notes && (
            <Card title={t("cdet.note")} icon={<Package className="h-4 w-4" />}>
              <p className="text-sm text-foreground">{c.notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat label={t("col.cod")} value={formatMAD(c.cod)} strong />
            <Stat label={t("col.tarif")} value={formatMAD(c.tarif)} />
          </div>

          <Card title={t("suivi.historique")} icon={<Package className="h-4 w-4" />}>
            {c.events.length > 0 ? (
              <ol className="space-y-4">
                {c.events.map((ev, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${ev.stage === "current" ? "bg-brand ring-4 ring-brand/15" : "bg-slate-300"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{ev.label}</p>
                      <p className="text-xs text-muted">{[ev.city, ev.date].filter(Boolean).join(" · ")}</p>
                      {ev.note && <p className="mt-0.5 text-xs text-muted">{ev.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">{t("suivi.noEvent")}</p>
            )}
          </Card>
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
      {children}
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

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${strong ? "border-brand/30 bg-brand-light/30" : "border-slate-200 bg-white"}`}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 ${strong ? "text-lg font-extrabold text-brand-dark" : "text-base font-bold text-foreground"}`}>{value}</p>
    </div>
  );
}
