"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import type { FactureStatut } from "@prisma/client";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function FactureStatusControl({ id, statut }: { id: string; statut: FactureStatut }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const paid = statut === "PAYE";

  async function setStatus(next: FactureStatut) {
    setBusy(true);
    await fetch(`/api/factures-clients/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    setBusy(false);
    router.refresh();
  }

  return paid ? (
    <button onClick={() => setStatus("EN_ATTENTE")} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} {t("action.remettreNouveau")}
    </button>
  ) : (
    <button onClick={() => setStatus("PAYE")} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-60">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t("action.markPaid")}
    </button>
  );
}
