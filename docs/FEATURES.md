# 📋 Spesifikasi Fitur — SmaraMedika

Dokumen ini merinci seluruh fitur SmaraMedika beserta status prioritasnya.

> **SmaraMedika adalah platform multi-tenant.** Banyak fasilitas (Rumah Sakit, Klinik, Apotek) berada dalam satu platform, dengan data terisolasi per fasilitas, namun bisa saling terhubung melalui **rekanan (partnership)** untuk **transfer obat** dan **berbagi akses pasien** secara terkontrol.

**Legenda Prioritas:**
- 🔴 **P0** — Wajib untuk MVP (tanpa ini aplikasi tidak berguna)
- 🟡 **P1** — Penting, fase berikutnya
- 🟢 **P2** — Nice-to-have / lanjutan

---

## 0. Multi-Tenant & Keanggotaan 🔴 P0

Konsep fondasi platform. Lihat strategi teknis di `ARCHITECTURE.md`.

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Tenant (Fasilitas) | 🔴 P0 | Entitas RS / Klinik / Apotek dengan profil masing-masing |
| Tipe tenant | 🔴 P0 | RUMAH_SAKIT, KLINIK, APOTEK (fitur menyesuaikan tipe) |
| **Keanggotaan multi-tenant** | 🔴 P0 | **1 user bisa tergabung di banyak tenant** dengan peran berbeda per tenant |
| Pemilihan tenant aktif | 🔴 P0 | User memilih/berpindah tenant aktif (tenant switcher) |
| Isolasi data per tenant | 🔴 P0 | Data satu tenant tidak bocor ke tenant lain |
| Undang anggota ke tenant | 🟡 P1 | Admin tenant mengundang user + tetapkan peran |
| Kelola anggota & peran | 🟡 P1 | Tambah/ubah/nonaktifkan anggota per tenant |

**Catatan peran:** peran (Dokter, Perawat, dll) melekat pada **keanggotaan (membership)**, bukan pada user global. Jadi user bisa jadi *Dokter di RS A* sekaligus *Apoteker di Apotek B*.

---

## 1. Autentikasi & Manajemen Pengguna 🔴 P0

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Login / Logout | 🔴 P0 | Autentikasi dengan email + password |
| Lupa password | 🟡 P1 | Reset password via email |
| Profil & ganti password | 🟡 P1 | User mengelola akun sendiri |
| Audit log | 🔴 P0 | Catat akses & perubahan data sensitif (per tenant) |

**Peran per tenant (Roles):**
- **Owner/Admin Tenant** — kelola tenant, anggota, master data, rekanan
- **Dokter** — rekam medis, diagnosa, resep
- **Perawat** — tanda vital, asuhan keperawatan
- **Resepsionis** — pendaftaran, antrian, data pasien
- **Apoteker** — resep, stok obat, proses order transfer obat

> (Opsional) **Super Admin platform** — mengelola lintas tenant, verifikasi pendaftaran fasilitas baru.

---

## 2. Manajemen Pasien 🔴 P0

Pasien **dimiliki oleh tenant yang membuatnya**. Tenant lain hanya bisa mencari dengan informasi terbatas; detail butuh persetujuan.

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Registrasi pasien baru | 🔴 P0 | No. RM otomatis (per tenant), data demografi. Pasien terikat tenant pembuat |
| Cari pasien (dalam tenant) | 🔴 P0 | Pencarian penuh untuk pasien milik tenant aktif |
| Detail & edit pasien | 🔴 P0 | Untuk pasien milik tenant (atau yang aksesnya disetujui) |
| Riwayat kunjungan | 🔴 P0 | Timeline kunjungan pasien di tenant |
| **Pencarian pasien lintas tenant** | 🟡 P1 | Cari by NIK/nama → hasil **info terbatas** (nama, jenis kelamin, tenant pemilik). Detail medis disembunyikan |
| **Permintaan akses pasien** | 🟡 P1 | Tenant pemohon mengirim request akses detail ke tenant pemilik |
| **Persetujuan akses pasien** | 🟡 P1 | Tenant pemilik menyetujui/menolak permintaan akses |
| Akses otomatis multi-tenant | 🟡 P1 | User yang tergabung di beberapa tenant melihat pasien sesuai keanggotaannya |

