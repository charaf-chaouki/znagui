import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { listAvailableIntraColis } from "@/lib/server/livreur-portal.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Same-ville colis available for this livreur to take.
export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  return mobileJson(req, await listAvailableIntraColis(account.livreur!.id));
}
