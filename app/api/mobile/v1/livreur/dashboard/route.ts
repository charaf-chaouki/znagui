import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getLivreurDashboard } from "@/lib/server/livreur-portal.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  return mobileJson(req, await getLivreurDashboard(account.livreur!.id));
}
