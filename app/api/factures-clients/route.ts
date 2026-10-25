import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createFactureClientSchema } from "@/lib/server/validators/facture-client";
import { createFactureClient, FactureClientError } from "@/lib/server/facture-client.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = createFactureClientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await createFactureClient(parsed.data.clientId, parsed.data.colisIds, user.id);
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (e) {
    if (e instanceof FactureClientError) return NextResponse.json({ message: e.message }, { status: e.status });
    console.error("createFactureClient failed:", e);
    return NextResponse.json({ message: "Erreur serveur lors de la création de la facture." }, { status: 500 });
  }
}
