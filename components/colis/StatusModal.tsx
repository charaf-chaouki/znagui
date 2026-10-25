"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import type { ColisStatut } from "@/lib/types/colis";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { colisStatutLabel } from "@/lib/i18n/labels";

const ORDER: ColisStatut[] = [
  "CREE", "DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE", "RAMASSE",
  "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION", "RECU_PAR_AGENCE_DEST",
  "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE",
  "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE",
];

export function StatusModal({
  id,
  trk,
  current,
  onClose,
}: {
  id: string;
  trk: string;
  current: ColisStatut;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [statut, setStatut] = useState<ColisStatut>(current);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/colis/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, note }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.message || t("sm.updateFailed"));
        setSaving(false);
        return;
      }
      setDone(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 700);
    } catch {
      setError(t("action.connError"));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{t("action.changerStatut")}</h3>
            <p className="text-sm text-muted">{trk}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">{error}</div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("sm.nouveauStatut")}</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as ColisStatut)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {ORDER.map((s) => <option key={s} value={s}>{colisStatutLabel(locale, s)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("sm.noteOpt")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={t("sm.notePlaceholder")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            {t("common.cancel")}
          </button>
          <button
            onClick={save}
            disabled={saving || done}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {done ? t("sm.updated") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
