import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, PackageCheck, Send, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";
import {
  AgenceKpiCards, KpiSkeleton,
  AgenceCharts, ChartsSkeleton,
  AgenceRecentColis, RecentSkeleton,
} from "@/components/agence/dashboard/AgenceDashboardSections";

export const metadata = { title: "Tableau de bord — Agence" };
export const instant = false;

export default async function AgenceDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence");
  const { id: agenceId } = user.agence;

  const [{ t }, agence] = await Promise.all([
    getServerT(),
    prisma.agence.findUnique({ where: { id: agenceId }, select: { nom: true, ville: { select: { id: true, nom: true } } } }),
  ]);
  const villeId = agence?.ville.id ?? "";

  return (
    <div className="space-y-6">
      <PageHeader title={t("dash.title")} subtitle={`${agence?.nom} · ${agence?.ville.nom}`} />

      {/* Each section streams in with its own skeleton while its data loads. */}
      <Suspense fallback={<KpiSkeleton />}>
        <AgenceKpiCards agenceId={agenceId} villeId={villeId} />
      </Suspense>

      <Suspense fallback={<ChartsSkeleton />}>
        <AgenceCharts agenceId={agenceId} villeId={villeId} />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction href="/agence/ramassages/nouveau" icon={<Plus className="h-4 w-4 text-brand" />} title={t("qa.nouveauRamassage")} note={t("qa.nouveauRamassage.note")} />
        <QuickAction href="/agence/ramassages" icon={<PackageCheck className="h-4 w-4 text-brand" />} title={t("qa.mesRamassages")} note={t("qa.mesRamassages.note")} />
        <QuickAction href="/agence/expeditions/nouveau" icon={<Send className="h-4 w-4 text-brand" />} title={t("qa.nouvelleExpedition")} note={t("qa.nouvelleExpedition.note")} />
      </div>

      <Suspense fallback={<RecentSkeleton />}>
        <AgenceRecentColis agenceId={agenceId} villeId={villeId} />
      </Suspense>
    </div>
  );
}

function QuickAction({ href, icon, title, note }: { href: string; icon: React.ReactNode; title: string; note: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand">
      <div>
        <p className="flex items-center gap-2 font-semibold text-foreground">{icon} {title}</p>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300" />
    </Link>
  );
}
