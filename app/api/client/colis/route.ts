import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { colisSchema } from "@/lib/server/validators/colis";
import { createClientColis } from "@/lib/server/client-portal.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CLIENT" || !user.client) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const raw = await req.json().catch(() => null);
  // Force the colis onto the authenticated client — never trust a clientId from the body.
  const parsed = colisSchema.safeParse({ ...(raw ?? {}), clientId: user.client.id });
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  const res = await createClientColis(user.client.id, parsed.data, user.id);
  return NextResponse.json({ ok: true, id: res.id, trk: res.trackingNumber }, { status: 201 });
}
