import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getClientDashboard } from "@/lib/server/client-portal.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  return mobileJson(req, await getClientDashboard(account.client!.id));
}