**Alur akses pasien lintas tenant:**
```
Tenant B cari pasien → ketemu (info terbatas, owner = Tenant A)
   → Tenant B "Minta Akses Detail"
   → Tenant A terima notifikasi → Setujui / Tolak
   → Jika disetujui: Tenant B bisa lihat detail (sesuai cakupan & masa berlaku)
```

**Data Pasien:** No. RM, NIK, nama, tgl lahir, jenis kelamin, golongan darah, alamat, no. HP, kontak darurat, pekerjaan, status BPJS.
**Info terbatas (publik antar tenant):** nama, jenis kelamin, kota, tenant pemilik (NIK bisa dimask, mis. `3201********0001`).

---

## 3. Rekam Medis (Inti) 🔴 P0

Rekam medis selalu milik tenant tempat kunjungan terjadi.

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

Stok obat dikelola **per tenant** (tiap apotek/RS punya stok sendiri).

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Resep elektronik | 🟡 P1 | Dokter menulis resep digital |
| Master data obat | 🟡 P1 | Katalog obat (master bersama) |
| Stok obat per tenant | 🟡 P1 | Jumlah & harga stok di tiap fasilitas |
| Riwayat pengobatan | 🟡 P1 | Obat yang pernah diberikan |
| Cetak resep | 🟡 P1 | Format resep siap cetak |

---

## 6. Rekanan & Transfer Obat Antar-Fasilitas 🟡 P1 ⭐ (fitur utama baru)

Skenario: **RS A** butuh obat (mis. obat kaki) yang tidak tersedia di stoknya, namun tersedia di **Apotek B** yang merupakan **rekanannya**. RS A membuat order ke Apotek B, lalu prosesnya **dilacak (tracking)** sampai obat diterima.

### 6.1 Manajemen Rekanan (Partnership)

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Ajukan rekanan | 🟡 P1 | Tenant mengundang tenant lain jadi rekanan |
| Setujui/tolak rekanan | 🟡 P1 | Tenant tujuan menerima/menolak ajakan |
| Daftar rekanan | 🟡 P1 | Lihat & kelola rekanan aktif |
| Putus rekanan | 🟢 P2 | Nonaktifkan hubungan rekanan |

### 6.2 Order & Transfer Obat

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Cari stok obat di rekanan | 🟡 P1 | Lihat ketersediaan obat di apotek/RS rekanan |
| Buat order obat | 🟡 P1 | Pesan 1+ jenis obat ke rekanan (multi-item) |
| Konfirmasi/tolak order | 🟡 P1 | Penyedia (Apotek B) menyetujui & menyiapkan / menolak |
| **Tracking status order** | 🟡 P1 | Pelacakan tahap demi tahap (timeline) |
| Penerimaan obat | 🟡 P1 | Pemohon konfirmasi terima → stok bertambah |
| Riwayat order (masuk & keluar) | 🟡 P1 | Daftar order yang dikirim & diterima per tenant |
| Pembatalan order | 🟢 P2 | Batalkan sebelum dikirim |
| Notifikasi perubahan status | 🟢 P2 | Pemberitahuan tiap status berubah |

**Alur (booking → terima) & status tracking:**
```
[RS A] Buat Order  ──────────►  DIAJUKAN (REQUESTED)
[Apotek B] Konfirmasi ────────►  DIKONFIRMASI (CONFIRMED)
[Apotek B] Siapkan obat ──────►  DISIAPKAN (PREPARING)
[Apotek B] Kirim ─────────────►  DIKIRIM (SHIPPED)
              ────────────────►  DALAM PERJALANAN (IN_TRANSIT)
[Kurir] Sampai ───────────────►  TIBA (DELIVERED)
[RS A] Konfirmasi terima ─────►  DITERIMA (RECEIVED)  ✅ stok RS A bertambah

   Jalur alternatif: DITOLAK (REJECTED) / DIBATALKAN (CANCELLED)
```
Setiap perubahan status tercatat lengkap (waktu, oleh siapa, catatan) sebagai **riwayat tracking**.

