import { z } from "zod";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { resolveLivreurScan } from "@/lib/server/livreur-portal.service";

const schema = z.object({ code: z.string().min(1) });

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Resolve a scanned tracking number / QR token to one of this livreur's colis.
export async function POST(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Code requis." }, { status: 400 });
  const hit = await resolveLivreurScan(account.livreur!.id, parsed.data.code.trim());
  if (!hit) return mobileJson(req, { message: "Colis introuvable pour ce livreur." }, { status: 404 });
  return mobileJson(req, hit);
}
