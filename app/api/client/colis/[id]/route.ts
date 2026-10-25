import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { colisSchema } from "@/lib/server/validators/colis";
import { updateClientColis, ClientColisError } from "@/lib/server/client-portal.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CLIENT" || !user.client) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = colisSchema.safeParse({ ...(raw ?? {}), clientId: user.client.id });
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await updateClientColis(user.client.id, id, parsed.data);
    return NextResponse.json({ ok: true, id: res.id, trk: res.trackingNumber });
  } catch (e) {
    if (e instanceof ClientColisError) {
      return NextResponse.json({ message: e.message }, { status: e.status });
    }
    throw e;
  }
}
