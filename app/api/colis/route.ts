import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { colisSchema } from "@/lib/server/validators/colis";
import { createColis } from "@/lib/server/colis.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = colisSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  const res = await createColis(parsed.data, user.id);
  return NextResponse.json({ ok: true, id: res.id, trk: res.trackingNumber }, { status: 201 });
}
