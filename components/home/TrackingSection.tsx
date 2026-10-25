import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

const FEATURES = [
  "Suivi de vos colis en temps réel",
  "Code de confirmation de livraison simplifié",
  "Tableau de bord clair & statistique",
  "Notifications automatiques pour le client",
  "Historique complet des livraisons",
];

const ROWS = [
  { trk: "TRK-A1B2C3", city: "Casablanca → Rabat", status: "Livré", tone: "done" },
  { trk: "TRK-D4E5F6", city: "Fès → Meknès", status: "En livraison", tone: "progress" },
  { trk: "TRK-G7H8I9", city: "Tanger → Tétouan", status: "Ramassé", tone: "pending" },
  { trk: "TRK-J1K2L3", city: "Marrakech → Agadir", status: "En transit", tone: "progress" },
];

const TONE: Record<string, string> = {
  done: "bg-brand-light text-brand-darker",
  progress: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
};

export function TrackingSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-20 lg:grid-cols-2">
        {/* Left */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Tableau de bord
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Système de tracking avancé
          </h2>
          <ul className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <span className="text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
          >
            Essayer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Right — dashboard mockup */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-danger/60" />
              <span className="h-3 w-3 rounded-full bg-warning/60" />
              <span className="h-3 w-3 rounded-full bg-brand/60" />
              <span className="ml-3 text-xs font-semibold text-muted">Tableau de bord — Colis</span>
            </div>
            <div className="divide-y divide-border">
              {ROWS.map((r) => (
                <div key={r.trk} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.trk}</p>
                    <p className="text-xs text-muted">{r.city}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TONE[r.tone]}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-border">
            <CheckCircle2 className="h-6 w-6 text-brand" />
            <div>
              <p className="text-sm font-bold text-foreground">Colis livré !</p>
              <p className="text-[11px] text-muted">Paiement collecté</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
