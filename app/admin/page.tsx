import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import {
  AdminKpiCards, KpiSkeleton,
  AdminCharts, ChartsSkeleton,
  AdminRecentColis, RecentSkeleton,
} from "@/components/admin/dashboard/AdminDashboardSections";

export const metadata = { title: "Tableau de bord" };
export const instant = false;

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/connexion?next=/admin");

  const { t, locale } = await getServerT();
  // Computed after the dynamic auth access, so it renders at request time.
  const mois = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", { month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dash.title")}
        subtitle={t("dash.admin.subtitle")}
        action={
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium capitalize text-muted">
            {mois}
          </span>
        }
      />

      {/* Each section streams in with its own skeleton while its data loads. */}
      <Suspense fallback={<KpiSkeleton />}>
        <AdminKpiCards />
      </Suspense>

      <Suspense fallback={<ChartsSkeleton />}>
        <AdminCharts />
      </Suspense>

      <Suspense fallback={<RecentSkeleton />}>
        <AdminRecentColis />
      </Suspense>
    </div>
  );
}
