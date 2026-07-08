import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatIDR } from "@/lib/utils";

export type KwitansiPdfData = {
  facilityName: string;
  receiptNo: string;
  invoiceNumber: string;
  patientName: string;
  total: number;
  totalWords: string;
  purpose: string;
  paidAt: string; // sudah diformat
  city: string;
};

const BRAND = "#0d9488";
const INK = "#0f172a";
const MUTED = "#64748b";

const s = StyleSheet.create({
  page: { padding: 44, fontSize: 11, color: INK, fontFamily: "Helvetica" },
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
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  meta: { fontSize: 10, color: MUTED, textAlign: "right", marginTop: 2 },
  row: { flexDirection: "row", marginTop: 14 },
  label: { width: 130, color: MUTED },
  value: { flex: 1 },
  words: {
    marginTop: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    fontStyle: "italic",
  },
  amountBox: { marginTop: 18, alignItems: "flex-start" },
  amount: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    borderWidth: 1.5,
    borderColor: BRAND,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sign: { marginTop: 46, alignItems: "flex-end" },
  signLine: {
    marginTop: 44,
    borderTopWidth: 1,
    borderTopColor: INK,
    width: 180,
    textAlign: "center",
    paddingTop: 3,
    color: MUTED,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 44,
    right: 44,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
  },
});

export function KwitansiPdf({ data }: { data: KwitansiPdfData }) {
  return (
    <Document title={`Kwitansi ${data.receiptNo}`} author="SmaraMedika">
      <Page size="A5" orientation="landscape" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.facility}>{data.facilityName}</Text>
            <Text style={s.brandSub}>SmaraMedika</Text>
          </View>
          <View>
            <Text style={s.title}>KWITANSI</Text>
            <Text style={s.meta}>No. {data.receiptNo}</Text>
          </View>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Telah terima dari</Text>
          <Text style={[s.value, { fontFamily: "Helvetica-Bold" }]}>
            {data.patientName}
          </Text>
        </View>

        <View style={s.words}>
          <Text>Terbilang: {data.totalWords} rupiah</Text>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Untuk pembayaran</Text>
          <Text style={s.value}>
            {data.purpose} (Invoice {data.invoiceNumber})
          </Text>
        </View>

        <View style={s.amountBox}>
          <Text style={s.amount}>{formatIDR(data.total)}</Text>
        </View>

        <View style={s.sign}>
          <Text style={{ fontSize: 10, color: MUTED }}>
            {data.city}, {data.paidAt}
          </Text>
          <Text style={s.signLine}>Penerima</Text>
        </View>

        <Text style={s.footer} fixed>
          © SmaraMedika — Platform Rekam Medis Elektronik
        </Text>
      </Page>
    </Document>
  );
}
