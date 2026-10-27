import { View, Text, Image } from "@react-pdf/renderer";
import { C, doc } from "@/lib/pdf/styles";
import type { CompanySettings } from "@/lib/types/settings";

/** Shared A4 document header: logo + company block on the left, document title /
 *  reference / date / status badge on the right. */
export function DocHeader({
  company,
  logoSrc,
  title,
  reference,
  date,
  statusLabel,
}: {
  company: CompanySettings;
  logoSrc: string | null;
  title: string;
  reference: string;
  date: string;
  statusLabel?: string | null;
}) {
  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";
  const titleSize = title.length > 10 ? 13 : 20;
  return (
    <View style={[doc.spaceBetween, { borderBottomWidth: 2, borderBottomColor: C.ink, paddingBottom: 14 }]}>
      <View style={[doc.row, { gap: 10, maxWidth: 330 }]}>
        {logoSrc ? <Image src={logoSrc} style={doc.logo} /> : null}
        <View>
          <Text style={doc.company}>{societe}</Text>
          {company.adresse ? (
            <Text style={doc.smallMuted}>{company.adresse}{company.ville ? `, ${company.ville}` : ""}</Text>
          ) : null}
          <Text style={doc.smallMuted}>
            {[company.telephone, company.email, company.siteWeb].filter(Boolean).join("  •  ")}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end", maxWidth: 190 }}>
        <Text style={[doc.docTitle, { fontSize: titleSize, textAlign: "right" }]}>{title}</Text>
        <Text style={doc.ref}>{reference}</Text>
        <Text style={doc.smallMuted}>Date : {date}</Text>
        {statusLabel ? <Text style={doc.badge}>{statusLabel}</Text> : null}
      </View>
    </View>
  );
}
