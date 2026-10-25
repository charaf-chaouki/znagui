"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function ValiderPaiementButton({ id }: { id: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  async function validate() {
    setBusy(true);
    await fetch(`/api/factures-livreurs/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "PAYE" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={validate} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-60">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t("action.validerPaiement")}
    </button>
  );
}
