import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";

export async function Pagination({
  basePath,
  params,
  page,
  totalPages,
  total,
  perPage,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}) {
  const { t } = await getServerT();
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // window of page numbers around current
  const nums: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) nums.push(i);

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        {total === 0 ? t("empty.generic") : <>{t("common.showing")} <b className="text-foreground">{from}–{to}</b> {t("common.of")} <b className="text-foreground">{total}</b></>}
      </p>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1">
          {page > 1 ? (
            <Link href={href(page - 1)} className={`${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className={`${base} border-slate-100 bg-slate-50 text-slate-300`}><ChevronLeft className="h-4 w-4" /></span>
          )}

          {start > 1 && (
            <>
              <Link href={href(1)} className={`${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}>1</Link>
              {start > 2 && <span className="px-1 text-slate-400">…</span>}
            </>
          )}

          {nums.map((n) => (
            <Link
              key={n}
              href={href(n)}
              className={`${base} ${n === page ? "border-brand bg-brand text-brand-contrast" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {n}
            </Link>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
              <Link href={href(totalPages)} className={`${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}>{totalPages}</Link>
            </>
          )}

          {page < totalPages ? (
            <Link href={href(page + 1)} className={`${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className={`${base} border-slate-100 bg-slate-50 text-slate-300`}><ChevronRight className="h-4 w-4" /></span>
          )}
        </nav>
      )}
    </div>
  );
}
