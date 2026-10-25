// Keyless geo utilities for the maps feature (OpenStreetMap stack).
// - Geocoding / reverse: Nominatim (free, ~1 req/s, dev use)
// - Road distance: OSRM public server (free, no key)
// - Straight-line: haversine (local, instant)

export type LatLng = { lat: number; lng: number };
export const MOROCCO_CENTER: LatLng = { lat: 31.7917, lng: -7.0926 };

export type GeoResult = { label: string; lat: number; lng: number };

/**
 * Always returns a Google Maps URL. Prefers exact coordinates, then an existing
 * Google Maps share link, then a text search on the address.
 */
export function googleMapsUrl(opts: {
  lat?: number | null;
  lng?: number | null;
  link?: string | null;
  address?: string | null;
  city?: string | null;
}): string {
  if (opts.lat != null && opts.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.lat},${opts.lng}`;
  }
  if (opts.link && /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(opts.link)) {
    return opts.link;
  }
  const q = [opts.address, opts.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || "Maroc")}`;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// Build a readable label from Photon feature properties.
function photonLabel(p: any): string {
  const street = p.street ? (p.housenumber ? `${p.housenumber} ${p.street}` : p.street) : null;
  const parts = [p.name, street, p.district, p.suburb, p.city || p.county, p.state].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

/** Type-ahead address search over OSM (Photon). Biased to Morocco. */
export async function geocode(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 3) return [];
  try {
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}` +
      `&lang=fr&limit=6&lat=${MOROCCO_CENTER.lat}&lon=${MOROCCO_CENTER.lng}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: any[] };
    return (data.features ?? [])
      .filter((f) => {
        const cc = f.properties?.countrycode;
        return !cc || cc === "MA";
      })
      .map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        return { label: photonLabel(f.properties) || f.properties?.name || query, lat, lng };
      })
      .filter((r) => r.label);
  } catch {
    return [];
  }
}

/** Reverse geocode a point to a human address (Photon). */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=fr`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: any[] };
    const p = data.features?.[0]?.properties;
    return p ? photonLabel(p) || p.name || null : null;
  } catch {
    return null;
  }
}

/** Driving distance (km) via OSRM; null on failure → caller falls back to haversine. */
export async function roadDistanceKm(a: LatLng, b: LatLng): Promise<number | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = (await res.json()) as { routes?: { distance: number }[] };
    const m = d.routes?.[0]?.distance;
    return m != null ? m / 1000 : null;
  } catch {
    return null;
  }
}
