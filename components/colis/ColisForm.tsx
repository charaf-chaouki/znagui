"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2, User, MapPin, Package, Check, ArrowLeft, ArrowRight, Route, AlertCircle } from "lucide-react";
import { MOROCCAN_CITIES, VEHICLE_OPTIONS } from "@/lib/constants";
import { TARIFS_INTRA, TARIFS_INTER, VEHICLE_PRICING, autoTarifForVehicle } from "@/lib/server/pricing";
import { haversineKm, roadDistanceKm, type LatLng } from "@/lib/geo";
import { formatMAD } from "@/lib/colis-ui";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

// Leaflet touches `window` at module load, so keep the map client-only (no SSR).
const AddressMapInput = dynamic(
  () => import("@/components/colis/AddressMapInput").then((m) => m.AddressMapInput),
  { ssr: false },
);

export type ColisFormInitial = {
  clientId?: string;
  clientName?: string;
  pickupCity?: string;
  pickupAddress?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  recipient?: string;
  recipientPhone?: string;
  destCity?: string;
  destAddress?: string;
  destLat?: number | null;
  destLng?: number | null;
  mapLink?: string;
  vehicle?: "MOTO" | "VOITURE" | "CAMION";
  parcelCount?: number;
  contents?: string;
  cod?: number;
  tarif?: number;
  notes?: string;
};

const STEPS: { labelKey: MessageKey; icon: typeof User }[] = [
  { labelKey: "form.steps.clientTrajet", icon: User },
  { labelKey: "form.steps.adresses", icon: MapPin },
  { labelKey: "form.steps.colisTarif", icon: Package },
  { labelKey: "form.steps.confirmation", icon: Check },
];

const VEH_KEY: Record<string, MessageKey> = { MOTO: "veh.MOTO", VOITURE: "veh.VOITURE", CAMION: "veh.CAMION" };

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const label = "mb-1.5 block text-sm font-medium text-foreground";

