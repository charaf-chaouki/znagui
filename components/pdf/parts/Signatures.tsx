import { View, Text } from "@react-pdf/renderer";
import { C, doc } from "@/lib/pdf/styles";

/** Two-column signature row at the foot of manifests / invoices. */
export function Signatures({ left, right }: { left: string; right: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 40,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: C.line,
        borderStyle: "dashed",
      }}
    >
      <Text style={doc.smallMuted}>{left}</Text>
      <Text style={doc.smallMuted}>{right}</Text>
    </View>
  );
}
