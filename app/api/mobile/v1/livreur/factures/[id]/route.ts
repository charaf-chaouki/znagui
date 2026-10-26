import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getLivreurFactureDetail } from "@/lib/server/facture-livreur.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const { id } = await params;
  const detail = await getLivreurFactureDetail(account.livreur!.id, id);
  if (!detail) return mobileJson(req, { message: "Facture introuvable." }, { status: 404 });
  return mobileJson(req, detail);
}
