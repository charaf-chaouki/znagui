"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, PackageCheck, Truck, RotateCcw, Loader2 } from "lucide-react";
import type { ColisStatut } from "@/lib/types/colis";
import type { LivreurActionStatut } from "@/lib/types/livreur-portal";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const ECHEC: { statut: LivreurActionStatut; key: MessageKey }[] = [
  { statut: "PAS_DE_REPONSE", key: "st.colis.PAS_DE_REPONSE" },
  { statut: "REPORTE", key: "st.colis.REPORTE" },
  { statut: "REFUSE", key: "st.colis.REFUSE" },
  { statut: "RETOUR", key: "st.colis.RETOUR" },
];

export function ColisActions({
  colisId, statut, isRamasseur, isLivreur,
}: {
  colisId: string; statut: ColisStatut; isRamasseur: boolean; isLivreur: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState<LivreurActionStatut | null>(null);
  const [panel, setPanel] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pickupPhase = isRamasseur && ["DISPONIBLE_A_RAMASSER", "AFFECTE_RAMASSAGE"].includes(statut);
  const readyToDeliver = isLivreur && statut === "RAMASSE";
  const activeDelivery = isLivreur && ["EN_COURS_DE_LIVRAISON", "REPORTE", "PAS_DE_REPONSE"].includes(statut);
  const finalized = isLivreur && ["LIVRE", "REFUSE", "RETOUR", "ANNULE"].includes(statut);

  if (!pickupPhase && !readyToDeliver && !activeDelivery && !finalized) return null;

  async function act(target: LivreurActionStatut, redirect = false) {
    setBusy(target);
    setError(null);
    try {
      const res = await fetch(`/api/livreur/colis/${colisId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: target, note: note.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("la.opFailed"));
        setBusy(null);
        return;
      }
      if (redirect) {
        router.push("/livreur/colis");
        router.refresh();
      } else {
        // Stay on the page: reset state so the next-step buttons aren't left disabled
        // (router.refresh keeps this component instance, so busy must be cleared).
        setBusy(null);
        setPanel(false);
        setNote("");
        router.refresh();
      }
    } catch {
      setError(t("action.connError"));
      setBusy(null);
    }
  }

  const primary = "flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-bold text-brand-contrast shadow-sm active:scale-[0.99] disabled:opacity-60";
  const secondary = "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 active:scale-[0.99]";

  const echecButtons = (
    <div className="grid grid-cols-2 gap-2">
      {ECHEC.map((e) => (
        <button key={e.statut} onClick={() => act(e.statut, true)} disabled={busy !== null} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 active:scale-95 disabled:opacity-60">
          {busy === e.statut && <Loader2 className="h-4 w-4 animate-spin" />}
          {t(e.key)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {pickupPhase && (
        <button onClick={() => act("RAMASSE")} disabled={busy !== null} className={primary}>
          {busy === "RAMASSE" ? <Loader2 className="h-5 w-5 animate-spin" /> : <PackageCheck className="h-5 w-5" />}
          {t("la.confirmRamassage")}
        </button>
      )}

      {readyToDeliver && (
        <button onClick={() => act("EN_COURS_DE_LIVRAISON")} disabled={busy !== null} className={primary}>
          {busy === "EN_COURS_DE_LIVRAISON" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Truck className="h-5 w-5" />}
          {t("la.mettreLivraison")}
        </button>
      )}

      {activeDelivery && (
        <>
          <button onClick={() => act("LIVRE", true)} disabled={busy !== null} className={primary}>
            {busy === "LIVRE" ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            {t("la.markLivre")}
          </button>
          {!panel ? (
            <button onClick={() => setPanel(true)} disabled={busy !== null} className={secondary}>
              <AlertTriangle className="h-4 w-4 text-amber-500" /> {t("la.signaler")}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-foreground">{t("la.motif")}</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t("la.notePlaceholder")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              {echecButtons}
            </div>
          )}
        </>
      )}

      {finalized && (
        <>
          {!panel ? (
            <button onClick={() => setPanel(true)} disabled={busy !== null} className={secondary}>
              <RotateCcw className="h-4 w-4 text-slate-400" /> {t("la.modifierStatut")}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-foreground">{t("la.corrigerStatut")}</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t("la.notePlaceholder")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              <button onClick={() => act("EN_COURS_DE_LIVRAISON")} disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand/40 bg-brand-light/50 py-2.5 text-sm font-semibold text-brand-darker active:scale-95">
                {busy === "EN_COURS_DE_LIVRAISON" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />} {t("la.remettreLivraison")}
              </button>
              <button onClick={() => act("LIVRE", true)} disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-contrast active:scale-95">
                {busy === "LIVRE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t("la.markLivre")}
              </button>
              {echecButtons}
            </div>
          )}
        </>
      )}

      {error && <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
