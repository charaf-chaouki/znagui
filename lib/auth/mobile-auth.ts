import { prisma } from "@/lib/db";
import { signToken, verifyToken, type SessionPayload } from "@/lib/auth/jwt";
import { mobileJson } from "@/lib/api/cors";
import type { Role } from "@prisma/client";

/**
 * Bearer-token auth for the mobile API (`/api/mobile/v1/*`).
 * Same JWT (jose / JWT_SECRET) as the web cookie, but passed in the
 * `Authorization: Bearer <token>` header instead of an httpOnly cookie, because
 * the Capacitor app has a different origin and cannot share cookies.
 */

export async function issueMobileToken(sub: string, role: Role): Promise<string> {
  return signToken({ sub, role } satisfies SessionPayload);
}

const ACCOUNT_SELECT = {
  id: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  client: {
    select: {
      id: true,
      nom: true,
      telephone: true,
      cni: true,
      banque: true,
      rib: true,
      cniRectoFile: true,
      cniVersoFile: true,
      ribFile: true,
    },
  },
  livreur: { select: { id: true, nom: true, prenom: true, agenceId: true } },
} as const;

export type MobileAccount = NonNullable<Awaited<ReturnType<typeof getMobileAccount>>>;

function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() || null : null;
}

/** Authenticated mobile account (any status), or null. Endpoints enforce status/role/ownership. */
export async function getMobileAccount(req: Request) {
  const token = bearer(req);
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  const account = await prisma.account.findUnique({
    where: { id: session.sub },
    select: ACCOUNT_SELECT,
  });
  return account ?? null;
}

/**
 * Guard a mobile route: returns the authenticated account, or an `error`
 * response (401 no/invalid token, 403 wrong role). Ownership is still enforced
 * by each service (which scopes by the account's own client/livreur id).
 */
export async function requireMobile(req: Request, role?: "CLIENT" | "LIVREUR") {
  const account = await getMobileAccount(req);
  if (!account) {
    return { account: null, error: mobileJson(req, { message: "Session expirée." }, { status: 401 }) } as const;
  }
  if (role && account.role !== role) {
    return { account: null, error: mobileJson(req, { message: "Accès refusé." }, { status: 403 }) } as const;
  }
  return { account, error: null } as const;
}
