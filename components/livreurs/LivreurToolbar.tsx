"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function LivreurToolbar({ agences }: { agences: { id: string; nom: string }[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useI18n();
  const [q, setQ] = useState(sp.get("search") ?? "");

  function push(next: URLSearchParams) {
    next.delete("page");
    router.push(`/admin/livreurs${next.toString() ? `?${next}` : ""}`);
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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.livreur")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <select value={sp.get("agenceId") ?? ""} onChange={(e) => setParam("agenceId", e.target.value)} className={sel}>
          <option value="">{t("filter.allAgences")}</option>
          {agences.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>
        <select value={sp.get("ville") ?? ""} onChange={(e) => setParam("ville", e.target.value)} className={sel}>
          <option value="">{t("filter.allVilles")}</option>
          {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={sp.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)} className={sel}>
          <option value="">{t("filter.allStatuts")}</option>
          <option value="ACTIVE">{t("st.account.ACTIVE")}</option>
          <option value="PENDING">{t("st.account.PENDING")}</option>
          <option value="SUSPENDED">{t("st.account.SUSPENDED")}</option>
          <option value="INACTIVE">{t("st.account.INACTIVE")}</option>
        </select>
      </div>
    </div>
  );
}
