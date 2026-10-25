"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function ColisSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useI18n();
  const [q, setQ] = useState(sp.get("search") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(sp.toString());
    if (q.trim()) p.set("search", q.trim());
    else p.delete("search");
    p.delete("page");
    router.push(`/admin/colis${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-xs">
      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search.colis")}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </form>
  );
}
