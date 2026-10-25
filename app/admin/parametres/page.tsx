import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getCompanySettings } from "@/lib/server/settings.service";

export const metadata = { title: "Paramètres" };
export const instant = false;

export default async function ParametresPage() {
  const company = await getCompanySettings();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        subtitle="Informations de la société — utilisées sur les factures, tickets et le site."
      />
      <SettingsForm initial={company} />
    </div>
  );
}
