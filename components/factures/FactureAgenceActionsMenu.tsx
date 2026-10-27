"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Printer, CheckCircle2, Wallet, RotateCcw, Loader2 } from "lucide-react";
import type { FactureStatut } from "@prisma/client";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function FactureAgenceActionsMenu({ id, statut }: { id: string; statut: FactureStatut }) {
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

  async function setStatus(next: FactureStatut) {
    setBusy(true);
    await fetch(`/api/factures-agences/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
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
        <div className="absolute end-0 top-9 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link href={`/admin/factures-agences/${id}`} className={item} onClick={() => setOpen(false)}>
            <Eye className="h-4 w-4 text-slate-400" /> {t("action.voirPdf")}
          </Link>
          <a href={`/api/pdf/facture-agence/${id}`} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}>
            <Printer className="h-4 w-4 text-slate-400" /> {t("action.imprimer")}
          </a>
          <div className="my-1 border-t border-slate-100" />
          {statut !== "MONTANT_VERSE" && statut !== "PAYE" && (
            <button onClick={() => setStatus("MONTANT_VERSE")} disabled={busy} className={item}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4 text-sky-500" />} {t("action.markVerse")}
            </button>
          )}
          {statut !== "PAYE" && (
            <button onClick={() => setStatus("PAYE")} disabled={busy} className={`${item} text-brand-dark`}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-brand" />} {t("action.markPaid")}
            </button>
          )}
          {statut !== "EN_ATTENTE" && (
            <button onClick={() => setStatus("EN_ATTENTE")} disabled={busy} className={item}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4 text-slate-400" />} {t("action.remettreAttente")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
