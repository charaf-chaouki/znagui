import { Document, Page, View, Text } from "@react-pdf/renderer";
import { doc } from "@/lib/pdf/styles";
import { formatMAD } from "@/lib/colis-ui";
import { FACTURE_LIVREUR_STATUT_LABEL } from "@/lib/facture-ui";
import { DocHeader } from "@/components/pdf/parts/DocHeader";
import { LegalFooter } from "@/components/pdf/parts/LegalFooter";
import { Signatures } from "@/components/pdf/parts/Signatures";
import type { FactureLivreurDetail } from "@/lib/types/facture-livreur";
import type { CompanySettings } from "@/lib/types/settings";

const COL = { trk: 1.1, trajet: 1.9, role: 1.5, cod: 1, tarif: 1, comm: 1.1 };

export function FactureLivreurDocument({
  facture: f,
  company,
  logoSrc,
}: {
  facture: FactureLivreurDetail;
  company: CompanySettings;
  logoSrc: string | null;
}) {
  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";
  const status = `${FACTURE_LIVREUR_STATUT_LABEL[f.statut]}${f.paidAt ? ` le ${f.paidAt}` : ""}`;
  return (
    <Document title={`Règlement livreur ${f.reference}`} author={societe}>
      <Page size="A4" style={doc.page}>
        <DocHeader company={company} logoSrc={logoSrc} title="RÈGLEMENT LIVREUR" reference={f.reference} date={f.date} statusLabel={status} />

        <View style={{ marginTop: 16 }}>
          <Text style={doc.eyebrow}>Livreur</Text>
          <Text style={[doc.bold, { marginTop: 2, fontSize: 10 }]}>{f.livreur.prenom} {f.livreur.nom}</Text>
          <Text style={doc.smallMuted}>{f.livreur.telephone}  •  {f.livreur.agence} ({f.livreur.ville})</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={doc.th}>
            <Text style={[doc.thCell, { flex: COL.trk }]}>N° suivi</Text>
            <Text style={[doc.thCell, { flex: COL.trajet }]}>Trajet</Text>
            <Text style={[doc.thCell, { flex: COL.role }]}>Rôle</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.cod }]}>Collecté</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.tarif }]}>Tarif</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.comm }]}>Commission</Text>
          </View>
          {f.lignes.map((l) => (
            <View key={l.colisId} style={doc.tr} wrap={false}>
              <Text style={[doc.td, doc.bold, { flex: COL.trk }]}>{l.trk}</Text>
              <Text style={[doc.td, { flex: COL.trajet }]}>{l.trajet.replace(/→/g, "»")}</Text>
              <Text style={[doc.td, { flex: COL.role }]}>{l.role}</Text>
              <Text style={[doc.td, doc.right, { flex: COL.cod }]}>{formatMAD(l.cod)}</Text>
              <Text style={[doc.td, doc.right, { flex: COL.tarif }]}>{formatMAD(l.tarif)}</Text>
              <Text style={[doc.td, doc.right, doc.bold, { flex: COL.comm }]}>{formatMAD(l.commission)}</Text>
            </View>
          ))}
        </View>

        <View style={[doc.totalsBox, { width: 260 }]}>
          <View style={doc.totalRow}><Text style={doc.totalLabel}>Montant collecté (COD)</Text><Text style={doc.totalValue}>{formatMAD(f.montantCollecte)}</Text></View>
          <View style={doc.totalRow}><Text style={doc.totalLabel}>Commission livreur</Text><Text style={doc.totalValue}>{formatMAD(f.commission)}</Text></View>
          <View style={doc.grandTotal}>
            <Text style={doc.grandLabel}>À verser à l'agence</Text>
            <Text style={doc.grandValue}>{formatMAD(f.montantAVerser)}</Text>
          </View>
        </View>

        <Signatures left="Signature livreur" right="Signature agence" />
        <LegalFooter company={company} />
      </Page>
    </Document>
  );
}
