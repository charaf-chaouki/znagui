import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";

/** Returns a client's saved pickup address, to pre-fill the "expéditeur" address
 *  on the colis form. ADMIN/AGENCE may read any client; a CLIENT only their own. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Non autorisé." }, { status: 403 });

  const { id } = await params;

  const isStaff = user.role === "ADMIN" || user.role === "AGENCE";
  const isOwnClient = user.role === "CLIENT" && user.client?.id === id;
  if (!isStaff && !isOwnClient) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }

  const client = await prisma.client.findUnique({
    where: { id },
    select: { adresse: true, ville: { select: { nom: true } } },
  });
  if (!client) return NextResponse.json({ message: "Client introuvable." }, { status: 404 });

  return NextResponse.json({
    adresse: client.adresse ?? "",
    ville: client.ville?.nom ?? "",
  });
}
