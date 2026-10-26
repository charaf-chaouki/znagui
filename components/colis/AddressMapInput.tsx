"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, LocateFixed, Home } from "lucide-react";
import { MOROCCO_CENTER, geocode, reverseGeocode, type LatLng, type GeoResult } from "@/lib/geo";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const PIN = L.divIcon({
  className: "",
  html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#009206" stroke="white" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export function AddressMapInput({
  label,
  value,
  coords,
  onChange,
  placeholder,
  showLocate = false,
  clientAddress = null,
}: {
  label: string;
  value: string;
  coords: LatLng | null;
  onChange: (next: { address: string; coords: LatLng | null }) => void;
  placeholder?: string;
  /** Show a "locate my address" button that uses the browser geolocation. */
  showLocate?: boolean;
  /** When set, show an "use the client's saved address" button that fills + geocodes it. */
  clientAddress?: string | null;
}) {
  const { t, tv } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const objs = useRef<{ map?: any; marker?: any }>({});
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const addressRef = useRef(value);
  addressRef.current = value;
  const coordsRef = useRef(coords);
  coordsRef.current = coords;
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [fillingClient, setFillingClient] = useState(false);

  function placeMarker(map: any, c: LatLng) {
    if (objs.current.marker) {
      objs.current.marker.setLatLng([c.lat, c.lng]);
    } else {
      const m = L.marker([c.lat, c.lng], { draggable: true, icon: PIN }).addTo(map);
      m.on("dragend", async () => {
        const p = m.getLatLng();
        const nc = { lat: p.lat, lng: p.lng };
        const addr = await reverseGeocode(nc.lat, nc.lng);
        if (addr && inputRef.current) inputRef.current.value = addr;
        onChangeRef.current({ address: addr ?? addressRef.current, coords: nc });
      });
      objs.current.marker = m;
    }
  }

  useEffect(() => {
    if (!mapRef.current) return;
    const start = coordsRef.current ?? MOROCCO_CENTER;
    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [start.lat, start.lng],
      coordsRef.current ? 14 : 5,
    );
    // Esri World Street Map — free raster tiles, no API key
    // (OSM public tiles return 403 for apps; Carto now requires a key).
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri",
    }).addTo(map);
    map.on("click", async (e: any) => {
      const nc = { lat: e.latlng.lat, lng: e.latlng.lng };
      placeMarker(map, nc);
      const addr = await reverseGeocode(nc.lat, nc.lng);
      if (addr && inputRef.current) inputRef.current.value = addr;
      onChangeRef.current({ address: addr ?? addressRef.current, coords: nc });
    });
    if (coordsRef.current) placeMarker(map, coordsRef.current);
    objs.current.map = map;
    // Leaflet sometimes needs a nudge when its container animates in.
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      objs.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onType(v: string) {
    onChange({ address: v, coords: coordsRef.current });
    if (debounce.current) clearTimeout(debounce.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      setNoResults(false);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      const res = await geocode(v);
      setSuggestions(res);
      setNoResults(res.length === 0);
      setSearching(false);
    }, 400);
  }

  function pick(s: GeoResult) {
    const c = { lat: s.lat, lng: s.lng };
    if (objs.current.map) {
      objs.current.map.setView([c.lat, c.lng], 15);
      placeMarker(objs.current.map, c);
    }
    if (inputRef.current) inputRef.current.value = s.label;
    setSuggestions([]);
    setNoResults(false);
    onChange({ address: s.label, coords: c });
  }

  async function useClientAddress() {
    const addr = (clientAddress ?? "").trim();
    if (!addr) return;
    setFillingClient(true);
    setLocateError(null);
    setSuggestions([]);
    setNoResults(false);
    if (inputRef.current) inputRef.current.value = addr;
    try {
      const res = await geocode(addr);
      if (res.length > 0 && objs.current.map) {
        const c = { lat: res[0].lat, lng: res[0].lng };
        objs.current.map.setView([c.lat, c.lng], 15);
        placeMarker(objs.current.map, c);
        onChange({ address: addr, coords: c });
      } else {
        onChange({ address: addr, coords: coordsRef.current });
      }
    } finally {
      setFillingClient(false);
    }
  }

  function locateMe() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocateError(t("map.geoUnsupported"));
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (objs.current.map) {
          objs.current.map.setView([nc.lat, nc.lng], 15);
          placeMarker(objs.current.map, nc);
        }
        const addr = await reverseGeocode(nc.lat, nc.lng);
        if (addr && inputRef.current) inputRef.current.value = addr;
        onChange({ address: addr ?? addressRef.current, coords: nc });
        setLocating(false);
      },
      () => {
        setLocateError(t("map.geoDenied"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {(showLocate || (clientAddress && clientAddress.trim())) && (
          <div className="flex items-center gap-1.5">
            {clientAddress && clientAddress.trim() && (
              <button
                type="button"
                onClick={useClientAddress}
                disabled={fillingClient}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand disabled:opacity-60"
              >
                {fillingClient ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Home className="h-3.5 w-3.5" />}
                {t("map.useClientAddress")}
              </button>
            )}
            {showLocate && (
              <button
                type="button"
                onClick={locateMe}
                disabled={locating}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-brand hover:border-brand hover:text-brand-dark disabled:opacity-60"
              >
                {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                {locating ? t("map.locating") : t("map.locate")}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="relative z-[1000]">
        <MapPin className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          defaultValue={value}
          onChange={(e) => onType(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />}

        {suggestions.length > 0 && (
          <ul className="absolute z-[1001] mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="line-clamp-2 text-slate-700">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {suggestions.length === 0 && noResults && !searching && (
          <div className="absolute z-[1001] mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-muted shadow-lg">
            {t("map.noResults")}
          </div>
        )}
      </div>

      {locateError && <p className="mt-1 text-xs text-danger">{locateError}</p>}

      {/* Leaflet owns this container (cleaned up via map.remove()). No React children. */}
      <div ref={mapRef} className="isolate mt-2 h-44 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100" />

      <p className="mt-1 text-xs text-muted">
        {coords
          ? tv("map.hintCoords", { lat: coords.lat.toFixed(5), lng: coords.lng.toFixed(5) })
          : t("map.hintSearch")}
      </p>
    </div>
  );
}
