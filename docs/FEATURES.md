# 📋 Spesifikasi Fitur — SmaraMedika

Dokumen ini merinci seluruh fitur SmaraMedika beserta status prioritasnya.

**Legenda Prioritas:**
- 🔴 **P0** — Wajib untuk MVP (tanpa ini aplikasi tidak berguna)
- 🟡 **P1** — Penting, fase berikutnya
- 🟢 **P2** — Nice-to-have / lanjutan

---

## 1. Autentikasi & Manajemen Pengguna 🔴 P0

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Login / Logout | 🔴 P0 | Autentikasi dengan email + password |
| Lupa password | 🟡 P1 | Reset password via email |
| Manajemen user (CRUD) | 🔴 P0 | Admin mengelola akun staf |
| Role-Based Access Control | 🔴 P0 | Pembatasan akses per peran |
| Audit log | 🔴 P0 | Catat akses & perubahan data sensitif |
| Profil & ganti password | 🟡 P1 | User mengelola akun sendiri |

**Peran (Roles):**
- **Admin** — akses penuh, kelola user & master data
- **Dokter** — rekam medis, diagnosa, resep
- **Perawat** — tanda vital, asuhan keperawatan
- **Resepsionis** — pendaftaran, antrian, data pasien
- **Apoteker** — resep, stok obat

---

## 2. Manajemen Pasien 🔴 P0

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Registrasi pasien baru | 🔴 P0 | No. RM otomatis, data demografi |
| Cari & daftar pasien | 🔴 P0 | Pencarian by nama/NIK/No. RM |
| Detail & edit pasien | 🔴 P0 | Profil lengkap pasien |
| Riwayat kunjungan | 🔴 P0 | Timeline kunjungan pasien |
| Data BPJS/asuransi | 🟡 P1 | Nomor & status kepesertaan |

**Data Pasien:** No. RM, NIK, nama, tgl lahir, jenis kelamin, golongan darah, alamat, no. HP, kontak darurat, pekerjaan, status BPJS.

---

## 3. Rekam Medis (Inti) 🔴 P0

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Catatan kunjungan (Encounter) | 🔴 P0 | Satu record per kunjungan |
| Format SOAP | 🔴 P0 | Subjective, Objective, Assessment, Plan |
| Diagnosa ICD-10 | 🔴 P0 | Pencarian & pilih kode ICD-10 |
| Tanda vital | 🔴 P0 | TD, suhu, nadi, RR, SpO2, BB, TB |
| Riwayat alergi | 🔴 P0 | Daftar alergi pasien (flag menonjol) |
| Riwayat penyakit kronis | 🟡 P1 | Diabetes, hipertensi, dll |
| Lampiran file | 🟡 P1 | Upload hasil lab/rontgen (PDF/gambar) |
| Riwayat tindakan | 🟡 P1 | Tindakan medis yang dilakukan |

---

## 4. Antrian & Pendaftaran 🟡 P1

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Pendaftaran kunjungan | 🟡 P1 | Daftar pasien ke poli/dokter |
| Nomor antrian | 🟡 P1 | Antrian otomatis per poli |
| Jadwal praktik dokter | 🟡 P1 | Jam praktik per dokter |
| Appointment/janji temu | 🟢 P2 | Booking jadwal di muka |
| Status kunjungan | 🟡 P1 | Menunggu → Diperiksa → Selesai |

---

## 5. Resep & Farmasi 🟡 P1

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Resep elektronik | 🟡 P1 | Dokter menulis resep digital |
| Master data obat | 🟡 P1 | Katalog obat + satuan + harga |
| Stok obat | 🟢 P2 | Manajemen persediaan |
| Riwayat pengobatan | 🟡 P1 | Obat yang pernah diberikan |
| Cetak resep | 🟡 P1 | Format resep siap cetak |

---

## 6. Billing & Penunjang 🟢 P2

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Tarif tindakan | 🟢 P2 | Master tarif layanan |
| Tagihan & pembayaran | 🟢 P2 | Invoice per kunjungan |
| Order lab/radiologi | 🟢 P2 | Permintaan pemeriksaan penunjang |
| Input hasil lab | 🟢 P2 | Hasil pemeriksaan penunjang |

---

## 7. Dashboard & Laporan 🟡 P1

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Dashboard ringkasan | 🔴 P0 | Statistik kunjungan hari ini, dll |
| Statistik diagnosa | 🟡 P1 | Diagnosa terbanyak |
| Laporan kunjungan | 🟡 P1 | Per periode |
| Export PDF/Excel | 🟡 P1 | Unduh laporan |

---

## 8. Fitur Lanjutan 🟢 P2

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Notifikasi WhatsApp/email | 🟢 P2 | Pengingat jadwal |
| Telemedicine | 🟢 P2 | Konsultasi online |
| Cetak surat | 🟢 P2 | Rujukan, ket. sakit, resume medis |
| Multi-cabang | 🟢 P2 | Dukungan banyak fasilitas |
| Integrasi SATUSEHAT | 🟢 P2 | Interoperabilitas Kemenkes |

---

## Definisi MVP (Fase 1)

MVP SmaraMedika mencakup fitur **🔴 P0**:
1. Auth + RBAC + Audit log
2. Manajemen Pasien (CRUD + cari)
3. Rekam Medis SOAP + ICD-10 + Tanda Vital + Alergi
4. Dashboard ringkasan

> Dengan MVP ini, sebuah klinik sudah dapat mencatat pasien dan rekam medis secara digital end-to-end.
