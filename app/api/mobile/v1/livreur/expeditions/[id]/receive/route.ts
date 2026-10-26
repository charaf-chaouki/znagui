import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { validateDispatchReception } from "@/lib/server/expedition-livreur.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const { id } = await params;
  try {
    await validateDispatchReception(account.livreur!.id, id, account.id);
    return mobileJson(req, { ok: true });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    return mobileJson(req, { message: err.message || "Action impossible." }, { status: err.status ?? 500 });
  }
}
