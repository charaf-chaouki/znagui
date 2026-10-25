"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { FactureStatut } from "@prisma/client";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { factureLivStatutLabel } from "@/lib/i18n/labels";

const STEPS: FactureStatut[] = ["EN_ATTENTE", "MONTANT_VERSE", "PAYE"];

export function FactureLivreurStatusControl({ id, statut }: { id: string; statut: FactureStatut }) {
  const router = useRouter();
  const { locale } = useI18n();
  const [busy, setBusy] = useState<FactureStatut | null>(null);

  async function set(next: FactureStatut) {
    if (next === statut) return;
    setBusy(next);
    await fetch(`/api/factures-livreurs/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {STEPS.map((s) => {
        const active = s === statut;
        return (
          <button
            key={s}
            onClick={() => set(s)}
            disabled={busy !== null}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              active ? "bg-brand text-brand-contrast" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {busy === s && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {factureLivStatutLabel(locale, s)}
          </button>
        );
      })}
    </div>
  );
}
