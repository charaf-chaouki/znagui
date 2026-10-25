"use client";

import { useEffect } from "react";
import QRCode from "react-qr-code";
import { Printer, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { formatMAD } from "@/lib/colis-ui";
import type { ColisDetail } from "@/lib/types/colis";

const VEHICLE_LABEL: Record<string, string> = { MOTO: "Moto", VOITURE: "Voiture", CAMION: "Camion" };

export function ColisTicket({ colis: c }: { colis: ColisDetail }) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh bg-slate-100 py-8 print:bg-white print:py-0">
      {/* Toolbar (hidden when printing) */}
      <div className="mx-auto mb-4 flex max-w-[420px] items-center justify-between px-4 print:hidden">
        <button
          onClick={() => window.close()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Fermer
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark"
        >
          <Printer className="h-4 w-4" /> Imprimer
        </button>
      </div>

      {/* Ticket */}
      <div className="mx-auto w-[420px] max-w-full bg-white p-6 shadow-lg print:w-full print:max-w-none print:shadow-none">
        <div className="flex items-start justify-between border-b border-dashed border-slate-300 pb-4">
          <Logo href={null} heightClass="h-8" />
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Bon de livraison</p>
            <p className="text-xs text-slate-500">{c.date}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">N° de suivi</p>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">{c.trk}</p>
            <span className="mt-1 inline-block rounded border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              {c.type === "INTRA" ? "Même ville" : "Inter-villes"}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 p-1.5">
            <QRCode value={c.trk} size={84} />
          </div>
        </div>

        <TicketBlock title="EXPÉDITEUR">
          <p className="font-semibold text-slate-900">{c.client}</p>
          <p className="text-slate-600">{c.pickupAddress}</p>
          <p className="text-slate-600">{c.pickupCity}</p>
        </TicketBlock>

        <TicketBlock title="DESTINATAIRE">
          <p className="font-semibold text-slate-900">{c.recipient}</p>
          <p className="text-slate-600">{c.recipientPhone}</p>
          <p className="text-slate-600">{c.destAddress}</p>
          <p className="text-slate-600">{c.destCity}</p>
        </TicketBlock>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-dashed border-slate-300 pt-4 text-sm">
          <Field label="Contenu" value={c.contents} />
          <Field label="Nb colis" value={String(c.parcelCount)} />
          <Field label="Véhicule" value={VEHICLE_LABEL[c.vehicle]} />
          <Field label="Tarif" value={formatMAD(c.tarif)} />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white print:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">À collecter (COD)</span>
          <span className="text-xl font-extrabold">{formatMAD(c.cod)}</span>
        </div>

        {c.notes && (
          <p className="mt-3 text-xs text-slate-500">
            <span className="font-semibold">Note : </span>{c.notes}
          </p>
        )}

        <p className="mt-5 border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-400">
          Znagui Express — Livraison de colis au Maroc · znaguiexpress.ma
        </p>
      </div>
    </div>
  );
}

function TicketBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-dashed border-slate-300 py-3 text-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
