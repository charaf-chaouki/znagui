"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, PackageCheck, Inbox } from "lucide-react";
import { formatMAD } from "@/lib/colis-ui";
import type { UninvoicedColis } from "@/lib/types/facture-client";

export function FactureBuilder({
  clients,
  selectedClientId,
  colis,
  mode = "create",
  factureId,
  preselected = [],
  clientName,
}: {
  clients: { id: string; nom: string }[];
  selectedClientId?: string;
  colis: UninvoicedColis[];
  mode?: "create" | "edit";
  factureId?: string;
  preselected?: string[];
  clientName?: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set(preselected));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allChecked = colis.length > 0 && colis.every((c) => checked.has(c.id));
  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(colis.map((c) => c.id)));

  const totals = useMemo(() => {
    let collecte = 0, tarif = 0, aVerser = 0, n = 0;
    for (const c of colis) {
      if (checked.has(c.id)) { collecte += c.collecte; tarif += c.tarif; aVerser += c.aVerser; n++; }
    }
    return { collecte, tarif, aVerser, n };
  }, [checked, colis]);

  function onClientChange(id: string) {
    router.push(`/admin/factures-clients/nouveau${id ? `?client=${id}` : ""}`);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const colisIds = [...checked];
    try {
      const res = await fetch(mode === "edit" ? `/api/factures-clients/${factureId}` : "/api/factures-clients", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? { colisIds } : { clientId: selectedClientId, colisIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Échec de l'enregistrement.");
        setSaving(false);
        return;
      }
      router.push(`/admin/factures-clients/${mode === "edit" ? factureId : data.id}`);
      router.refresh();
    } catch {
      setError("Connexion impossible.");
      setSaving(false);
    }
  }

  const th = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500";
  const td = "px-4 py-3";

  return (
    <div className="space-y-5">
      {/* Client */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Client *</label>
        {mode === "edit" ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium">{clientName ?? "—"}</div>
        ) : (
          <select
            value={selectedClientId ?? ""}
            onChange={(e) => onClientChange(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Sélectionner un client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        )}
      </div>

      {/* Colis picker */}
      {(mode === "edit" || selectedClientId) && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <PackageCheck className="h-4 w-4 text-brand" />
            <h3 className="text-sm font-semibold text-foreground">Colis livrés à facturer</h3>
            <span className="ml-auto text-xs text-muted">{colis.length} éligible{colis.length > 1 ? "s" : ""}</span>
          </div>

          {colis.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
              <Inbox className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-muted">Aucun colis livré en attente de facturation pour ce client.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                    <th className={`${th} w-10`}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 accent-[var(--brand,#009206)]" aria-label="Tout sélectionner" />
                    </th>
                    <th className={th}>N° suivi</th>
                    <th className={th}>Destinataire</th>
                    <th className={`${th} text-right`}>COD</th>
                    <th className={`${th} text-right`}>Tarif</th>
                    <th className={`${th} text-right`}>Collecté</th>
                    <th className={`${th} text-right`}>À verser</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colis.map((c) => {
                    const on = checked.has(c.id);
                    return (
                      <tr key={c.id} className={on ? "bg-brand-light/30" : "hover:bg-slate-50/60"}>
                        <td className={td}>
                          <input type="checkbox" checked={on} onChange={() => toggle(c.id)} className="h-4 w-4 accent-[var(--brand,#009206)]" aria-label={`Sélectionner ${c.trk}`} />
                        </td>
                        <td className={`${td} font-semibold text-brand-dark`}>{c.trk}</td>
                        <td className={td}>
                          <span className="block font-medium text-foreground">{c.recipient}</span>
                          <span className="block text-xs text-muted">{c.destCity} · {c.date}</span>
                        </td>
                        <td className={`${td} text-right`}>{formatMAD(c.cod)}</td>
                        <td className={`${td} text-right`}>{formatMAD(c.tarif)}</td>
                        <td className={`${td} text-right font-medium`}>{formatMAD(c.collecte)}</td>
                        <td className={`${td} text-right font-semibold text-brand-dark`}>{formatMAD(c.aVerser)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Selected summary */}
      {totals.n > 0 && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-brand/30 bg-brand-light/30 p-5 sm:grid-cols-4">
          <Sum label={`Colis sélectionnés`} value={String(totals.n)} />
          <Sum label="Montant collecté" value={formatMAD(totals.collecte)} />
          <Sum label="Tarifs" value={formatMAD(totals.tarif)} />
          <Sum label="Montant à verser" value={formatMAD(totals.aVerser)} strong />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annuler</button>
        <button type="button" onClick={save} disabled={saving || totals.n === 0} className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "edit" ? "Enregistrer la facture" : "Créer la facture"}
        </button>
      </div>
    </div>
  );
}

function Sum({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 ${strong ? "text-lg font-extrabold text-brand-dark" : "text-base font-bold text-foreground"}`}>{value}</p>
    </div>
  );
}
