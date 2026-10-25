import type { LucideIcon } from "lucide-react";

type Trend = { value: string; up?: boolean };

// Fabria-style KPI card: circular tinted icon on the left, label + value stacked beside it.
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  unit,
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "info" | "warning" | "danger" | "slate";
  /** Small muted suffix after the value, e.g. "DH". */
  unit?: string;
  hint?: string;
  trend?: Trend;
}) {
  const toneMap: Record<string, string> = {
    brand: "bg-brand-light text-brand-dark",
    info: "bg-sky-50 text-sky-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${toneMap[tone]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold capitalize tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            {value}
            {unit && <span className="ml-1 text-sm font-semibold text-slate-500">{unit}</span>}
          </div>
          {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
        </div>
        {trend && (
          <span className={`shrink-0 text-xs font-semibold ${trend.up ? "text-brand-dark" : "text-red-500"}`}>
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
