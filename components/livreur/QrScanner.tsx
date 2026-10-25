"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, CameraOff, Loader2, Search } from "lucide-react";

// Web QR scanning via the native BarcodeDetector (Chromium / Android WebView).
// Falls back to manual entry where it's unavailable (e.g. iOS Safari).
// For the Capacitor build, swap the camera block for @capacitor-community/barcode-scanner.
export function QrScanner({ onDetected, busy }: { onDetected: (code: string) => void; busy?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"starting" | "scanning" | "unsupported" | "denied">("starting");
  const [manual, setManual] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    async function start() {
      const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (!Detector) {
        setStatus("unsupported");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped) return;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setStatus("scanning");
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0 && codes[0].rawValue) {
              stopped = true;
              onDetected(codes[0].rawValue.trim());
              return;
            }
          } catch { /* frame not ready */ }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setStatus("denied");
      }
    }
    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-900">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {/* framing overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
        {status !== "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 px-6 text-center text-white">
            {status === "starting" && <><Loader2 className="h-7 w-7 animate-spin" /><p className="text-sm">Démarrage de la caméra…</p></>}
            {status === "denied" && <><CameraOff className="h-7 w-7" /><p className="text-sm">Caméra indisponible. Saisissez le numéro ci-dessous.</p></>}
            {status === "unsupported" && <><QrCode className="h-7 w-7" /><p className="text-sm">Scan non supporté ici. Saisissez le numéro ci-dessous.</p></>}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand/20">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {status === "scanning" && <p className="text-center text-sm text-muted">Placez le QR du colis dans le cadre.</p>}

      {/* Manual fallback */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (manual.trim()) onDetected(manual.trim()); }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Ou saisir le N° de suivi (TRK)…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <button type="submit" disabled={busy || !manual.trim()} className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-contrast disabled:opacity-50">OK</button>
      </form>
    </div>
  );
}
