import { Boxes, Truck, RotateCcw, Banknote, Activity, Warehouse } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const SERVICES: { icon: typeof Boxes; title: MessageKey; desc: MessageKey }[] = [
  { icon: Boxes, title: "home.services.ramassage.t", desc: "home.services.ramassage.d" },
  { icon: Truck, title: "home.services.livraison.t", desc: "home.services.livraison.d" },
  { icon: RotateCcw, title: "home.services.retour.t", desc: "home.services.retour.d" },
  { icon: Banknote, title: "home.services.cash.t", desc: "home.services.cash.d" },
  { icon: Activity, title: "home.services.suivi.t", desc: "home.services.suivi.d" },
  { icon: Warehouse, title: "home.services.stockage.t", desc: "home.services.stockage.d" },
];

export async function Services() {
  const { t } = await getServerT();
  return (
    <section id="services" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            {t("home.services.eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {t("home.services.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t("home.services.sub")}</p>
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
              <h3 className="mt-5 text-lg font-bold text-foreground">{t(s.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(s.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
