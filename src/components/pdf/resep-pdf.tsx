import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

export type ResepPdfData = {
  facilityName: string;
  patientName: string;
  mrNumber: string;
  patientAge: string;
  doctorName: string;
  visitDate: string; // sudah diformat
  items: {
    drugName: string;
    unit: string;
    dosage: string | null;
    frequency: string | null;
    quantity: number;
    instruction: string | null;
  }[];
};

const BRAND = "#0d9488";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: INK,
    paddingBottom: 10,
  },
  facility: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  brandSub: { fontSize: 9, color: BRAND, marginTop: 2 },
  doc: { fontSize: 10, textAlign: "right" },
  docName: { fontFamily: "Helvetica-Bold" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  metaLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  rx: { fontSize: 28, fontFamily: "Helvetica-Bold", color: BRAND, marginTop: 16 },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 8,
    paddingLeft: 8,
  },
  drug: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  sig: { color: MUTED, marginTop: 2 },
  signWrap: { marginTop: 40, alignItems: "flex-end" },
  signLine: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: INK,
    width: 160,
    textAlign: "center",
    paddingTop: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
  },
});

export function ResepPdf({ data }: { data: ResepPdfData }) {
  return (
    <Document title="Resep" author="SmaraMedika">
      <Page size="A5" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.facility}>{data.facilityName}</Text>
            <Text style={s.brandSub}>SmaraMedika</Text>
          </View>
          <View style={s.doc}>
            <Text style={s.docName}>{data.doctorName}</Text>
            <Text style={{ color: MUTED, fontSize: 9 }}>{data.visitDate}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <View>
            <Text style={s.metaLabel}>Pasien</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{data.patientName}</Text>
            <Text style={{ color: MUTED }}>
              {data.mrNumber} · {data.patientAge}
            </Text>
          </View>
        </View>

        <Text style={s.rx}>℞</Text>

        {data.items.map((it, i) => (
          <View style={s.item} key={i}>
            <Text style={s.drug}>
              {it.drugName}{" "}
              <Text style={{ fontFamily: "Helvetica", color: MUTED, fontSize: 10 }}>
                No. {it.quantity} {it.unit}
              </Text>
            </Text>
            <Text style={s.sig}>
              S/{" "}
              {[it.dosage, it.frequency, it.instruction]
                .filter(Boolean)
                .join(" · ") || "-"}
            </Text>
          </View>
        ))}

        <View style={s.signWrap}>
          <Text style={{ fontSize: 9, color: MUTED }}>Dokter,</Text>
          <Text style={s.signLine}>{data.doctorName}</Text>
        </View>

        <Text style={s.footer} fixed>
          © SmaraMedika — Platform Rekam Medis Elektronik
        </Text>
      </Page>
    </Document>
  );
}
