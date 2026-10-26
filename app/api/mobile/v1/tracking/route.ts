import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getColisTracking } from "@/lib/server/colis.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Parcel tracking by tracking number (available to any authenticated mobile user).
export async function GET(req: Request) {
  const { account, error } = await requireMobile(req);
  if (!account) return error;
  const trk = (new URL(req.url).searchParams.get("trk") ?? "").trim();
  if (!trk) return mobileJson(req, { message: "Numéro de suivi requis." }, { status: 400 });
  const info = await getColisTracking(trk);
  if (!info) return mobileJson(req, { message: "Colis introuvable." }, { status: 404 });
  return mobileJson(req, info);
}