export function ColisForm({
  clients,
  initial,
  mode = "create",
  colisId,
  redirectTo = "/admin/colis",
  lockClient = false,
  apiBase = "/api/colis",
  createRedirect,
  detailPathBase = "/admin/colis",
  allowManualTarif = false,
  depotMode = false,
  fixedPickup,
  allowNewClient = false,
}: {
  clients: { id: string; nom: string }[];
  initial?: ColisFormInitial;
  mode?: "create" | "edit";
  colisId?: string;
  redirectTo?: string;
  /** Hide the client selector and use initial.clientId (e.g. the client portal). */
  lockClient?: boolean;
  /** API path base: "/api/colis" (admin) or "/api/client/colis" (client). */
  apiBase?: string;
  /** Where to go after a successful create. Defaults to the created colis detail page. */
  createRedirect?: string;
  /** Base path for the created colis detail (used when createRedirect is not set). */
  detailPathBase?: string;
  /** Admin/agence may override the auto (distance-based) tarif with a manual value. */
  allowManualTarif?: boolean;
  /** Agence counter drop-off: pickup is the agence (no pickup map), status is set server-side. */
  depotMode?: boolean;
  /** Fixed pickup (the agence) used in depot mode. */
  fixedPickup?: { city: string; address: string };
  /** Allow creating a new "comptoir" client inline (agence drop-off). */
  allowNewClient?: boolean;
}) {
  const router = useRouter();
  const { t, tv } = useI18n();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState<ColisFormInitial>({
    vehicle: "MOTO",
    parcelCount: 1,
    ...(depotMode && fixedPickup ? { pickupCity: fixedPickup.city, pickupAddress: fixedPickup.address } : {}),
    ...initial,
  });
  // Agence "nouveau client comptoir" mode.
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClient, setNewClient] = useState({ nom: "", telephone: "" });
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(
    initial?.pickupLat != null && initial?.pickupLng != null ? { lat: initial.pickupLat, lng: initial.pickupLng } : null,
  );
  const [destCoords, setDestCoords] = useState<LatLng | null>(
    initial?.destLat != null && initial?.destLng != null ? { lat: initial.destLat, lng: initial.destLng } : null,
  );

  const set = <K extends keyof ColisFormInitial>(k: K, v: ColisFormInitial[K]) => setF((p) => ({ ...p, [k]: v }));

  // VOITURE / CAMION are priced automatically from the distance. Admin/agence may
  // override with a manual tarif; in edit mode we keep the stored price by default.
  const [manualTarif, setManualTarif] = useState(
    allowManualTarif && mode === "edit" && (initial?.vehicle === "VOITURE" || initial?.vehicle === "CAMION"),
  );

  const zone = useMemo(
    () => (f.pickupCity && f.destCity ? (f.pickupCity === f.destCity ? "INTRA" : "INTER") : null),
    [f.pickupCity, f.destCity],
  );
  const tarifs = zone === "INTRA" ? TARIFS_INTRA : zone === "INTER" ? TARIFS_INTER : [];
  const clientName = newClientMode
    ? (newClient.nom || t("form.clientComptoir"))
    : (f.clientName ?? clients.find((c) => c.id === f.clientId)?.nom);

  const [distance, setDistance] = useState<{ km: number; road: boolean } | null>(null);
  useEffect(() => {
    if (!pickupCoords || !destCoords) {
      setDistance(null);
      return;
    }
    setDistance({ km: Math.round(haversineKm(pickupCoords, destCoords)), road: false });
    let active = true;
    roadDistanceKm(pickupCoords, destCoords).then((km) => {
      if (active && km != null) setDistance({ km: Math.round(km), road: true });
    });
    return () => {
      active = false;
    };
  }, [pickupCoords, destCoords]);

  // Distance-based auto tarif (null for MOTO, which keeps the preset grid).
  const autoTarif = useMemo(
    () => autoTarifForVehicle(f.vehicle ?? "MOTO", distance?.km ?? null),
    [f.vehicle, distance],
  );
  const isAutoVehicle = autoTarif !== null;
  useEffect(() => {
    if (isAutoVehicle && !manualTarif && autoTarif !== f.tarif) {
      set("tarif", autoTarif);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTarif, manualTarif, isAutoVehicle]);

  // Selected client's saved address, offered as a one-tap fill on the pickup field.
  const [clientAddress, setClientAddress] = useState("");
  useEffect(() => {
    const id = f.clientId;
    if (!id) {
      setClientAddress("");
      return;
    }
    let active = true;
    fetch(`/api/clients/${id}/address`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d) return;
        setClientAddress([d.adresse, d.ville].filter(Boolean).join(", "));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [f.clientId]);

  const clientLocked = mode === "edit" || lockClient;

  const newClientValid = newClient.nom.trim().length >= 2 && newClient.telephone.trim().length >= 6;
  const clientOk = clientLocked || (newClientMode ? newClientValid : !!f.clientId);

  const canNext = (s: number): boolean => {
    if (s === 0) return !!(f.pickupCity && f.destCity && clientOk);
    if (s === 1) return !!(f.pickupAddress && f.recipient && f.recipientPhone && f.destAddress);
    if (s === 2) return !!(f.contents && f.tarif);
    return true;
  };

  async function submit() {
    setSaving(true);
    setError(null);
    const payload = {
      clientId: newClientMode ? undefined : f.clientId,
      newClient: newClientMode ? { nom: newClient.nom.trim(), telephone: newClient.telephone.trim() } : undefined,
      pickupCity: f.pickupCity,
      pickupAddress: f.pickupAddress,
      pickupLat: pickupCoords?.lat ?? null,
      pickupLng: pickupCoords?.lng ?? null,
      recipient: f.recipient,
      recipientPhone: f.recipientPhone,
      destCity: f.destCity,
      destAddress: f.destAddress,
      destLat: destCoords?.lat ?? null,
      destLng: destCoords?.lng ?? null,
      destMapLink: f.mapLink || null,
      vehicle: f.vehicle,
      parcelCount: f.parcelCount,
      contents: f.contents,
      cod: f.cod ?? 0,
      tarif: f.tarif,
      notes: f.notes || null,
    };
    try {
      const res = await fetch(mode === "edit" ? `${apiBase}/${colisId}` : apiBase, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("form.saveFailed"));
        setSaving(false);
        return;
      }
      router.push(mode === "edit" ? redirectTo : (createRedirect ?? `${detailPathBase}/${data.trk}`));
    } catch {
      setError(t("action.connError"));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.labelKey} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-brand text-white" : active ? "bg-brand-light text-brand-dark ring-2 ring-brand" : "bg-slate-100 text-slate-400"}`}>
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`hidden text-sm font-medium sm:block ${active ? "text-foreground" : "text-muted"}`}>{t(s.labelKey)}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`mx-3 h-0.5 flex-1 rounded ${done ? "bg-brand" : "bg-slate-200"}`} />}
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {step === 0 && (
          <div className="space-y-5">
            {clientLocked ? (
              <div>
                <span className={label}>{t("form.client")}</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium">{clientName ?? "—"}</div>
              </div>
            ) : (
              <div>
                <label className={label}>{t("form.clientReq")}</label>
                {allowNewClient && (
                  <div className="mb-2 inline-flex rounded-lg border border-slate-200 p-0.5 text-sm">
                    <button type="button" onClick={() => setNewClientMode(false)}
                      className={`rounded-md px-3 py-1.5 font-semibold transition ${!newClientMode ? "bg-brand text-brand-contrast" : "text-slate-600"}`}>
                      {t("form.clientExistant")}
                    </button>
                    <button type="button" onClick={() => setNewClientMode(true)}
                      className={`rounded-md px-3 py-1.5 font-semibold transition ${newClientMode ? "bg-brand text-brand-contrast" : "text-slate-600"}`}>
                      {t("form.clientComptoir")}
                    </button>
                  </div>
                )}
                {newClientMode ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input value={newClient.nom} onChange={(e) => setNewClient((c) => ({ ...c, nom: e.target.value }))}
                      placeholder={t("form.nomComplet")} className={input} />
                    <input value={newClient.telephone} onChange={(e) => setNewClient((c) => ({ ...c, telephone: e.target.value }))}
                      placeholder="06XXXXXXXX" className={input} />
                  </div>
                ) : (
                  <select required value={f.clientId ?? ""} onChange={(e) => set("clientId", e.target.value)} className={input}>
                    <option value="" disabled>{t("form.selectClient")}</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                )}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>{t("form.villeDepart")}</label>
                {depotMode ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium">{f.pickupCity || fixedPickup?.city}</div>
                ) : (
                  <select value={f.pickupCity ?? ""} onChange={(e) => set("pickupCity", e.target.value)} className={input}>
                    <option value="" disabled>{t("form.ville")}</option>
                    {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className={label}>{t("form.villeDest")}</label>
                <select value={f.destCity ?? ""} onChange={(e) => set("destCity", e.target.value)} className={input}>
                  <option value="" disabled>{t("form.ville")}</option>
                  {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            {zone && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-brand-darker">
                {t("form.zone")} {zone === "INTRA" ? t("type.intra") : t("type.interVilles")}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {depotMode ? (
              <div>
                <label className={label}>{t("form.adresseRetrait")}</label>
                <div className="flex items-start gap-2 rounded-lg border border-brand/30 bg-brand-light/40 px-3 py-2.5 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="font-medium text-foreground">{t("form.depotRetrait")}{f.pickupAddress ? ` — ${f.pickupAddress}` : ""}</span>
                </div>
              </div>
            ) : (
              <AddressMapInput
                label={t("form.adresseRetrait")}
                value={f.pickupAddress ?? ""}
                coords={pickupCoords}
                placeholder={t("form.searchRetrait")}
                showLocate
                clientAddress={clientAddress}
                onChange={({ address, coords }) => { set("pickupAddress", address); setPickupCoords(coords); }}
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>{t("form.destNom")}</label>
                <input value={f.recipient ?? ""} onChange={(e) => set("recipient", e.target.value)} placeholder={t("form.nomComplet")} className={input} />
              </div>
              <div>
                <label className={label}>{t("form.destTel")}</label>
                <input value={f.recipientPhone ?? ""} onChange={(e) => set("recipientPhone", e.target.value)} placeholder="06XXXXXXXX" className={input} />
              </div>
            </div>
            <AddressMapInput
              label={t("form.adresseLivraison")}
              value={f.destAddress ?? ""}
              coords={destCoords}
              placeholder={t("form.searchLivraison")}
              onChange={({ address, coords }) => { set("destAddress", address); setDestCoords(coords); }}
            />
            {distance && (
              <div className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand-light/50 px-4 py-3">
                <Route className="h-5 w-5 text-brand-dark" />
                <div>
                  <p className="text-sm font-semibold text-brand-darker">{t("form.distance")} {distance.km} km</p>
                  <p className="text-xs text-muted">{distance.road ? t("form.distanceRoute") : t("form.distanceVol")}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={label}>{t("form.vehicule")}</label>
                <select value={f.vehicle} onChange={(e) => set("vehicle", e.target.value as ColisFormInitial["vehicle"])} className={input}>
                  {VEHICLE_OPTIONS.map((v) => <option key={v.value} value={v.value}>{t(VEH_KEY[v.value] ?? "veh.MOTO")}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>{t("form.nbColis")}</label>
                <input type="number" min={1} value={f.parcelCount ?? 1} onChange={(e) => set("parcelCount", Number(e.target.value))} className={input} />
              </div>
              <div>
                <label className={label}>{t("form.prixCollecter")}</label>
                <input type="number" min={0} value={f.cod ?? ""} onChange={(e) => set("cod", Number(e.target.value))} placeholder="0" className={input} />
              </div>
            </div>
            <div>
              <label className={label}>{t("form.contenu")}</label>
              <input value={f.contents ?? ""} onChange={(e) => set("contents", e.target.value)} placeholder={t("form.contenuPlaceholder")} className={input} />
            </div>
            {isAutoVehicle ? (
              <div>
                <label className={label}>{t("form.tarifLivraison")}</label>
                <div className="rounded-lg border border-brand/30 bg-brand-light/40 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-dark">{t("form.tarifAuto")}</p>
                      <p className="text-2xl font-extrabold text-brand-dark">{formatMAD(f.tarif ?? autoTarif ?? 0)}</p>
                    </div>
                    <Route className="h-6 w-6 shrink-0 text-brand" />
                  </div>
                  {f.vehicle && VEHICLE_PRICING[f.vehicle as "VOITURE" | "CAMION"] && (
                    <p className="mt-1 text-xs text-muted">
                      {tv("form.tarifFormula", {
                        rate: VEHICLE_PRICING[f.vehicle as "VOITURE" | "CAMION"].perKm,
                        min: VEHICLE_PRICING[f.vehicle as "VOITURE" | "CAMION"].min,
                      })}
                      {distance ? ` · ${tv("form.tarifDistanceKm", { km: distance.km })}` : ""}
                    </p>
                  )}
                  {!distance && <p className="mt-1 text-xs text-amber-600">{t("form.tarifNoDistance")}</p>}
                </div>

                {allowManualTarif && (
                  <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={manualTarif} onChange={(e) => setManualTarif(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-[var(--brand)]" />
                    {t("form.tarifManuel")}
                  </label>
                )}
                {allowManualTarif && manualTarif && (
                  <input type="number" min={0} value={f.tarif ?? ""} onChange={(e) => set("tarif", Number(e.target.value))}
                    placeholder="0" className={`${input} mt-2`} />
                )}
              </div>
            ) : (
              <div>
                <label className={label}>
                  {t("form.tarifLivraison")} {zone && <span className="text-xs font-normal text-muted">({zone === "INTRA" ? t("form.sameVille") : t("form.interVilles")})</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {tarifs.map((tr) => (
                    <button key={tr} type="button" onClick={() => set("tarif", tr)}
                      className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${f.tarif === tr ? "border-brand bg-brand text-brand-contrast" : "border-slate-200 bg-white text-slate-700 hover:border-brand"}`}>
                      {tr} DH
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className={label}>{t("form.noteLivreur")}</label>
              <textarea value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder={t("form.notePlaceholder")} className={input} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t("form.recap")}</h3>
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Recap label={t("form.client")} value={clientName} />
              <Recap label={t("col.zone")} value={zone === "INTRA" ? t("type.intra") : t("type.interVilles")} />
              <Recap label={t("form.retrait")} value={`${f.pickupAddress ?? "—"}, ${f.pickupCity ?? ""}`} />
              <Recap label={t("form.livraison")} value={`${f.destAddress ?? "—"}, ${f.destCity ?? ""}`} />
              <Recap label={t("form.destinataire")} value={`${f.recipient ?? "—"} · ${f.recipientPhone ?? ""}`} />
              {distance && <Recap label={t("form.distanceLabel")} value={`${distance.km} km${distance.road ? ` (${t("form.route")})` : ""}`} />}
              <Recap label={t("form.contenu2")} value={f.contents} />
              <Recap label={t("form.vehColis")} value={`${f.vehicle ? t(VEH_KEY[f.vehicle] ?? "veh.MOTO") : "—"} · ${f.parcelCount}`} />
              <Recap label={t("col.tarif")} value={f.tarif ? formatMAD(f.tarif) : "—"} />
              <Recap label={t("form.aCollecter")} value={formatMAD(f.cod ?? 0)} />
            </div>
            {f.notes && <Recap label={t("form.note")} value={f.notes} />}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> {step === 0 ? t("common.cancel") : t("form.precedent")}
        </button>

        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!canNext(step)} onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-50">
            {t("form.suivant")} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" disabled={saving} onClick={submit}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-70">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "edit" ? t("common.save") : t("form.creerColis")}
          </button>
        )}
      </div>
    </div>
  );
}

function Recap({ label: l, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{l}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}
