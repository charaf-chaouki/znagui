"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Power, Loader2 } from "lucide-react";
import type { AgenceStatus } from "@/lib/types/agence";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function AgenceActionsMenu({ id, status }: { id: string; status: AgenceStatus }) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    setBusy(true);
    const next = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/agences/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setOpen(false);
    setBusy(false);
    router.refresh();
  }

  const item = "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label={t("common.actions")}>
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute end-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link href={`/admin/agences/${id}`} className={item} onClick={() => setOpen(false)}>
            <Eye className="h-4 w-4 text-slate-400" /> {t("action.voirDetails")}
          </Link>
          <Link href={`/admin/agences/${id}/modifier`} className={item} onClick={() => setOpen(false)}>
            <Pencil className="h-4 w-4 text-slate-400" /> {t("common.edit")}
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button onClick={toggle} disabled={busy} className={item}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4 text-slate-400" />}
            {status === "ACTIVE" ? t("action.desactiver") : t("action.activer")}
          </button>
        </div>
      )}
    </div>
  );
}
