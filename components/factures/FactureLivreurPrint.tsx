"use client";

import { useEffect } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { formatMAD } from "@/lib/colis-ui";
import { FACTURE_LIVREUR_STATUT_LABEL } from "@/lib/facture-ui";
import type { FactureLivreurDetail } from "@/lib/types/facture-livreur";
import type { CompanySettings } from "@/lib/types/settings";

export function FactureLivreurPrint({ facture: f, company }: { facture: FactureLivreurDetail; company: CompanySettings }) {
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
      <div className="mx-auto mb-4 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <button onClick={() => window.close()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Fermer
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark">
          <Printer className="h-4 w-4" /> Imprimer / PDF
        </button>
      </div>

      <div className="mx-auto w-[800px] max-w-full bg-white p-10 shadow-lg print:w-full print:max-w-none print:p-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
          <div className="flex items-start gap-3">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={societe} className="h-14 w-auto object-contain" />
            ) : null}
            <div>
              <p className="text-lg font-extrabold text-slate-900">{societe}</p>
              {company.adresse && <p className="text-xs text-slate-600">{company.adresse}{company.ville && `, ${company.ville}`}</p>}
              <p className="text-xs text-slate-600">{[company.telephone, company.email].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">RÈGLEMENT LIVREUR</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-700">{f.reference}</p>
            <p className="text-xs text-slate-500">Date : {f.date}</p>
            <p className="mt-1 inline-block rounded border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              {FACTURE_LIVREUR_STATUT_LABEL[f.statut]}{f.paidAt ? ` le ${f.paidAt}` : ""}
            </p>
          </div>
        </div>

        {/* Livreur */}
        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Livreur</p>
          <p className="font-semibold text-slate-900">{f.livreur.prenom} {f.livreur.nom}</p>
          <p className="text-sm text-slate-600">{f.livreur.telephone} · {f.livreur.agence} ({f.livreur.ville})</p>
        </div>

        {/* Lines */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-50 text-left print:bg-slate-50">
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">N° suivi</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Trajet</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Rôle</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Collecté</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Tarif</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Commission</th>
            </tr>
          </thead>
          <tbody>
            {f.lignes.map((l) => (
              <tr key={l.colisId} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-800">{l.trk}</td>
                <td className="px-3 py-2 text-slate-600">{l.trajet}</td>
                <td className="px-3 py-2 text-slate-600">{l.role}</td>
                <td className="px-3 py-2 text-right text-slate-700">{formatMAD(l.cod)}</td>
                <td className="px-3 py-2 text-right text-slate-700">{formatMAD(l.tarif)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatMAD(l.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-80 space-y-1.5 text-sm">
            <TotalRow label="Montant collecté (COD)" value={formatMAD(f.montantCollecte)} />
            <TotalRow label="Commission livreur" value={formatMAD(f.commission)} />
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white print:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">Montant à verser à l'agence</span>
              <span className="text-lg font-extrabold">{formatMAD(f.montantAVerser)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-dashed border-slate-300 pt-6 text-xs text-slate-500">
          <div>Signature livreur</div>
          <div className="text-right">Signature agence</div>
        </div>

        {legal && <p className="mt-8 border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-400">{legal}{company.cnss && ` · CNSS : ${company.cnss}`}</p>}
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
