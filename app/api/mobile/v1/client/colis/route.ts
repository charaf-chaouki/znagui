import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { listClientColis, createClientColis } from "@/lib/server/client-portal.service";
import { colisSchema } from "@/lib/server/validators/colis";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page")) || 1);
  return mobileJson(req, await listClientColis(account.client!.id, page));
}

export async function POST(req: Request) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const raw = await req.json().catch(() => null);
  // Force the colis onto the authenticated client — never trust a body clientId.
  const parsed = colisSchema.safeParse({ ...(raw ?? {}), clientId: account.client!.id });
  if (!parsed.success) {
    return mobileJson(req, { message: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }
  const res = await createClientColis(account.client!.id, parsed.data, account.id);
  return mobileJson(req, { ok: true, id: res.id, trk: res.trackingNumber }, { status: 201 });
}
