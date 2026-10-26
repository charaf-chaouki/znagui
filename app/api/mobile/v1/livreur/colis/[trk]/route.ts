import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getLivreurColisDetail } from "@/lib/server/livreur-portal.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request, { params }: { params: Promise<{ trk: string }> }) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const { trk } = await params;
  // Scoped to the livreur → null means not one of their colis.
  const res = await getLivreurColisDetail(account.livreur!.id, decodeURIComponent(trk));
  if (!res) return mobileJson(req, { message: "Colis introuvable." }, { status: 404 });
  return mobileJson(req, res);
}
