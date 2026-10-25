import { Boxes, Truck, RotateCcw, Banknote, Activity, Warehouse } from "lucide-react";

const SERVICES = [
  {
    icon: Boxes,
    title: "Ramassage",
    desc: "Un agent vient collecter vos colis directement à votre porte, gratuitement.",
  },
  {
    icon: Truck,
    title: "Livraison Express",
    desc: "Remise en main propre à vos clients sous 24h partout au Maroc.",
  },
  {
    icon: RotateCcw,
    title: "Retour Colis",
    desc: "Gestion simplifiée des retours en cas d'annulation ou client injoignable.",
  },
  {
    icon: Banknote,
    title: "Collecte de Cash",
    desc: "Vos paiements sont encaissés à la livraison puis versés en toute sécurité.",
  },
  {
    icon: Activity,
    title: "Suivi Temps Réel",
    desc: "Tableau de bord complet pour suivre tous vos colis instantanément.",
  },
  {
    icon: Warehouse,
    title: "Stockage",
    desc: "Entreposez vos colis dans nos entrepôts avant expédition.",
  },
];

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Ce que nous faisons
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Nos Services Logistiques
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Une gamme complète de services pour répondre à tous vos besoins d'expédition.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-border bg-background p-6 transition hover:border-brand hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-contrast transition group-hover:scale-105">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
