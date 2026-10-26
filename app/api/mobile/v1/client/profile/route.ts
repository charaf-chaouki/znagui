import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getClientProfile } from "@/lib/server/client-portal.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const profile = await getClientProfile(account.client!.id);
  if (!profile) return mobileJson(req, { message: "Profil introuvable." }, { status: 404 });
  return mobileJson(req, profile);
}
