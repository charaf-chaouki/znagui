import Link from "next/link";
import { Truck, ArrowRight } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const BARS: { key: MessageKey; pct: number }[] = [
  { key: "home.about.bar1", pct: 100 },
  { key: "home.about.bar2", pct: 85 },
  { key: "home.about.bar3", pct: 80 },
  { key: "home.about.bar4", pct: 100 },
];

const MINI: { value: string; key: MessageKey }[] = [
  { value: "50K+", key: "home.stats.delivered" },
  { value: "500+", key: "home.stats.cities" },
  { value: "2K+", key: "home.about.clients" },
];

export async function About() {
  const { t } = await getServerT();
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-20 lg:grid-cols-2">
        {/* Visual */}
        <div className="relative">
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-darker shadow-xl">
            <Truck className="h-36 w-36 text-white/90" strokeWidth={1.2} />
            <div className="absolute -start-4 top-8 rounded-2xl bg-white px-4 py-3 text-center shadow-lg">
              <p className="text-2xl font-extrabold text-brand">5+</p>
              <p className="text-[11px] font-medium text-muted">{t("home.about.exp")}</p>
            </div>
            <div className="absolute -end-3 bottom-8 rounded-2xl bg-white px-4 py-3 text-center shadow-lg">
              <p className="text-2xl font-extrabold text-brand">95%</p>
              <p className="text-[11px] font-medium text-muted">{t("home.about.rate")}</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            {t("home.about.eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {t("home.about.title1")}<span className="text-brand">{t("home.about.titleHl")}</span>
          </h2>
          <p className="mt-4 text-muted">{t("home.about.desc")}</p>

          <div className="mt-6 space-y-4">
            {BARS.map((b) => (
              <div key={b.key}>
                <div className="flex justify-between text-sm font-medium text-foreground">
                  <span>{t(b.key)}</span>
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
              <div key={m.key} className="rounded-xl bg-surface p-4 text-center">
                <p className="text-xl font-extrabold text-brand">{m.value}</p>
                <p className="mt-1 text-[11px] text-muted">{t(m.key)}</p>
              </div>
            ))}
          </div>

          <Link
            href="/inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
          >
            {t("home.about.cta")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
