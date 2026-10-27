import { StyleSheet } from "@react-pdf/renderer";

/** Shared design tokens for all PDF documents (keep in sync with the brand). */
export const C = {
  brand: "#009206",
  brandDark: "#046a30",
  ink: "#0f172a", // slate-900
  body: "#334155", // slate-700
  muted: "#64748b", // slate-500
  faint: "#94a3b8", // slate-400
  line: "#e2e8f0", // slate-200
  zebra: "#f8fafc", // slate-50
  white: "#ffffff",
};

/** Styles common to the A4 business documents (invoices, manifests). */
export const doc = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 44,
    paddingHorizontal: 34,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.ink,
    lineHeight: 1.35,
  },
  row: { flexDirection: "row" },
  spaceBetween: { flexDirection: "row", justifyContent: "space-between" },
  logo: { height: 42, width: 110, objectFit: "contain" },
  company: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.ink },
  smallMuted: { fontSize: 8, color: C.muted },
  docTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.ink, letterSpacing: 1 },
  ref: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.body, marginTop: 2 },
  eyebrow: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.faint, textTransform: "uppercase", letterSpacing: 0.6 },
  badge: {
    marginTop: 4,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: C.body,
  },
  // Table
  th: { backgroundColor: C.zebra, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, flexDirection: "row", paddingVertical: 5 },
  thCell: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.muted, textTransform: "uppercase", paddingHorizontal: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.zebra, paddingVertical: 5, minHeight: 18 },
  td: { fontSize: 8.5, color: C.body, paddingHorizontal: 6 },
  right: { textAlign: "right" },
  bold: { fontFamily: "Helvetica-Bold", color: C.ink },
  // Totals
  totalsBox: { width: 230, alignSelf: "flex-end", marginTop: 16 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 2 },
  totalLabel: { color: C.muted },
  totalValue: { fontFamily: "Helvetica-Bold", color: C.ink },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.ink, color: C.white, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 9, marginTop: 6 },
  grandLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: 0.5 },
  grandValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.white },
  footer: { position: "absolute", bottom: 20, left: 34, right: 34, textAlign: "center", fontSize: 7, color: C.faint, borderTopWidth: 1, borderTopColor: C.line, borderStyle: "dashed", paddingTop: 6 },
});
