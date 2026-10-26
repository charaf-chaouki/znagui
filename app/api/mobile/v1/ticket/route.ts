import { prisma } from "@/lib/db";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { getColisDetail } from "@/lib/server/colis.service";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Colis detail for the printable ticket. Ownership: the client who owns it, or a
// livreur assigned to its pickup/delivery.
export async function GET(req: Request) {
  const { account, error } = await requireMobile(req);
  if (!account) return error;
  const trk = (new URL(req.url).searchParams.get("trk") ?? "").trim();
  if (!trk) return mobileJson(req, { message: "Numéro de suivi requis." }, { status: 400 });

  const colis = await prisma.colis.findUnique({
    where: { trackingNumber: trk },
    select: { clientId: true, livreurRamassageId: true, livreurLivraisonId: true },
  });
  if (!colis) return mobileJson(req, { message: "Colis introuvable." }, { status: 404 });

  const owns =
    (account.role === "CLIENT" && colis.clientId === account.client?.id) ||
    (account.role === "LIVREUR" &&
      (colis.livreurRamassageId === account.livreur?.id || colis.livreurLivraisonId === account.livreur?.id));
  if (!owns) return mobileJson(req, { message: "Accès refusé." }, { status: 403 });

  const detail = await getColisDetail(trk);
  if (!detail) return mobileJson(req, { message: "Colis introuvable." }, { status: 404 });
  return mobileJson(req, detail);
}
