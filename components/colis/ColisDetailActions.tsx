"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, RefreshCw, Printer } from "lucide-react";
import type { ColisStatut } from "@/lib/types/colis";
import { StatusModal } from "@/components/colis/StatusModal";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function ColisDetailActions({ id, trk, statut }: { id: string; trk: string; statut: ColisStatut }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const outline =
    "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/colis/${trk}/modifier`} className={outline}>
        <Pencil className="h-4 w-4" /> {t("common.edit")}
      </Link>
      <button onClick={() => setOpen(true)} className={outline}>
        <RefreshCw className="h-4 w-4" /> {t("action.changerStatut")}
      </button>
      <Link
        href={`/ticket/${trk}`}
        target="_blank"
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark"
      >
        <Printer className="h-4 w-4" /> {t("action.imprimerTicket")}
      </Link>
      {open && <StatusModal id={id} trk={trk} current={statut} onClose={() => setOpen(false)} />}
    </div>
  );
}
