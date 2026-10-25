import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateFactureClientSchema } from "@/lib/server/validators/facture-client";
import { updateFactureClient, FactureClientError } from "@/lib/server/facture-client.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = updateFactureClientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await updateFactureClient(id, parsed.data.colisIds);
    return NextResponse.json({ ok: true, id: res.id });
  } catch (e) {
    if (e instanceof FactureClientError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
