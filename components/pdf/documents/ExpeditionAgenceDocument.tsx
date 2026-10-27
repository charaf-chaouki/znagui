import { Document, Page, View, Text } from "@react-pdf/renderer";
import { doc } from "@/lib/pdf/styles";
import { EXPEDITION_STATUT_LABEL } from "@/lib/expedition-ui";
import { DocHeader } from "@/components/pdf/parts/DocHeader";
import { LegalFooter } from "@/components/pdf/parts/LegalFooter";
import { Signatures } from "@/components/pdf/parts/Signatures";
import type { ExpeditionDetail } from "@/lib/types/expedition";
import type { CompanySettings } from "@/lib/types/settings";

const COL = { idx: 0.4, trk: 1.4, dest: 2, ville: 1.4 };

export function ExpeditionAgenceDocument({
  expedition: e,
  company,
  logoSrc,
}: {
  expedition: ExpeditionDetail;
  company: CompanySettings;
  logoSrc: string | null;
}) {
  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";
  return (
    <Document title={`Bordereau expédition ${e.reference}`} author={societe}>
      <Page size="A4" style={doc.page}>
        <DocHeader company={company} logoSrc={logoSrc} title="BORDEREAU D'EXPÉDITION" reference={e.reference} date={e.date} statusLabel={EXPEDITION_STATUT_LABEL[e.statut]} />

        <View style={[doc.spaceBetween, { marginTop: 16 }]}>
          <View>
            <Text style={doc.eyebrow}>Agence source</Text>
            <Text style={[doc.bold, { marginTop: 2, fontSize: 10 }]}>{e.agenceSource}</Text>
            <Text style={doc.smallMuted}>{e.agenceSourceVille}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={doc.eyebrow}>Agence destination</Text>
            <Text style={[doc.bold, { marginTop: 2, fontSize: 10 }]}>{e.agenceDest}</Text>
            <Text style={doc.smallMuted}>{e.agenceDestVille}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={doc.th}>
            <Text style={[doc.thCell, { flex: COL.idx }]}>#</Text>
            <Text style={[doc.thCell, { flex: COL.trk }]}>N° suivi</Text>
            <Text style={[doc.thCell, { flex: COL.dest }]}>Destinataire</Text>
            <Text style={[doc.thCell, { flex: COL.ville }]}>Ville</Text>
          </View>
          {e.lignes.map((l, i) => (
            <View key={l.colisId} style={doc.tr} wrap={false}>
              <Text style={[doc.td, { flex: COL.idx, color: "#94a3b8" }]}>{i + 1}</Text>
              <Text style={[doc.td, doc.bold, { flex: COL.trk }]}>{l.trk}</Text>
              <Text style={[doc.td, { flex: COL.dest }]}>{l.recipient}</Text>
              <Text style={[doc.td, { flex: COL.ville }]}>{l.destCity}</Text>
            </View>
          ))}
        </View>

        <Text style={[doc.bold, doc.right, { marginTop: 10 }]}>Total colis : {e.total}</Text>

        <Signatures left="Signature agence source" right="Signature agence destination" />
        <LegalFooter company={company} />
      </Page>
    </Document>
  );
}
