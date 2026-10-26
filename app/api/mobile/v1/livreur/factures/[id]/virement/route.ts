import { z } from "zod";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { submitVirement } from "@/lib/server/facture-livreur.service";

const schema = z.object({ pieceJointeUrl: z.string().min(1) });

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Pièce jointe requise." }, { status: 400 });
  try {
    // Scoped by livreurId → cannot declare a virement on another livreur's facture.
    await submitVirement(account.livreur!.id, id, parsed.data.pieceJointeUrl);
    return mobileJson(req, { ok: true });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    return mobileJson(req, { message: err.message || "Action impossible." }, { status: err.status ?? 500 });
  }
}
