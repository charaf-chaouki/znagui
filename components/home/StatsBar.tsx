import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const STATS: { value: string; key: MessageKey }[] = [
  { value: "50 000+", key: "home.stats.delivered" },
  { value: "500+", key: "home.stats.cities" },
  { value: "2 000+", key: "home.stats.clients" },
  { value: "95%", key: "home.stats.rate" },
];

export async function StatsBar() {
  const { t } = await getServerT();
  return (
    <section className="bg-brand">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.key} className="text-center text-brand-contrast">
            <p className="text-2xl font-extrabold md:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-contrast/80">
              {t(s.key)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
