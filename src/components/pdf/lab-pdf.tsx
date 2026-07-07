import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

export type LabPdfData = {
  facilityName: string;
  orderNumber: string;
  categoryLabel: string;
  statusLabel: string;
  patientName: string;
  mrNumber: string;
  createdAt: string;
  completedAt: string | null;
  items: {
    testName: string;
    result: string | null;
    unit: string | null;
    referenceRange: string | null;
    flagLabel: string | null;
    abnormal: boolean;
  }[];
};

const BRAND = "#0d9488";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const DANGER = "#dc2626";

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
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "right" },
  meta: { fontSize: 9, color: MUTED, textAlign: "right", marginTop: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  label: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  bold: { fontFamily: "Helvetica-Bold" },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
    paddingVertical: 5,
    marginTop: 18,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 5,
  },
  cTest: { flex: 1 },
  cResult: { width: 90 },
  cUnit: { width: 60 },
  cRef: { width: 90 },
  cFlag: { width: 60, textAlign: "right" },
  statusWrap: { marginTop: 26, alignItems: "center" },
  statusBox: {
    borderWidth: 1.5,
    borderColor: INK,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
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

export function LabPdf({ data }: { data: LabPdfData }) {
  return (
    <Document title={`Hasil ${data.orderNumber}`} author="SmaraMedika">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.facility}>{data.facilityName}</Text>
            <Text style={s.brandSub}>SmaraMedika</Text>
          </View>
          <View>
            <Text style={s.title}>HASIL {data.categoryLabel.toUpperCase()}</Text>
            <Text style={s.meta}>{data.orderNumber}</Text>
          </View>
        </View>

        <View style={s.infoRow}>
          <View>
            <Text style={s.label}>Pasien</Text>
            <Text style={s.bold}>{data.patientName}</Text>
            <Text style={{ color: MUTED }}>{data.mrNumber}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: MUTED }}>Order: {data.createdAt}</Text>
            {data.completedAt ? (
              <Text style={{ color: MUTED }}>Selesai: {data.completedAt}</Text>
            ) : null}
          </View>
        </View>

        <View style={s.thead}>
          <Text style={s.cTest}>Pemeriksaan</Text>
          <Text style={s.cResult}>Hasil</Text>
          <Text style={s.cUnit}>Satuan</Text>
          <Text style={s.cRef}>Rujukan</Text>
          <Text style={s.cFlag}>Tanda</Text>
        </View>
        {data.items.map((it, i) => (
          <View style={s.row} key={i}>
            <Text style={s.cTest}>{it.testName}</Text>
            <Text style={[s.cResult, it.abnormal ? { color: DANGER, fontFamily: "Helvetica-Bold" } : {}]}>
              {it.result || "-"}
            </Text>
            <Text style={[s.cUnit, { color: MUTED }]}>{it.unit || "-"}</Text>
            <Text style={[s.cRef, { color: MUTED }]}>{it.referenceRange || "-"}</Text>
            <Text style={[s.cFlag, it.abnormal ? { color: DANGER } : { color: MUTED }]}>
              {it.flagLabel || "-"}
            </Text>
          </View>
        ))}

        <View style={s.statusWrap}>
          <Text style={s.statusBox}>{data.statusLabel}</Text>
        </View>

        <Text style={s.footer} fixed>
          © SmaraMedika — Platform Rekam Medis Elektronik
        </Text>
      </Page>
    </Document>
  );
}
