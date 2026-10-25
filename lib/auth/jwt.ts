import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

// Edge-safe: no next/headers, no Prisma runtime. Usable in middleware.
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-insecure-secret");
export const SESSION_COOKIE = "znagui_session";

export type SessionPayload = { sub: string; role: Role };

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { sub: String(payload.sub), role: payload.role as Role };
  } catch {
    return null;
  }
}

export function homeForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "AGENCE":
      return "/agence";
    case "LIVREUR":
      return "/livreur";
    default:
      return "/client";
  }
}
