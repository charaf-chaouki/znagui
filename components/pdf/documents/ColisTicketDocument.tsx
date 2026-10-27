import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { C } from "@/lib/pdf/styles";
import { formatMAD } from "@/lib/colis-ui";
import type { ColisDetail } from "@/lib/types/colis";
import type { CompanySettings } from "@/lib/types/settings";

const VEHICLE_LABEL: Record<string, string> = { MOTO: "Moto", VOITURE: "Voiture", CAMION: "Camion" };

const s = StyleSheet.create({
  page: { padding: 16, fontSize: 9, fontFamily: "Helvetica", color: C.ink },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", borderStyle: "dashed", paddingBottom: 8 },
  logo: { height: 26, width: 78, objectFit: "contain" },
  kicker: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.faint, textTransform: "uppercase", letterSpacing: 0.5 },
  trkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  trk: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.ink },
  typeBadge: { marginTop: 3, alignSelf: "flex-start", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 3, paddingVertical: 1.5, paddingHorizontal: 5, fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: C.body },
  qr: { width: 74, height: 74, borderWidth: 1, borderColor: "#e2e8f0", padding: 3 },
  block: { borderTopWidth: 1, borderTopColor: "#cbd5e1", borderStyle: "dashed", paddingVertical: 7 },
  eyebrow: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.faint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  strong: { fontFamily: "Helvetica-Bold", color: C.ink },
  muted: { color: C.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderTopColor: "#cbd5e1", borderStyle: "dashed", paddingTop: 7 },
  cell: { width: "50%", marginBottom: 6 },
  cod: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.ink, color: C.white, borderRadius: 5, paddingHorizontal: 10, paddingVertical: 8, marginTop: 8 },
  codLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: 0.5 },
  codValue: { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.white },
  footer: { marginTop: 10, textAlign: "center", fontSize: 7, color: C.faint, borderTopWidth: 1, borderTopColor: "#cbd5e1", borderStyle: "dashed", paddingTop: 6 },
});

export function ColisTicketDocument({
  colis: c,
  company,
  logoSrc,
  qrDataUri,
}: {
  colis: ColisDetail;
  company: CompanySettings;
  logoSrc: string | null;
  qrDataUri: string;
}) {
  const societe = company.nomCommercial || company.raisonSociale || "Znagui Express";
  return (
    <Document title={`Ticket ${c.trk}`} author={societe}>
      <Page size="A6" style={s.page}>
        <View style={s.header}>
          {logoSrc ? <Image src={logoSrc} style={s.logo} /> : <Text style={s.strong}>{societe}</Text>}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.kicker}>Bon de livraison</Text>
            <Text style={s.muted}>{c.date}</Text>
          </View>
        </View>

        <View style={s.trkRow}>
          <View>
            <Text style={s.kicker}>N° de suivi</Text>
            <Text style={s.trk}>{c.trk}</Text>
            <Text style={s.typeBadge}>{c.type === "INTRA" ? "Même ville" : "Inter-villes"}</Text>
          </View>
          <Image src={qrDataUri} style={s.qr} />
        </View>

        <View style={s.block}>
          <Text style={s.eyebrow}>Expéditeur</Text>
          <Text style={s.strong}>{c.client}</Text>
          {c.pickupAddress ? <Text style={s.muted}>{c.pickupAddress}</Text> : null}
          <Text style={s.muted}>{c.pickupCity}</Text>
        </View>

        <View style={s.block}>
          <Text style={s.eyebrow}>Destinataire</Text>
          <Text style={s.strong}>{c.recipient}</Text>
          <Text style={s.muted}>{c.recipientPhone}</Text>
          {c.destAddress ? <Text style={s.muted}>{c.destAddress}</Text> : null}
          <Text style={s.muted}>{c.destCity}</Text>
        </View>

        <View style={s.grid}>
          <View style={s.cell}><Text style={s.eyebrow}>Contenu</Text><Text style={s.strong}>{c.contents}</Text></View>
          <View style={s.cell}><Text style={s.eyebrow}>Nb colis</Text><Text style={s.strong}>{c.parcelCount}</Text></View>
          <View style={s.cell}><Text style={s.eyebrow}>Véhicule</Text><Text style={s.strong}>{VEHICLE_LABEL[c.vehicle] ?? c.vehicle}</Text></View>
          <View style={s.cell}><Text style={s.eyebrow}>Tarif</Text><Text style={s.strong}>{formatMAD(c.tarif)}</Text></View>
        </View>

        <View style={s.cod}>
          <Text style={s.codLabel}>À collecter (COD)</Text>
          <Text style={s.codValue}>{formatMAD(c.cod)}</Text>
        </View>

        {c.notes ? <Text style={[s.muted, { marginTop: 6 }]}>Note : {c.notes}</Text> : null}

        <Text style={s.footer}>Znagui Express — Livraison de colis au Maroc • znaguiexpress.ma</Text>
      </Page>
    </Document>
  );
}
