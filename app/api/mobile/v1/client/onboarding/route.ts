import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { clientGate } from "@/lib/auth/onboarding";

const schema = z.object({
  cni: z.string().min(3, "CNI requise"),
  banque: z.string().min(2, "Banque requise"),
  rib: z.string().min(4, "RIB requis"),
  cniRectoFile: z.string().min(1, "Photo CIN recto requise"),
  cniVersoFile: z.string().min(1, "Photo CIN verso requise"),
  ribFile: z.string().optional().nullable(),
});

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request) {
  const { account, error } = await requireMobile(req, "CLIENT");
  if (!account) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return mobileJson(req, { message: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }
  const { cni, banque, rib, cniRectoFile, cniVersoFile, ribFile } = parsed.data;
  await prisma.client.update({
    where: { id: account.client!.id },
    data: { cni, banque, rib, cniRectoFile, cniVersoFile, ribFile: ribFile || null },
  });
  // Account stays PENDING until an admin/agence validates it.
  const gate = clientGate(account.status, { cni, banque, rib, cniRectoFile, cniVersoFile });
  return mobileJson(req, { ok: true, onboardingRoute: gate });
}
