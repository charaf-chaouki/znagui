import { z } from "zod";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { takeIntraColis, LivreurPortalError } from "@/lib/server/livreur-portal.service";

const schema = z.object({ colisId: z.string().min(1) });

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Données invalides." }, { status: 400 });
  try {
    await takeIntraColis(account.livreur!.id, parsed.data.colisId, account.id);
    return mobileJson(req, { ok: true });
  } catch (e) {
    const err = e as LivreurPortalError;
    return mobileJson(req, { message: err.message || "Impossible de prendre ce colis." }, { status: err.status ?? 500 });
  }
}
