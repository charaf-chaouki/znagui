import { mobileJson, corsPreflight } from "@/lib/api/cors";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Stateless JWT: the client just discards its token. Endpoint exists for symmetry
// and future token-revocation support.
export async function POST(req: Request) {
  return mobileJson(req, { ok: true });
}
