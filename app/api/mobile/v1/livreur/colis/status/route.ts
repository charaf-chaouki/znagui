import { z } from "zod";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { setLivreurColisStatus, LivreurPortalError } from "@/lib/server/livreur-portal.service";
import type { LivreurActionStatut } from "@/lib/types/livreur-portal";

const schema = z.object({
  colisId: z.string().min(1),
  statut: z.string().min(1),
  note: z.string().optional().nullable(),
});

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Données invalides." }, { status: 400 });
  try {
    // Ownership + valid transition are enforced inside the service.
    await setLivreurColisStatus(
      account.livreur!.id,
      parsed.data.colisId,
      parsed.data.statut as LivreurActionStatut,
      parsed.data.note ?? null,
      account.id,
    );
    return mobileJson(req, { ok: true });
  } catch (e) {
    const err = e as LivreurPortalError;
    return mobileJson(req, { message: err.message || "Action impossible." }, { status: err.status ?? 500 });
  }
}
