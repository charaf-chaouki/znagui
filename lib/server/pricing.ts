import type { ColisType } from "@prisma/client";

// Grille tarifaire (SFD §4.1) — décidée. Les COMMISSIONS (D3–D6) sont ailleurs.
export const TARIFS_INTRA = [20, 25, 30, 35];
export const TARIFS_INTER = [35, 50, 60];

// Distance-based pricing for VOITURE / CAMION (MOTO keeps the preset grid above).
export const VEHICLE_PRICING: Record<"VOITURE" | "CAMION", { perKm: number; min: number }> = {
  VOITURE: { perKm: 6, min: 60 },
  CAMION: { perKm: 10, min: 150 },
};

/**
 * Auto tarif for a distance-priced vehicle. Returns the per-km price floored at
 * the vehicle minimum, or `null` for MOTO (which uses the preset grid instead).
 */
export function autoTarifForVehicle(vehicle: string, km: number | null | undefined): number | null {
  const p = VEHICLE_PRICING[vehicle as "VOITURE" | "CAMION"];
  if (!p) return null;
  const base = km != null && km > 0 ? Math.round(p.perKm * km) : 0;
  return Math.max(p.min, base);
}

/** Zone déduite des villes retrait/destination. */
export function determineColisType(pickupVilleId: string, destinationVilleId: string): ColisType {
  return pickupVilleId === destinationVilleId ? "INTRA" : "INTER";
}

export function tarifsForType(type: ColisType): number[] {
  return type === "INTRA" ? [...TARIFS_INTRA] : [...TARIFS_INTER];
}

export function isValidTarif(type: ColisType, tarif: number): boolean {
  return tarifsForType(type).includes(tarif);
}
