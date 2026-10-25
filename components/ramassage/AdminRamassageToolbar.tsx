"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { RAMASSAGE_STATUT_LABEL } from "@/lib/ramassage-ui";
import type { RamassageStatut } from "@prisma/client";

const STATUTS: RamassageStatut[] = ["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"];

export function AdminRamassageToolbar({ agences }: { agences: { id: string; nom: string }[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("search") ?? "");

  function push(next: URLSearchParams) {
    next.delete("page");
    router.push(`/admin/ramassages${next.toString() ? `?${next}` : ""}`);
  }
  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(sp.toString());
    if (q.trim()) p.set("search", q.trim());
    else p.delete("search");
    push(p);
  }
  function setParam(key: string, value: string) {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    push(p);
  }

  const sel = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <form onSubmit={onSearch} className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Référence…" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <select value={sp.get("agenceId") ?? ""} onChange={(e) => setParam("agenceId", e.target.value)} className={sel}>
          <option value="">Toutes les agences</option>
          {agences.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>
        <select value={sp.get("statut") ?? ""} onChange={(e) => setParam("statut", e.target.value)} className={sel}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{RAMASSAGE_STATUT_LABEL[s]}</option>)}
        </select>
      </div>
    </div>
  );
}
