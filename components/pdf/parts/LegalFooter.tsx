import { Text } from "@react-pdf/renderer";
import { doc } from "@/lib/pdf/styles";
import type { CompanySettings } from "@/lib/types/settings";

/** Fixed legal footer (ICE / RC / IF / Patente / CNSS) at the bottom of every page. */
export function LegalFooter({ company }: { company: CompanySettings }) {
  const legal = [
    company.ice && `ICE : ${company.ice}`,
    company.rc && `RC : ${company.rc}`,
    company.if && `IF : ${company.if}`,
    company.patente && `Patente : ${company.patente}`,
    company.cnss && `CNSS : ${company.cnss}`,
  ].filter(Boolean).join("   •   ");
  if (!legal) return null;
  return (
    <Text style={doc.footer} fixed>
      {legal}
    </Text>
  );
}
