"use client";

import { useEffect } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { EXPEDITION_STATUT_LABEL } from "@/lib/expedition-ui";
import type { ExpeditionDetail } from "@/lib/types/expedition";
import type { CompanySettings } from "@/lib/types/settings";

export function ExpeditionPrint({ expedition: e, company }: { expedition: ExpeditionDetail; company: CompanySettings }) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);

  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";

  return (
    <div className="min-h-dvh bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <button onClick={() => window.close()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Fermer</button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark"><Printer className="h-4 w-4" /> Imprimer / PDF</button>
      </div>

      <div className="mx-auto w-[800px] max-w-full bg-white p-10 shadow-lg print:w-full print:max-w-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
          <div className="flex items-start gap-3">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={societe} className="h-14 w-auto object-contain" />
            ) : null}
            <div>
              <p className="text-lg font-extrabold text-slate-900">{societe}</p>
              {company.adresse && <p className="text-xs text-slate-600">{company.adresse}{company.ville && `, ${company.ville}`}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">BORDEREAU D'EXPÉDITION</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-700">{e.reference}</p>
            <p className="text-xs text-slate-500">Date : {e.date}</p>
            <p className="mt-1 inline-block rounded border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{EXPEDITION_STATUT_LABEL[e.statut]}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Agence source</p>
            <p className="font-semibold text-slate-900">{e.agenceSource}</p>
            <p className="text-sm text-slate-600">{e.agenceSourceVille}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Agence destination</p>
            <p className="font-semibold text-slate-900">{e.agenceDest}</p>
            <p className="text-sm text-slate-600">{e.agenceDestVille}</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-50 text-left print:bg-slate-50">
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">#</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">N° suivi</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Destinataire</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Ville</th>
            </tr>
          </thead>
          <tbody>
            {e.lignes.map((l, i) => (
              <tr key={l.colisId} className="border-b border-slate-100">
                <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-slate-800">{l.trk}</td>
                <td className="px-3 py-2 text-slate-700">{l.recipient}</td>
                <td className="px-3 py-2 text-slate-600">{l.destCity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-right text-sm font-semibold text-slate-900">Total colis : {e.total}</p>

        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-dashed border-slate-300 pt-6 text-xs text-slate-500">
          <div>Signature agence source</div>
          <div className="text-right">Signature agence destination</div>
        </div>
      </div>
    </div>
  );
}
