import { prisma } from "@/lib/db";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// The authenticated client's own saved pickup address (used to prefill the colis form).
export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const client = await prisma.client.findUnique({
    where: { id: account.client!.id },
    select: { adresse: true, ville: { select: { nom: true } } },
  });
  return mobileJson(req, { adresse: client?.adresse ?? "", ville: client?.ville?.nom ?? "" });
}
