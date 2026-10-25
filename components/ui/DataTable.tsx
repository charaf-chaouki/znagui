import { Inbox } from "lucide-react";

export type Column<T> = {
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string; // td
  thClassName?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyLabel = "Aucun résultat",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.thClassName ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <div className="flex flex-col items-center gap-2 text-center text-muted">
                    <Inbox className="h-8 w-8 text-slate-300" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={rowKey(row, i)} className="transition-colors hover:bg-slate-50/70">
                  {columns.map((c, j) => (
                    <td key={j} className={`px-4 py-3 text-foreground ${c.className ?? ""}`}>
                      {c.cell(row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
