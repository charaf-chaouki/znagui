"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { COLIS_STATUT_LABEL } from "@/lib/colis-ui";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { colisStatutLabel } from "@/lib/i18n/labels";
import type { ColisStatut } from "@/lib/types/colis";

const STATUTS = Object.keys(COLIS_STATUT_LABEL) as ColisStatut[];
const VEHICLES = [
  { value: "MOTO", key: "veh.MOTO" },
  { value: "VOITURE", key: "veh.VOITURE" },
  { value: "CAMION", key: "veh.CAMION" },
] as const;

const FIELDS = ["statut", "depart", "destination", "dateFrom", "dateTo", "vehicle"] as const;
type Field = (typeof FIELDS)[number];

export function ColisFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const read = () =>
    Object.fromEntries(FIELDS.map((k) => [k, sp.get(k) ?? ""])) as Record<Field, string>;
  const [form, setForm] = useState<Record<Field, string>>(read());

  useEffect(() => setForm(read()), [sp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeCount = FIELDS.filter((k) => sp.get(k)).length;
  const set = (k: Field, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function apply() {
    const p = new URLSearchParams();
    FIELDS.forEach((k) => form[k] && p.set(k, form[k]));
    router.push(`/admin/colis${p.toString() ? `?${p}` : ""}`);
    setOpen(false);
  }
  function reset() {
    setForm(Object.fromEntries(FIELDS.map((k) => [k, ""])) as Record<Field, string>);
    router.push("/admin/colis");
    setOpen(false);
  }

  const sel = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  const lbl = "mb-1 block text-xs font-medium text-muted";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <SlidersHorizontal className="h-4 w-4" /> {t("common.filters")}
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-30 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">{t("filter.title.colis")}</h4>
            <button onClick={() => setOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className={lbl}>{t("common.status")}</label>
              <select value={form.statut} onChange={(e) => set("statut", e.target.value)} className={sel}>
                <option value="">{t("common.all")}</option>
                {STATUTS.map((s) => <option key={s} value={s}>{colisStatutLabel(locale, s)}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>{t("filter.villeDepart")}</label>
                <select value={form.depart} onChange={(e) => set("depart", e.target.value)} className={sel}>
                  <option value="">{t("common.allF")}</option>
                  {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>{t("filter.villeDest")}</label>
                <select value={form.destination} onChange={(e) => set("destination", e.target.value)} className={sel}>
                  <option value="">{t("common.allF")}</option>
                  {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>{t("filter.dateCreation")}</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={sel} />
                <input type="date" value={form.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={sel} />
              </div>
            </div>
            <div>
              <label className={lbl}>{t("col.vehicule")}</label>
              <select value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)} className={sel}>
                <option value="">{t("common.all")}</option>
                {VEHICLES.map((v) => <option key={v.value} value={v.value}>{t(v.key)}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={reset} className="text-sm font-medium text-muted hover:text-foreground">
              {t("common.reset")}
            </button>
            <button onClick={apply} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark">
              {t("common.apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
