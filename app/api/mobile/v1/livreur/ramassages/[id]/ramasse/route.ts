import { z } from "zod";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { ramasseColis } from "@/lib/server/ramassage.service";

const schema = z.object({ colisId: z.string().min(1) });

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Données invalides." }, { status: 400 });
  try {
    // Service scopes by livreurId → not-owned ramassages are rejected.
    await ramasseColis(account.livreur!.id, id, parsed.data.colisId, account.id);
    return mobileJson(req, { ok: true });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    return mobileJson(req, { message: err.message || "Action impossible." }, { status: err.status ?? 500 });
  }
}
