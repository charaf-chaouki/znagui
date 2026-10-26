import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { listLivreurFactures } from "@/lib/server/facture-livreur.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  return mobileJson(req, await listLivreurFactures(account.livreur!.id));
}
