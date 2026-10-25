"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, PackageCheck, Inbox } from "lucide-react";
import { formatMAD } from "@/lib/colis-ui";
import type { AvailableColis } from "@/lib/types/ramassage";

export function RamassageBuilder({
  livreurs, colis,
}: {
  livreurs: { id: string; nom: string }[];
  colis: AvailableColis[];
}) {
  const router = useRouter();
  const [livreurId, setLivreurId] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allChecked = colis.length > 0 && colis.every((c) => checked.has(c.id));
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(colis.map((c) => c.id)));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agence/ramassages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livreurId, colisIds: [...checked] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Échec de l'enregistrement.");
        setSaving(false);
        return;
      }
      router.push(`/agence/ramassages/${data.id}`);
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
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Livreur ramasseur *</label>
        <select value={livreurId} onChange={(e) => setLivreurId(e.target.value)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
          <option value="">Sélectionner un livreur…</option>
          {livreurs.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <PackageCheck className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold text-foreground">Colis disponibles dans votre ville</h3>
          <span className="ml-auto text-xs text-muted">{colis.length} éligible{colis.length > 1 ? "s" : ""}</span>
        </div>
        {colis.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-muted">Aucun colis à ramasser pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                  <th className={`${th} w-10`}><input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 accent-[var(--brand,#009206)]" aria-label="Tout sélectionner" /></th>
                  <th className={th}>N° suivi</th>
                  <th className={th}>Client / Destination</th>
                  <th className={th}>Adresse retrait</th>
                  <th className={`${th} text-right`}>COD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colis.map((c) => {
                  const on = checked.has(c.id);
                  return (
                    <tr key={c.id} className={on ? "bg-brand-light/30" : "hover:bg-slate-50/60"}>
                      <td className={td}><input type="checkbox" checked={on} onChange={() => toggle(c.id)} className="h-4 w-4 accent-[var(--brand,#009206)]" aria-label={`Sélectionner ${c.trk}`} /></td>
                      <td className={`${td} font-semibold text-brand-dark`}>{c.trk}</td>
                      <td className={td}><span className="block font-medium text-foreground">{c.client}</span><span className="block text-xs text-muted">→ {c.destCity}</span></td>
                      <td className={`${td} text-muted`}>{c.pickupAddress}</td>
                      <td className={`${td} text-right`}>{formatMAD(c.cod)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {checked.size > 0 && (
        <div className="rounded-xl border border-brand/30 bg-brand-light/30 p-4 text-sm font-semibold text-brand-darker">
          {checked.size} colis sélectionné{checked.size > 1 ? "s" : ""}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annuler</button>
        <button type="button" onClick={save} disabled={saving || !livreurId || checked.size === 0} className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer le ramassage
        </button>
      </div>
    </div>
  );
}
