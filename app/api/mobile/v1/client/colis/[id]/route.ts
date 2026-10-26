import { prisma } from "@/lib/db";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { updateClientColis, ClientColisError } from "@/lib/server/client-portal.service";
import { getColisDetail } from "@/lib/server/colis.service";
import { colisSchema } from "@/lib/server/validators/colis";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const { id } = await params;
  // Ownership: the colis must belong to this client.
  const owned = await prisma.colis.findFirst({
    where: { id, clientId: account.client!.id },
    select: { trackingNumber: true },
  });
  if (!owned) return mobileJson(req, { message: "Colis introuvable." }, { status: 404 });
  const detail = await getColisDetail(owned.trackingNumber);
  if (!detail) return mobileJson(req, { message: "Colis introuvable." }, { status: 404 });
  return mobileJson(req, detail);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = colisSchema.safeParse({ ...(raw ?? {}), clientId: account.client!.id });
  if (!parsed.success) {
    return mobileJson(req, { message: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }
  try {
    await updateClientColis(account.client!.id, id, parsed.data);
    return mobileJson(req, { ok: true });
  } catch (e) {
    const err = e as ClientColisError;
    return mobileJson(req, { message: err.message || "Échec." }, { status: err.status ?? 500 });
  }
}
