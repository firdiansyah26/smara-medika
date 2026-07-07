import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatIDR } from "@/lib/utils";

export type InvoicePdfData = {
  facilityName: string;
  invoiceNumber: string;
  status: string;
  patientName: string;
  mrNumber: string;
  address: string | null;
  createdAt: string; // sudah diformat
  paidAt: string | null; // sudah diformat
  discount: number;
  subtotal: number;
  total: number;
  items: {
    category: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
};

const BRAND = "#0d9488";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: INK,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: INK,
    paddingBottom: 10,
  },
  facility: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  brandSub: { fontSize: 9, color: BRAND, marginTop: 2 },
  invLabel: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    letterSpacing: 1,
  },
  invMeta: { fontSize: 9, color: MUTED, textAlign: "right", marginTop: 2 },
  sectionLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  billName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  mono: { fontFamily: "Helvetica", color: MUTED },
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
  cDesc: { flex: 1 },
  cQty: { width: 40, textAlign: "right" },
  cPrice: { width: 90, textAlign: "right" },
  cAmount: { width: 90, textAlign: "right" },
  cat: { fontSize: 8, color: MUTED },
  totals: { marginTop: 12, marginLeft: "auto", width: 200 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    color: MUTED,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    borderTopColor: INK,
    paddingTop: 5,
    marginTop: 3,
  },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 12, fontFamily: "Helvetica-Bold" },
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
  paidAt: { fontSize: 8, color: MUTED, marginTop: 4 },
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

export function InvoicePdf({ data }: { data: InvoicePdfData }) {
  return (
    <Document
      title={`Invoice ${data.invoiceNumber}`}
      author="SmaraMedika"
    >
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.facility}>{data.facilityName}</Text>
            <Text style={s.brandSub}>SmaraMedika</Text>
          </View>
          <View>
            <Text style={s.invLabel}>INVOICE</Text>
            <Text style={s.invMeta}>{data.invoiceNumber}</Text>
            <Text style={s.invMeta}>{data.createdAt}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={s.sectionLabel}>Ditagihkan kepada</Text>
          <Text style={s.billName}>{data.patientName}</Text>
          <Text style={s.mono}>{data.mrNumber}</Text>
          {data.address ? <Text>{data.address}</Text> : null}
        </View>

        <View style={s.thead}>
          <Text style={s.cDesc}>Deskripsi</Text>
          <Text style={s.cQty}>Qty</Text>
          <Text style={s.cPrice}>Harga</Text>
          <Text style={s.cAmount}>Jumlah</Text>
        </View>
        {data.items.map((it, i) => (
          <View style={s.row} key={i}>
            <View style={s.cDesc}>
              <Text>{it.description}</Text>
              <Text style={s.cat}>{it.category}</Text>
            </View>
            <Text style={s.cQty}>{it.quantity}</Text>
            <Text style={s.cPrice}>{formatIDR(it.unitPrice)}</Text>
            <Text style={s.cAmount}>{formatIDR(it.amount)}</Text>
          </View>
        ))}

        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatIDR(data.subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text>Diskon</Text>
            <Text>- {formatIDR(data.discount)}</Text>
          </View>
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>{formatIDR(data.total)}</Text>
          </View>
        </View>

        <View style={s.statusWrap}>
          <Text style={s.statusBox}>{data.status}</Text>
          {data.paidAt ? (
            <Text style={s.paidAt}>Dibayar pada {data.paidAt}</Text>
          ) : null}
        </View>

        <Text style={s.footer} fixed>
          © SmaraMedika — Platform Rekam Medis Elektronik
        </Text>
      </Page>
    </Document>
  );
}