---

## 7. Billing & Penunjang 🟢 P2

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Tarif tindakan | 🟢 P2 | Master tarif layanan (per tenant) |
| Tagihan & pembayaran | 🟢 P2 | Invoice per kunjungan |
| Order lab/radiologi | 🟢 P2 | Permintaan pemeriksaan penunjang |
| Input hasil lab | 🟢 P2 | Hasil pemeriksaan penunjang |

---

## 8. Dashboard & Laporan 🟡 P1

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Dashboard ringkasan (per tenant) | 🔴 P0 | Statistik kunjungan, order obat masuk/keluar |
| Statistik diagnosa | 🟡 P1 | Diagnosa terbanyak |
| Laporan kunjungan | 🟡 P1 | Per periode |
| Laporan transfer obat | 🟡 P1 | Order keluar/masuk + status |
| Export PDF/Excel | 🟡 P1 | Unduh laporan |

---

## 9. Fitur Lanjutan 🟢 P2

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Notifikasi WhatsApp/email | 🟢 P2 | Pengingat jadwal & status order |
| Telemedicine | 🟢 P2 | Konsultasi online |
| Cetak surat | 🟢 P2 | Rujukan, ket. sakit, resume medis |
| Integrasi SATUSEHAT | 🟢 P2 | Interoperabilitas Kemenkes |
| Pembayaran antar-tenant | 🟢 P2 | Settlement transaksi transfer obat |

---

## 10. Shared API (Integrasi Pihak Ketiga) 🟢 P2

API publik **per tenant** agar sistem eksternal (SIM-RS lain, aplikasi mitra) bisa terintegrasi. Detail teknis: lihat **[SHARED_API.md](./SHARED_API.md)**.

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Kelola API Key | 🟢 P2 | Buat/cabut/rotasi API key per tenant (OWNER/ADMIN) |
| Scope & izin granular | 🟢 P2 | Batasi key per resource (`patients:read`, dst) |
| Endpoint publik `/api/v1` | 🟢 P2 | Akses pasien, encounter, stok, order obat (tenant-scoped) |
| Rate limiting & kuota | 🟢 P2 | Batas request per key + header sisa kuota |
| Webhook | 🟢 P2 | Notifikasi event ke sistem luar (HMAC + retry) |
| Log pemakaian API | 🟢 P2 | Audit setiap request (key, endpoint, status, latency) |
| Portal/dokumentasi developer | 🟢 P2 | Halaman dev + OpenAPI + kelola key/webhook |

> Penting: API key **tidak menembus** isolasi tenant maupun consent (akses pasien lintas tenant & rekanan tetap berlaku).

---

## Definisi MVP (Fase 1)

MVP SmaraMedika mencakup fitur **🔴 P0**:
1. **Multi-tenant + keanggotaan multi-tenant + tenant switcher** (fondasi)
2. Auth + RBAC per tenant + Audit log
3. Manajemen Pasien (CRUD + cari dalam tenant)
4. Rekam Medis SOAP + ICD-10 + Tanda Vital + Alergi
5. Dashboard ringkasan per tenant

**Fitur unggulan (transfer obat antar rekanan + tracking) & akses pasien lintas tenant** masuk **Fase 3** (P1) — dibangun setelah fondasi multi-tenant & rekam medis solid.

> Dengan MVP ini, beberapa fasilitas sudah bisa beroperasi mandiri di satu platform; lalu fitur jaringan (rekanan, transfer obat, berbagi pasien) ditambahkan di atas fondasi tersebut.
