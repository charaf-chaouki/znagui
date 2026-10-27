import "server-only";
import type { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMobileAccount } from "@/lib/auth/mobile-auth";

export type PdfUser = {
  role: Role;
  clientId: string | null;
  livreurId: string | null;
  agenceId: string | null;
};

/**
 * Resolve the PDF requester from the web session cookie OR a mobile bearer
 * token — so the same `/api/pdf/<kind>/<id>` endpoint serves the website and
 * the Capacitor app. Returns null when unauthenticated/inactive.
 */
export async function getPdfUser(req: Request): Promise<PdfUser | null> {
  const web = await getCurrentUser();
  if (web) {
    return {
      role: web.role,
      clientId: web.client?.id ?? null,
      livreurId: web.livreur?.id ?? null,
      agenceId: web.agence?.id ?? web.livreur?.agenceId ?? null,
    };
  }
  const mob = await getMobileAccount(req);
  if (mob && mob.status === "ACTIVE") {
    return {
      role: mob.role,
      clientId: mob.client?.id ?? null,
      livreurId: mob.livreur?.id ?? null,
      agenceId: mob.livreur?.agenceId ?? null,
    };
  }
  return null;
}
