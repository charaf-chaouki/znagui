import { NextResponse } from "next/server";

/**
 * CORS for the mobile API only. The Capacitor app's origin
 * (`capacitor://localhost` on Android, `http://localhost` / `https://localhost`)
 * must be allow-listed; the web app (same-origin) never hits these.
 */
const ALLOWED = (
  process.env.MOBILE_CORS_ORIGINS ??
  "capacitor://localhost,http://localhost,https://localhost,http://localhost:3100"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "false",
    Vary: "Origin",
  };
}

/** JSON response with CORS headers for the request's origin. */
export function mobileJson(req: Request, data: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(data, init);
  for (const [k, v] of Object.entries(corsHeaders(req.headers.get("origin")))) res.headers.set(k, v);
  return res;
}

/** Preflight (OPTIONS) response. */
export function corsPreflight(req: Request): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
