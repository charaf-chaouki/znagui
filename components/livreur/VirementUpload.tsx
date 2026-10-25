"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";
import { formatMAD } from "@/lib/colis-ui";

export function VirementUpload({ factureId, montant }: { factureId: string; montant: number }) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!url) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/livreur/factures/${factureId}/virement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pieceJointeUrl: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Échec de l'envoi.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-brand/30 bg-brand-light/30 p-4">
      <div>
        <p className="font-semibold text-foreground">Déclarer le virement</p>
        <p className="text-sm text-muted">Versez <b className="text-brand-dark">{formatMAD(montant)}</b> à l'agence, puis joignez la preuve du virement (image ou PDF).</p>
      </div>
      <FileUpload label="Preuve de virement" value={url} onChange={setUrl} accept="image/*,application/pdf" />
      <button onClick={confirm} disabled={busy || !url} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-brand-contrast active:scale-[0.99] disabled:opacity-50">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        Confirmer le virement
      </button>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-danger"><AlertCircle className="h-4 w-4" /> {error}</p>
      )}
    </div>
  );
}
