import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { renderPagePdf } from "@/lib/server/pdf";

// Only internal A4 print pages may be rendered (prevents SSRF to arbitrary paths).
const ALLOWED =
  /^\/(admin|agence|client)\/(factures-(clients|agences|livreurs)|expeditions|expeditions-livreur)\/[A-Za-z0-9-]+\/pdf$/;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE", "CLIENT"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }

  const { searchParams, origin } = new URL(req.url);
  const p = searchParams.get("p") ?? "";
  if (!ALLOWED.test(p)) {
    return NextResponse.json({ message: "Chemin non autorisé." }, { status: 400 });
  }

  const cookie = req.headers.get("cookie") ?? "";
  const name = `${p.split("/").filter(Boolean).slice(-3, -1).join("-") || "document"}.pdf`;

  try {
    const pdf = await renderPagePdf(`${origin}${p}`, cookie);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Échec de génération du PDF." }, { status: 500 });
  }
}
