import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

export type SickNoteData = {
  kind: "SICK_NOTE";
  restDays: number;
  startDate: string; // diformat
  diagnosis: string;
  note: string;
};
export type ReferralData = {
  kind: "REFERRAL";
  toFacility: string;
  toDoctor: string;
  reason: string;
  diagnosis: string;
};

export type MedicalDocPdfData = {
  facilityName: string;
  facilityCity: string;
  number: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientAddress: string;
  doctorName: string;
  dateStr: string;
  body: SickNoteData | ReferralData;
};

const BRAND = "#0d9488";
const INK = "#0f172a";
const MUTED = "#64748b";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 11, color: INK, fontFamily: "Helvetica", lineHeight: 1.5 },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: INK,
    paddingBottom: 10,
    textAlign: "center",
  },
  facility: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  brandSub: { fontSize: 9, color: BRAND, marginTop: 2 },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 22, textDecoration: "underline" },
  no: { fontSize: 10, color: MUTED, textAlign: "center", marginTop: 2 },
  para: { marginTop: 18 },
  row: { flexDirection: "row", marginTop: 3 },
  label: { width: 120, color: MUTED },
  val: { flex: 1 },
  strong: { fontFamily: "Helvetica-Bold" },
  sign: { marginTop: 40, alignItems: "flex-end" },
  signLine: {
    marginTop: 46,
    borderTopWidth: 1,
    borderTopColor: INK,
    width: 180,
    textAlign: "center",
    paddingTop: 3,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
  },
});

function Identity({ d }: { d: MedicalDocPdfData }) {
  return (
    <View style={s.para}>
      <View style={s.row}>
        <Text style={s.label}>Nama</Text>
        <Text style={[s.val, s.strong]}>{d.patientName}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.label}>Jenis kelamin</Text>
        <Text style={s.val}>{d.patientGender}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.label}>Umur</Text>
        <Text style={s.val}>{d.patientAge}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.label}>Alamat</Text>
        <Text style={s.val}>{d.patientAddress}</Text>
      </View>
    </View>
  );
}

export function MedicalDocPdf({ data: d }: { data: MedicalDocPdfData }) {
  const isSick = d.body.kind === "SICK_NOTE";
  return (
    <Document
      title={isSick ? "Surat Keterangan Sakit" : "Surat Rujukan"}
      author="SmaraMedika"
    >
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.facility}>{d.facilityName}</Text>
          <Text style={s.brandSub}>SmaraMedika</Text>
        </View>

        <Text style={s.title}>
          {isSick ? "SURAT KETERANGAN SAKIT" : "SURAT RUJUKAN"}
        </Text>
        <Text style={s.no}>No. {d.number}</Text>

        <Text style={s.para}>
          Yang bertanda tangan di bawah ini menerangkan bahwa:
        </Text>
        <Identity d={d} />

        {d.body.kind === "SICK_NOTE" ? (
          <Text style={s.para}>
            Berdasarkan pemeriksaan, pasien tersebut dinyatakan{" "}
            <Text style={s.strong}>sakit</Text>
            {d.body.diagnosis ? ` (${d.body.diagnosis})` : ""} dan memerlukan
            istirahat selama <Text style={s.strong}>{d.body.restDays} hari</Text>{" "}
            terhitung mulai <Text style={s.strong}>{d.body.startDate}</Text>.
            {d.body.note ? ` ${d.body.note}` : ""}
          </Text>
        ) : (
          <View style={s.para}>
            <Text>
              Mohon perkenan Sejawat untuk memeriksa dan menangani lebih lanjut
              pasien tersebut di atas.
            </Text>
            <View style={{ marginTop: 10 }}>
              <View style={s.row}>
                <Text style={s.label}>Dirujuk ke</Text>
                <Text style={[s.val, s.strong]}>{d.body.toFacility}</Text>
              </View>
              {d.body.toDoctor ? (
                <View style={s.row}>
                  <Text style={s.label}>Kepada</Text>
                  <Text style={s.val}>{d.body.toDoctor}</Text>
                </View>
              ) : null}
              <View style={s.row}>
                <Text style={s.label}>Diagnosis</Text>
                <Text style={s.val}>{d.body.diagnosis || "-"}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.label}>Alasan rujukan</Text>
                <Text style={s.val}>{d.body.reason}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={s.para}>
          Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.
        </Text>

        <View style={s.sign}>
          <Text style={{ fontSize: 10, color: MUTED }}>
            {d.facilityCity}, {d.dateStr}
          </Text>
          <Text style={s.signLine}>{d.doctorName}</Text>
        </View>

        <Text style={s.footer} fixed>
          © SmaraMedika — Platform Rekam Medis Elektronik
        </Text>
      </Page>
    </Document>
  );
}
