import Link from "next/link";
import { Search, ArrowRight, CheckCircle2, MapPin, Radio } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";

export async function Hero() {
  const { t } = await getServerT();
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:py-20 lg:grid-cols-2">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-darker">
            <span className="h-2 w-2 rounded-full bg-brand" /> {t("home.hero.badge")}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t("home.hero.title1")}
            <span className="text-brand">{t("home.hero.titleHl")}</span>
            {t("home.hero.title2")}
          </h1>

          <p className="mt-5 max-w-md text-lg text-muted">{t("home.hero.desc")}</p>

          {/* Tracking box */}
          <form
            action="/suivi"
            className="mt-7 flex max-w-md items-center gap-2 rounded-xl border border-border bg-background p-2 shadow-sm"
          >
            <Search className="ms-2 h-5 w-5 shrink-0 text-muted" />
            <input
              name="trk"
              placeholder={t("home.hero.trackPh")}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
            >
              {t("home.hero.track")}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
            >
              {t("home.hero.cta")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative">
          <div className="relative mx-auto flex aspect-square max-w-md items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-darker shadow-2xl rounded-xl">
            <img src="/images/cover-bg.jpg" alt="" className="relative size-full object-cover rounded-xl" />

            {/* floating badges */}
            <div className="absolute start-4 top-6 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              <div>
                <p className="text-xs font-bold text-foreground">{t("home.hero.badgeDelivered")}</p>
                <p className="text-[10px] text-muted">{t("home.hero.badgeConfirmed")}</p>
              </div>
            </div>

            <div className="absolute -start-4 bottom-16 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg">
              <MapPin className="h-5 w-5 text-brand" />
              <p className="text-xs font-bold text-foreground">{t("home.hero.badgeCities")}</p>
            </div>

            <div className="absolute end-4 bottom-6 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                <Radio className="h-3.5 w-3.5 text-brand" /> {t("home.hero.live")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
