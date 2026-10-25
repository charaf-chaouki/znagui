import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ClientColisTable } from "@/components/client/ClientColisTable";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listClientColis, PER_PAGE } from "@/lib/server/client-portal.service";

export const metadata = { title: "Mes colis" };
export const instant = false;

export default async function ClientColisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/colis");

  const { t, tv } = await getServerT();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listClientColis(user.client.id, page, PER_PAGE);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("page.mesColis")}
        subtitle={tv("sub.colisTotal", { n: result.total })}
        action={
          <Link href="/client/colis/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newColis")}
          </Link>
        }
      />
      <ClientColisTable rows={result.rows} emptyLabel={t("empty.clientNoColis")} />
      <Pagination basePath="/client/colis" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
