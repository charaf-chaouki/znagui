import { Document, Page, View, Text } from "@react-pdf/renderer";
import { doc } from "@/lib/pdf/styles";
import { formatMAD } from "@/lib/colis-ui";
import { EXP_LIV_STATUT_LABEL } from "@/lib/expedition-livreur-ui";
import { DocHeader } from "@/components/pdf/parts/DocHeader";
import { LegalFooter } from "@/components/pdf/parts/LegalFooter";
import { Signatures } from "@/components/pdf/parts/Signatures";
import type { ExpeditionLivreurDetail } from "@/lib/types/expedition-livreur";
import type { CompanySettings } from "@/lib/types/settings";

const COL = { idx: 0.4, trk: 1.3, dest: 1.6, addr: 2.3, cod: 1 };

export function ExpeditionLivreurDocument({
  dispatch: e,
  company,
  logoSrc,
}: {
  dispatch: ExpeditionLivreurDetail;
  company: CompanySettings;
  logoSrc: string | null;
}) {
  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";
  const codTotal = e.lignes.reduce((s, l) => s + l.cod, 0);
  return (
    <Document title={`Bordereau dispatch ${e.reference}`} author={societe}>
      <Page size="A4" style={doc.page}>
        <DocHeader company={company} logoSrc={logoSrc} title="BORDEREAU DE DISPATCH" reference={e.reference} date={e.date} statusLabel={EXP_LIV_STATUT_LABEL[e.statut]} />

        <View style={[doc.spaceBetween, { marginTop: 16 }]}>
          <View>
            <Text style={doc.eyebrow}>Agence</Text>
            <Text style={[doc.bold, { marginTop: 2, fontSize: 10 }]}>{e.agence}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={doc.eyebrow}>Livreur</Text>
            <Text style={[doc.bold, { marginTop: 2, fontSize: 10 }]}>{e.livreur}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={doc.th}>
            <Text style={[doc.thCell, { flex: COL.idx }]}>#</Text>
            <Text style={[doc.thCell, { flex: COL.trk }]}>N° suivi</Text>
            <Text style={[doc.thCell, { flex: COL.dest }]}>Destinataire</Text>
            <Text style={[doc.thCell, { flex: COL.addr }]}>Adresse</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.cod }]}>COD</Text>
          </View>
          {e.lignes.map((l, i) => (
            <View key={l.colisId} style={doc.tr} wrap={false}>
              <Text style={[doc.td, { flex: COL.idx, color: "#94a3b8" }]}>{i + 1}</Text>
              <Text style={[doc.td, doc.bold, { flex: COL.trk }]}>{l.trk}</Text>
              <Text style={[doc.td, { flex: COL.dest }]}>{l.recipient}</Text>
              <Text style={[doc.td, { flex: COL.addr }]}>{l.destAddress}, {l.destCity}</Text>
              <Text style={[doc.td, doc.right, { flex: COL.cod }]}>{formatMAD(l.cod)}</Text>
            </View>
          ))}
        </View>

        <Text style={[doc.bold, doc.right, { marginTop: 10 }]}>Total colis : {e.total}   •   COD : {formatMAD(codTotal)}</Text>

        <Signatures left="Signature agence" right="Signature livreur (reçu les colis)" />
        <LegalFooter company={company} />
      </Page>
    </Document>
  );
}
