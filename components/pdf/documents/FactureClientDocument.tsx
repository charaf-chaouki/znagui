import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { C, doc } from "@/lib/pdf/styles";
import { formatMAD } from "@/lib/colis-ui";
import { FACTURE_STATUT_LABEL } from "@/lib/facture-ui";
import type { FactureClientDetail } from "@/lib/types/facture-client";
import type { CompanySettings } from "@/lib/types/settings";

// Column layout for the lines table (flex weights add up across the row).
const COL = { trk: 1.3, dest: 2.4, cod: 1, tarif: 1, collecte: 1, aVerser: 1.2 };

export function FactureClientDocument({
  facture: f,
  company,
  logoSrc,
}: {
  facture: FactureClientDetail;
  company: CompanySettings;
  logoSrc: string | null;
}) {
  const societe = company.raisonSociale || company.nomCommercial || "Znagui Express";
  const legal = [
    company.ice && `ICE : ${company.ice}`,
    company.rc && `RC : ${company.rc}`,
    company.if && `IF : ${company.if}`,
    company.patente && `Patente : ${company.patente}`,
    company.cnss && `CNSS : ${company.cnss}`,
  ].filter(Boolean).join("   •   ");

  return (
    <Document title={`Facture ${f.reference}`} author={societe}>
      <Page size="A4" style={doc.page}>
        {/* Header */}
        <View style={[doc.spaceBetween, { borderBottomWidth: 2, borderBottomColor: C.ink, paddingBottom: 14 }]}>
          <View style={[doc.row, { gap: 10, maxWidth: 320 }]}>
            {logoSrc ? <Image src={logoSrc} style={doc.logo} /> : null}
            <View>
              <Text style={doc.company}>{societe}</Text>
              {company.formeJuridique ? (
                <Text style={doc.smallMuted}>
                  {company.formeJuridique}{company.capital ? `  •  Capital ${company.capital} DH` : ""}
                </Text>
              ) : null}
              {company.adresse ? (
                <Text style={doc.smallMuted}>{company.adresse}{company.ville ? `, ${company.ville}` : ""}</Text>
              ) : null}
              <Text style={doc.smallMuted}>
                {[company.telephone, company.email, company.siteWeb].filter(Boolean).join("  •  ")}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={doc.docTitle}>FACTURE</Text>
            <Text style={doc.ref}>{f.reference}</Text>
            <Text style={doc.smallMuted}>Date : {f.date}</Text>
            <Text style={doc.badge}>
              {FACTURE_STATUT_LABEL[f.statut]}{f.paidAt ? ` le ${f.paidAt}` : ""}
            </Text>
          </View>
        </View>

        {/* Bill-to */}
        <View style={{ marginTop: 18 }}>
          <Text style={doc.eyebrow}>Facturé à</Text>
          <Text style={[doc.bold, { marginTop: 2, fontSize: 10 }]}>{f.client.nom}</Text>
          <Text style={doc.smallMuted}>{f.client.telephone}</Text>
          {f.client.adresse ? <Text style={doc.smallMuted}>{f.client.adresse}</Text> : null}
          <Text style={doc.smallMuted}>{f.client.ville}</Text>
        </View>

        {/* Lines table */}
        <View style={{ marginTop: 18 }}>
          <View style={doc.th}>
            <Text style={[doc.thCell, { flex: COL.trk }]}>N° suivi</Text>
            <Text style={[doc.thCell, { flex: COL.dest }]}>Destinataire</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.cod }]}>COD</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.tarif }]}>Tarif</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.collecte }]}>Collecté</Text>
            <Text style={[doc.thCell, doc.right, { flex: COL.aVerser }]}>À verser</Text>
          </View>
          {f.lignes.map((l) => (
            <View key={l.colisId} style={doc.tr} wrap={false}>
              <Text style={[doc.td, doc.bold, { flex: COL.trk }]}>{l.trk}</Text>
              <Text style={[doc.td, { flex: COL.dest }]}>{l.recipient}  •  {l.destCity}</Text>
              <Text style={[doc.td, doc.right, { flex: COL.cod }]}>{formatMAD(l.cod)}</Text>
              <Text style={[doc.td, doc.right, { flex: COL.tarif }]}>{formatMAD(l.tarif)}</Text>
              <Text style={[doc.td, doc.right, { flex: COL.collecte }]}>{formatMAD(l.collecte)}</Text>
              <Text style={[doc.td, doc.right, doc.bold, { flex: COL.aVerser }]}>{formatMAD(l.aVerser)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={doc.totalsBox}>
          <View style={doc.totalRow}>
            <Text style={doc.totalLabel}>Montant collecté</Text>
            <Text style={doc.totalValue}>{formatMAD(f.montantCollecte)}</Text>
          </View>
          <View style={doc.totalRow}>
            <Text style={doc.totalLabel}>Total tarifs</Text>
            <Text style={doc.totalValue}>{formatMAD(f.tarifTotal)}</Text>
          </View>
          <View style={doc.grandTotal}>
            <Text style={doc.grandLabel}>Montant à verser</Text>
            <Text style={doc.grandValue}>{formatMAD(f.montantNet)}</Text>
          </View>
        </View>

        {f.notes ? (
          <View style={{ marginTop: 18 }}>
            <Text style={doc.eyebrow}>Note</Text>
            <Text style={[doc.smallMuted, { marginTop: 2 }]}>{f.notes}</Text>
          </View>
        ) : null}

        {legal ? <Text style={doc.footer} fixed>{legal}</Text> : null}
      </Page>
    </Document>
  );
}
