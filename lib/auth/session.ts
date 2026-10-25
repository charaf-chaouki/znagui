import { cookies } from "next/headers";
import { signToken, verifyToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/jwt";

export { homeForRole, verifyToken, signToken, SESSION_COOKIE } from "@/lib/auth/jwt";
export type { SessionPayload } from "@/lib/auth/jwt";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signToken(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
