import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

/** Current authenticated account (with profile), or null. For route handlers / server components. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const account = await prisma.account.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      client: { select: { id: true, nom: true } },
      livreur: { select: { id: true, nom: true, prenom: true, agenceId: true } },
      agence: { select: { id: true, nom: true, villeId: true } },
    },
  });

  if (!account || account.status !== "ACTIVE") return null;
  return account;
}

/**
 * Current authenticated account regardless of status (PENDING included), with the
 * client onboarding fields. Used by the onboarding flow and the client gate, where
 * a not-yet-active client still needs to be identified. Returns null only when there
 * is no valid session or the account no longer exists.
 */
export async function getAuthAccount() {
  const session = await getSession();
  if (!session) return null;

  return prisma.account.findUnique({
    where: { id: session.sub },
    select: {
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
    },
  });
}
