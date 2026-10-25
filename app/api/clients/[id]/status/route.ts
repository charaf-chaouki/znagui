import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { clientStatusSchema } from "@/lib/server/validators/client";
import { setClientStatus } from "@/lib/server/client.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = clientStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  try {
    await setClientStatus(id, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Client introuvable." }, { status: 404 });
  }
}
