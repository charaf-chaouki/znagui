import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)

/** Generate a human-friendly tracking number, e.g. "TRK-A1B2C3D4". */
export function generateTrackingNumber(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `TRK-${code}`;
}

/** Opaque QR token for ramassage/réception scans. */
export function generateQrToken(): string {
  return randomBytes(16).toString("hex");
}
