"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { QrScanner } from "@/components/livreur/QrScanner";

export default function LivreurScanPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDetected = useCallback(async (code: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/livreur/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Colis introuvable.");
        setBusy(false);
        return;
      }
      router.push(`/livreur/colis/${encodeURIComponent(data.trk)}`);
    } catch {
      setError("Connexion impossible.");
      setBusy(false);
    }
  }, [router]);

  return (
    <div className="space-y-4">
      <Link href="/livreur" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>
      <h1 className="text-xl font-bold text-foreground">Scanner un colis</h1>

      <QrScanner onDetected={onDetected} busy={busy} />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
