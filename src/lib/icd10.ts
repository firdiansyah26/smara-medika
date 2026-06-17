// Subset kode ICD-10 umum (klinik Indonesia). Untuk MVP — bisa diperluas
// ke dataset penuh + full-text search PostgreSQL nanti (lihat docs/TECH_DEBT.md TD-002).

export type IcdCode = { code: string; name: string };

export const ICD10: IcdCode[] = [
  { code: "J00", name: "Nasofaringitis akut (common cold)" },
  { code: "J02.9", name: "Faringitis akut" },
  { code: "J03.9", name: "Tonsilitis akut" },
  { code: "J06.9", name: "Infeksi saluran napas atas akut (ISPA)" },
  { code: "J20.9", name: "Bronkitis akut" },
  { code: "J45.9", name: "Asma" },
  { code: "A09", name: "Diare & gastroenteritis (dugaan infeksi)" },
  { code: "A01.0", name: "Demam tifoid" },
  { code: "A90", name: "Demam dengue" },
  { code: "B34.9", name: "Infeksi virus, tidak spesifik" },
  { code: "B50.9", name: "Malaria falciparum" },
  { code: "K29.7", name: "Gastritis" },
  { code: "K30", name: "Dispepsia (fungsional)" },
  { code: "I10", name: "Hipertensi esensial (primer)" },
  { code: "E11.9", name: "Diabetes melitus tipe 2 tanpa komplikasi" },
  { code: "E78.5", name: "Hiperlipidemia" },
  { code: "R50.9", name: "Demam, tidak spesifik" },
  { code: "R51", name: "Sakit kepala" },
  { code: "R05", name: "Batuk" },
  { code: "R11", name: "Mual dan muntah" },
  { code: "R10.4", name: "Nyeri perut, tidak spesifik" },
  { code: "M54.5", name: "Nyeri punggung bawah" },
  { code: "M79.1", name: "Mialgia" },
  { code: "N39.0", name: "Infeksi saluran kemih (ISK)" },
  { code: "H10.9", name: "Konjungtivitis" },
  { code: "L23.9", name: "Dermatitis kontak alergi" },
  { code: "K02.9", name: "Karies gigi" },
  { code: "Z00.0", name: "Pemeriksaan kesehatan umum" },
  { code: "O80", name: "Persalinan tunggal spontan" },
  { code: "T78.4", name: "Alergi, tidak spesifik" },
];

export function searchIcd10(query: string, limit = 8): IcdCode[] {
  const q = query.trim().toLowerCase();
  if (!q) return ICD10.slice(0, limit);
  return ICD10.filter(
    (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
  ).slice(0, limit);
}
