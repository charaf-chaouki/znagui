const STATS = [
  { value: "50 000+", label: "Colis livrés" },
  { value: "500+", label: "Villes couvertes" },
  { value: "2 000+", label: "Clients satisfaits" },
  { value: "95%", label: "Taux de livraison" },
];

export function StatsBar() {
  return (
    <section className="bg-brand">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center text-brand-contrast">
            <p className="text-2xl font-extrabold md:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-contrast/80">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
