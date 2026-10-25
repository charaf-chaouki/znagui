import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Truck, PackageX } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { getColisTracking } from "@/lib/server/colis.service";
import type { StatusTone } from "@/lib/types/tracking";

// Request-time route (reads params + live tracking data).
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trk: string }>;
}): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Suivi ${decodeURIComponent(trk)}` };
}

const TONE: Record<StatusTone, string> = {
  done: "bg-brand-light text-brand-darker",
  progress: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  failed: "bg-danger/10 text-danger",
};

export default async function TrackingResultPage({
  params,
}: {
  params: Promise<{ trk: string }>;
}) {
  const { trk } = await params;
  const info = await getColisTracking(decodeURIComponent(trk));

  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Link href="/suivi" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
            <ArrowLeft className="h-4 w-4" /> Nouveau suivi
          </Link>

          {!info ? (
            <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                <PackageX className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-xl font-bold text-foreground">Colis introuvable</h1>
              <p className="mt-2 text-muted">
                Aucun colis ne correspond au numéro{" "}
                <span className="font-semibold text-foreground">{decodeURIComponent(trk)}</span>.
                Vérifiez le numéro et réessayez.
              </p>
              <div className="mx-auto mt-6 max-w-md">
                <TrackingSearch defaultValue={decodeURIComponent(trk)} />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Numéro de suivi
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-foreground">{info.trk}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${TONE[info.statusTone]}`}>
                    {info.status}
                  </span>
                </div>

                <div className="grid gap-4 border-b border-border p-6 sm:grid-cols-3">
                  <Detail icon={<MapPin className="h-4 w-4" />} label="Trajet"
                    value={`${info.pickupCity} → ${info.destinationCity}`} />
                  <Detail icon={<User className="h-4 w-4" />} label="Destinataire" value={info.recipientName} />
                  <Detail icon={<Truck className="h-4 w-4" />} label="Véhicule" value={info.vehicle ?? "—"} />
                </div>

                <div className="p-6">
                  <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-muted">Historique</h2>
                  {info.events.length ? (
                    <TrackingTimeline events={info.events} />
                  ) : (
                    <p className="text-sm text-muted">Aucun événement enregistré pour l'instant.</p>
                  )}
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-md">
                <p className="mb-2 text-center text-sm text-muted">Suivre un autre colis</p>
                <TrackingSearch />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
