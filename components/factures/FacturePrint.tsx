"use client";

import { useEffect } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { formatMAD } from "@/lib/colis-ui";
import { FACTURE_STATUT_LABEL } from "@/lib/facture-ui";
import type { FactureClientDetail } from "@/lib/types/facture-client";
import type { CompanySettings } from "@/lib/types/settings";

export function FacturePrint({ facture: f, company }: { facture: FactureClientDetail; company: CompanySettings }) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);

  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";
  const legal = [
    company.ice && `ICE : ${company.ice}`,
    company.rc && `RC : ${company.rc}`,
    company.if && `IF : ${company.if}`,
    company.patente && `Patente : ${company.patente}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="min-h-dvh bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <button onClick={() => window.close()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Fermer
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark">
          <Printer className="h-4 w-4" /> Imprimer / PDF
        </button>
      </div>

      <div className="mx-auto w-[210mm] min-h-[297mm] max-w-full bg-white p-[14mm] shadow-lg print:w-full print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
          <div className="flex items-start gap-3">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={societe} className="h-14 w-auto object-contain" />
            ) : null}
            <div>
              <p className="text-lg font-extrabold text-slate-900">{societe}</p>
              {company.formeJuridique && <p className="text-xs text-slate-500">{company.formeJuridique}{company.capital && ` · Capital ${company.capital} DH`}</p>}
              {company.adresse && <p className="text-xs text-slate-600">{company.adresse}{company.ville && `, ${company.ville}`}</p>}
              <p className="text-xs text-slate-600">
                {[company.telephone, company.email, company.siteWeb].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">FACTURE</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-700">{f.reference}</p>
            <p className="text-xs text-slate-500">Date : {f.date}</p>
            <p className="mt-1 inline-block rounded border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              {FACTURE_STATUT_LABEL[f.statut]}{f.paidAt ? ` le ${f.paidAt}` : ""}
            </p>
          </div>
        </div>

        {/* Client */}
        <div className="mt-6 flex justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Facturé à</p>
            <p className="font-semibold text-slate-900">{f.client.nom}</p>
            <p className="text-sm text-slate-600">{f.client.telephone}</p>
            {f.client.adresse && <p className="text-sm text-slate-600">{f.client.adresse}</p>}
            <p className="text-sm text-slate-600">{f.client.ville}</p>
          </div>
        </div>

        {/* Lines */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-50 text-left print:bg-slate-50">
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">N° suivi</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Destinataire</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">COD</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Tarif</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Collecté</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">À verser</th>
            </tr>
          </thead>
          <tbody>
            {f.lignes.map((l) => (
              <tr key={l.colisId} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-800">{l.trk}</td>
                <td className="px-3 py-2 text-slate-700">{l.recipient}<span className="text-slate-400"> · {l.destCity}</span></td>
                <td className="px-3 py-2 text-right text-slate-700">{formatMAD(l.cod)}</td>
                <td className="px-3 py-2 text-right text-slate-700">{formatMAD(l.tarif)}</td>
                <td className="px-3 py-2 text-right text-slate-800">{formatMAD(l.collecte)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatMAD(l.aVerser)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-72 space-y-1.5 text-sm">
            <TotalRow label="Montant collecté" value={formatMAD(f.montantCollecte)} />
            <TotalRow label="Total tarifs" value={formatMAD(f.tarifTotal)} />
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white print:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">Montant à verser</span>
              <span className="text-lg font-extrabold">{formatMAD(f.montantNet)}</span>
            </div>
          </div>
        </div>

        {legal && <p className="mt-10 border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-400">{legal}{company.cnss && ` · CNSS : ${company.cnss}`}</p>}
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
