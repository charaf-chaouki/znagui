import { getMobileAccount } from "@/lib/auth/mobile-auth";
import { clientGate } from "@/lib/auth/onboarding";
import { mobileJson, corsPreflight } from "@/lib/api/cors";

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const account = await getMobileAccount(req);
  if (!account) return mobileJson(req, { message: "Session expirée." }, { status: 401 });

  const gate = account.role === "CLIENT" ? clientGate(account.status, account.client) : null;
  return mobileJson(req, {
    id: account.id,
    role: account.role,
    status: account.status,
    name: account.role === "CLIENT"
      ? account.client?.nom
      : `${account.livreur?.prenom ?? ""} ${account.livreur?.nom ?? ""}`.trim(),
    email: account.email,
    phone: account.phone,
    clientId: account.client?.id ?? null,
    livreurId: account.livreur?.id ?? null,
    onboardingRoute: gate,
  });
}
