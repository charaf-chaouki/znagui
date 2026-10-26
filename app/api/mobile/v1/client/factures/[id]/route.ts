import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getClientFactureDetail } from "@/lib/server/facture-client.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const { id } = await params;
  // Scoped to the authenticated client → null means not theirs.
  const facture = await getClientFactureDetail(account.client!.id, id);
  if (!facture) return mobileJson(req, { message: "Facture introuvable." }, { status: 404 });
  return mobileJson(req, facture);
}
