"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function FactureLivreurToolbar({
  livreurs, agences,
}: {
  livreurs: { id: string; nom: string }[];
  agences: { id: string; nom: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useI18n();
  const [q, setQ] = useState(sp.get("search") ?? "");

  function push(next: URLSearchParams) {
    next.delete("page");
    router.push(`/admin/factures-livreurs${next.toString() ? `?${next}` : ""}`);
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
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.refOrLivreur")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <select value={sp.get("livreurId") ?? ""} onChange={(e) => setParam("livreurId", e.target.value)} className={sel}>
          <option value="">{t("filter.allLivreurs")}</option>
          {livreurs.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
        <select value={sp.get("agenceId") ?? ""} onChange={(e) => setParam("agenceId", e.target.value)} className={sel}>
          <option value="">{t("filter.allAgences")}</option>
          {agences.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>
        <select value={sp.get("statut") ?? ""} onChange={(e) => setParam("statut", e.target.value)} className={sel}>
          <option value="">{t("filter.allStatuts")}</option>
          <option value="EN_ATTENTE">{t("st.factureliv.EN_ATTENTE")}</option>
          <option value="MONTANT_VERSE">{t("st.factureliv.MONTANT_VERSE")}</option>
          <option value="PAYE">{t("st.factureliv.PAYE")}</option>
        </select>
        <input type="date" value={sp.get("dateFrom") ?? ""} onChange={(e) => setParam("dateFrom", e.target.value)} className={sel} aria-label={t("filter.dateFrom")} />
        <input type="date" value={sp.get("dateTo") ?? ""} onChange={(e) => setParam("dateTo", e.target.value)} className={sel} aria-label={t("filter.dateTo")} />
      </div>
    </div>
  );
}
