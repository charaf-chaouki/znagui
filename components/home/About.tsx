import Link from "next/link";
import { Truck, ArrowRight } from "lucide-react";

const BARS = [
  { label: "Ramassage & Livraison", pct: 100 },
  { label: "Satisfaction client", pct: 85 },
  { label: "Couverture nationale", pct: 80 },
  { label: "Collecte de cash", pct: 100 },
];

const MINI = [
  { value: "50K+", label: "Colis livrés" },
  { value: "500+", label: "Villes couvertes" },
  { value: "2K+", label: "Clients actifs" },
];

export function About() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-20 lg:grid-cols-2">
        {/* Visual */}
        <div className="relative">
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-darker shadow-xl">
            <Truck className="h-36 w-36 text-white/90" strokeWidth={1.2} />
            <div className="absolute -left-4 top-8 rounded-2xl bg-white px-4 py-3 text-center shadow-lg">
              <p className="text-2xl font-extrabold text-brand">5+</p>
              <p className="text-[11px] font-medium text-muted">ans d'expérience</p>
            </div>
            <div className="absolute -right-3 bottom-8 rounded-2xl bg-white px-4 py-3 text-center shadow-lg">
              <p className="text-2xl font-extrabold text-brand">95%</p>
              <p className="text-[11px] font-medium text-muted">taux de livraison</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Qui sommes-nous
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Une équipe dédiée à votre <span className="text-brand">satisfaction</span>
          </h2>
          <p className="mt-4 text-muted">
            Znagui Express est un acteur marocain spécialisé dans la livraison express. Nous
            assurons l'expédition, le ramassage, la livraison et le retour des colis, avec une
            plateforme complète pour simplifier votre commerce en ligne.
          </p>

          <div className="mt-6 space-y-4">
            {BARS.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm font-medium text-foreground">
                  <span>{b.label}</span>
                  <span className="text-brand">{b.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {MINI.map((m) => (
              <div key={m.label} className="rounded-xl bg-surface p-4 text-center">
                <p className="text-xl font-extrabold text-brand">{m.value}</p>
                <p className="mt-1 text-[11px] text-muted">{m.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
          >
            Livrer avec Znagui <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
