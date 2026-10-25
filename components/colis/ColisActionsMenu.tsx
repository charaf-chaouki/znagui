"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Pencil, RefreshCw, Printer } from "lucide-react";
import type { ColisStatut } from "@/lib/types/colis";
import { StatusModal } from "@/components/colis/StatusModal";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function ColisActionsMenu({ id, trk, statut }: { id: string; trk: string; statut: ColisStatut }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const item = "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label={t("common.actions")}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute end-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link href={`/admin/colis/${trk}`} className={item} onClick={() => setOpen(false)}>
            <Eye className="h-4 w-4 text-slate-400" /> {t("action.voirDetails")}
          </Link>
          <Link href={`/admin/colis/${trk}/modifier`} className={item} onClick={() => setOpen(false)}>
            <Pencil className="h-4 w-4 text-slate-400" /> {t("action.modifierColis")}
          </Link>
          <button
            className={item}
            onClick={() => {
              setOpen(false);
              setStatusOpen(true);
            }}
          >
            <RefreshCw className="h-4 w-4 text-slate-400" /> {t("action.changerStatut")}
          </button>
          <div className="my-1 border-t border-slate-100" />
          <Link href={`/ticket/${trk}`} target="_blank" className={item} onClick={() => setOpen(false)}>
            <Printer className="h-4 w-4 text-slate-400" /> {t("action.imprimerTicket")}
          </Link>
        </div>
      )}

      {statusOpen && <StatusModal id={id} trk={trk} current={statut} onClose={() => setStatusOpen(false)} />}
    </div>
  );
}
