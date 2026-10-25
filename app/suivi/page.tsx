import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";

export const metadata: Metadata = {
  title: "Suivi de colis",
  description: "Suivez votre colis Znagui Express en temps réel avec votre numéro TRK.",
};

// Request-time route (reads searchParams to redirect).
export const instant = false;

export default async function SuiviPage({
  searchParams,
}: {
  searchParams: Promise<{ trk?: string }>;
}) {
  const { trk } = await searchParams;
  if (trk && trk.trim()) redirect(`/suivi/${encodeURIComponent(trk.trim())}`);

  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <PackageSearch className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">Suivi de colis</h1>
          <p className="mt-3 text-muted">
            Saisissez votre numéro de suivi pour connaître l'état de votre colis en temps réel.
          </p>
          <div className="mx-auto mt-8 max-w-md text-left">
            <TrackingSearch />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
