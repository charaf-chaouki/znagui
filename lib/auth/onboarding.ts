import type { AccountStatus } from "@prisma/client";

/** The client fields the onboarding gate inspects. */
export type OnboardingClient = {
  cni: string;
  banque: string | null;
  rib: string | null;
  cniRectoFile: string | null;
  cniVersoFile: string | null;
} | null | undefined;

/**
 * A client is considered onboarded once it has provided its CNI number and both
 * CNI photos. Bank details (banque + RIB) and the RIB file stay optional.
 */
export function isClientOnboarded(c: OnboardingClient): boolean {
  if (!c) return false;
  return Boolean(c.cni?.trim() && c.cniRectoFile && c.cniVersoFile);
}

/**
 * Where a CLIENT account must land given its status and onboarding state.
 * Returns the path to redirect to, or `null` when the client may use /client.
 *
 * Rules (per product spec):
 *  1. Onboarding incomplete  → /onboarding          (even if the account is ACTIVE)
 *  2. Onboarded but not ACTIVE → /onboarding/pending (awaiting admin validation)
 *  3. Onboarded and ACTIVE    → null                 (full access)
 */
export function clientGate(status: AccountStatus, client: OnboardingClient): string | null {
  if (!isClientOnboarded(client)) return "/onboarding";
  if (status !== "ACTIVE") return "/onboarding/pending";
  return null;
}
