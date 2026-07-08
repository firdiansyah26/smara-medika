# 📋 Spesifikasi Fitur — SmaraMedika

Dokumen ini merinci seluruh fitur SmaraMedika beserta status prioritasnya.

> **SmaraMedika adalah platform multi-tenant.** Banyak fasilitas (Rumah Sakit, Klinik, Apotek) berada dalam satu platform, dengan data terisolasi per fasilitas, namun bisa saling terhubung melalui **rekanan (partnership)** untuk **transfer obat** dan **berbagi akses pasien** secara terkontrol.

**Legenda Prioritas:**
- 🔴 **P0** — Wajib untuk MVP (tanpa ini aplikasi tidak berguna)
- 🟡 **P1** — Penting, fase berikutnya
- 🟢 **P2** — Nice-to-have / lanjutan

> **Status implementasi (ringkas):** ✅ Multi-tenant, Auth & RBAC (+ lupa/reset kata sandi mode dev),
> Manajemen Pasien (+ riwayat pengobatan di profil), Rekam Medis (SOAP + tanda vital **dengan indikator
> klinis** + ICD-10 + alergi + **resep elektronik & cetak resep**), Dashboard, **Antrian** (kiosk cetak
> nomor + papan display bersuara + panel panggil per counter), **Farmasi** (master obat + stok),
> **Rekanan**, **Transfer obat antar rekanan + tracking**, **Berbagi pasien lintas tenant**,
> **Laporan & export (CSV + cetak/PDF)**, **Undang & kelola anggota tenant**, **Billing/Tagihan**,
> **Jadwal & Janji Temu (Appointment)**, **Shared API (API key + endpoint `/api/v1` + scope + rate limit)**,
> **Lab & Radiologi**, **Notifikasi email (pengingat janji temu, hasil lab siap) + log**, dan **UI shadcn**.
> Belum: notifikasi WhatsApp, webhook Shared API, Telemedicine, Integrasi SATUSEHAT/BPJS. Detail per fase: lihat `ROADMAP.md`.

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
| Undang anggota ke tenant | ✅ | Admin tenant mengundang user (tautkan akun lama / buat akun baru + kata sandi awal) + tetapkan peran |
| Kelola anggota & peran | ✅ | Daftar anggota, ubah peran inline, keluarkan anggota (guard: tak bisa ubah diri sendiri / Pemilik terakhir) |

**Catatan peran:** peran (Dokter, Perawat, dll) melekat pada **keanggotaan (membership)**, bukan pada user global. Jadi user bisa jadi *Dokter di RS A* sekaligus *Apoteker di Apotek B*.

---

## 1. Autentikasi & Manajemen Pengguna 🔴 P0

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Login / Logout | 🔴 P0 | Autentikasi dengan email + password |
| Lupa password | ✅ | Reset kata sandi via token (mode dev: tautan tampil di layar; email menyusul) |
| Profil & ganti password | ✅ | Halaman profil + ganti kata sandi (`/dashboard/profil`) |
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
| **Pencarian pasien lintas tenant** | ✅ | Cari by NIK/nama → hasil **info terbatas** (nama, jenis kelamin, tenant pemilik). Detail medis disembunyikan |
| **Permintaan akses pasien** | ✅ | Tenant pemohon mengirim request akses detail ke tenant pemilik (`/dashboard/akses-pasien`) |
| **Persetujuan akses pasien** | ✅ | Tenant pemilik menyetujui/menolak permintaan akses |
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

| Fitur | Status | Deskripsi |
|-------|:---:|-----------|
| Nomor antrian per layanan | ✅ | Otomatis per BPJS/Asuransi/Umum (A/PA/U), reset harian |
| Kiosk cetak nomor | ✅ | Halaman publik `/antrian/[code]/ambil` → cetak tiket |
| Papan display + suara | ✅ | `/antrian/[code]/display` — now serving + TTS "harap menuju counter…" |
| Panel panggil staf | ✅ | Panggil berikutnya per counter, panggil ulang, selesai, lewati |
| Status kunjungan | ✅ | Menunggu → Diperiksa → Selesai |
| Pendaftaran kunjungan (tiket → encounter) | ✅ | Daftar tiket dipanggil jadi kunjungan (encounter) |
| Jadwal praktik dokter | ✅ | Jam praktik mingguan per dokter; booking di luar jam ditolak |
| Appointment/janji temu | ✅ | Booking janji temu pasien + dokter, lihat §11 |

---

## 5. Resep & Farmasi 🟡 P1

Stok obat dikelola **per tenant** (tiap apotek/RS punya stok sendiri).

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Resep elektronik | ✅ | Dokter menulis resep digital di `/dashboard/rekam-medis/[id]` |
| Master data obat | ✅ | Katalog obat (master bersama) |
| Stok obat per tenant | ✅ | Jumlah & harga stok di tiap fasilitas |
| Riwayat pengobatan | ✅ | Obat yang pernah diberikan (di profil pasien) |
| Cetak resep | ✅ | Format resep siap cetak (`/resep`) |

---

## 6. Rekanan & Transfer Obat Antar-Fasilitas 🟡 P1 ⭐ (fitur utama baru)

Skenario: **RS A** butuh obat (mis. obat kaki) yang tidak tersedia di stoknya, namun tersedia di **Apotek B** yang merupakan **rekanannya**. RS A membuat order ke Apotek B, lalu prosesnya **dilacak (tracking)** sampai obat diterima.

### 6.1 Manajemen Rekanan (Partnership)

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Ajukan rekanan | ✅ | Tenant mengundang tenant lain jadi rekanan (`/dashboard/rekanan`) |
| Setujui/tolak rekanan | ✅ | Tenant tujuan menerima/menolak ajakan |
| Daftar rekanan | ✅ | Lihat & kelola rekanan aktif |
| Putus rekanan | ✅ | Nonaktifkan hubungan rekanan |

### 6.2 Order & Transfer Obat

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Cari stok obat di rekanan | ✅ | Lihat ketersediaan obat di apotek/RS rekanan |
| Buat order obat | ✅ | Pesan 1+ jenis obat ke rekanan (multi-item) di `/dashboard/transfer-obat` |
| Konfirmasi/tolak order | ✅ | Penyedia (Apotek B) menyetujui & menyiapkan / menolak |
| **Tracking status order** | ✅ | Pelacakan tahap demi tahap (timeline) |
| Penerimaan obat | ✅ | Pemohon konfirmasi terima → stok bertambah otomatis |
| Riwayat order (masuk & keluar) | ✅ | Daftar order yang dikirim & diterima per tenant |
| Pembatalan order | ✅ | Batalkan sebelum dikirim |
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

## 7. Billing & Penunjang 🟡 P1

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Tarif tindakan | 🟢 P2 | Master tarif layanan (per tenant) |
| Tagihan & pembayaran | ✅ | Invoice per pasien/kunjungan — lihat §11 (Billing/Tagihan) |
| Order lab/radiologi | ✅ | Permintaan pemeriksaan penunjang (Lab/Radiologi) — `/dashboard/penunjang` |
| Input hasil lab | ✅ | Input hasil per pemeriksaan + tanda (Normal/Rendah/Tinggi/Abnormal), status REQUESTED→IN_PROGRESS→COMPLETED, cetak hasil |

---

## 8. Dashboard & Laporan 🟡 P1

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Dashboard ringkasan (per tenant) | 🔴 P0 | Statistik kunjungan, order obat masuk/keluar |
| Statistik diagnosa | 🟡 P1 | Diagnosa terbanyak |
| Laporan kunjungan | ✅ | Per periode (`/dashboard/laporan`) |
| Laporan transfer obat | ✅ | Order keluar/masuk + status |
| Export PDF/Excel | ✅ | Unduh laporan (export CSV + cetak/PDF) |

---

## 9. Fitur Lanjutan 🟢 P2

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Notifikasi email | ✅ | Pengingat janji temu, hasil lab siap + log pengiriman (`/dashboard/notifikasi`) |
| Notifikasi WhatsApp | 🟢 P2 | Kanal WhatsApp (butuh provider) |
| Telemedicine | 🟢 P2 | Konsultasi online |
| Cetak surat | 🟢 P2 | Rujukan, ket. sakit, resume medis |
| Integrasi SATUSEHAT | 🟢 P2 | Interoperabilitas Kemenkes |
| Pembayaran antar-tenant | 🟢 P2 | Settlement transaksi transfer obat |

---

## 10. Shared API (Integrasi Pihak Ketiga) 🟢 P2

API publik **per tenant** agar sistem eksternal (SIM-RS lain, aplikasi mitra) bisa terintegrasi. Detail teknis: lihat **[SHARED_API.md](./SHARED_API.md)**.

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Kelola API Key | ✅ | Buat/cabut API key per tenant + mode LIVE/TEST, token tampil sekali (OWNER/ADMIN) |
| Scope & izin granular | ✅ | Batasi key per resource (`patients:read`, `encounters:read`, dst) → 403 jika kurang |
| Endpoint publik `/api/v1` | ✅ | `GET /me`, `/patients`, `/patients/{id}`, `/encounters` (tenant-scoped, paginasi) |
| Rate limiting | ✅ | 60 req/menit per key + header `X-RateLimit-*` → 429 |
| Log pemakaian API | ✅ | Audit setiap request (key, endpoint, status, latency) + tampilan pemakaian |
| Webhook | 🔜 P2 | Notifikasi event ke sistem luar (HMAC + retry) — model siap, butuh worker |
| Portal/dokumentasi developer | 🟢 P2 | OpenAPI/Swagger + kelola webhook + idempotency-key |

> Penting: API key **tidak menembus** isolasi tenant maupun consent (akses pasien lintas tenant & rekanan tetap berlaku).

---

## 11. Billing / Tagihan 🟡 P1 ✅

Pembuatan invoice tagihan per pasien (opsional terkait kunjungan/encounter). Nilai uang disimpan sebagai **integer rupiah** (tanpa desimal). Halaman: `/dashboard/billing`, detail `/dashboard/billing/[id]`, cetak `/dashboard/billing/[id]/cetak`.

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Buat invoice | ✅ | Invoice per pasien, opsional terkait kunjungan/encounter |
| Item biaya berkategori | ✅ | Kategori CONSULTATION/DRUG/PROCEDURE/LAB/OTHER, qty & harga satuan |
| Diskon & total otomatis | ✅ | Total = Σ item − diskon |
| Alur status | ✅ | DRAFT → UNPAID → PAID / CANCELLED |
| Nomor invoice | ✅ | `INV-YYYYMM-XXXXX`, unik per tenant |
| Cetak invoice | ✅ | Format invoice siap cetak (`/dashboard/billing/[id]/cetak`) |

**RBAC:** OWNER / ADMIN / RESEPSIONIS. Server actions: `createInvoice`, `addInvoiceItem`, `removeInvoiceItem`, `setDiscount`, `updateInvoiceStatus`.

---

## 12. Jadwal & Janji Temu (Appointment) 🟡 P1 ✅

Booking janji temu pasien dengan dokter. Halaman: `/dashboard/jadwal`.

| Fitur | Prioritas | Deskripsi |
|-------|:---:|-----------|
| Booking janji temu | ✅ | Pasien + dokter + tanggal/jam + durasi + keperluan |
| Filter daftar | ✅ | Hari ini / Mendatang / Semua |
| Alur status | ✅ | SCHEDULED → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW |
| Mulai Kunjungan | ✅ | Buat Encounter dari appointment (dokter & pasien otomatis), tandai COMPLETED + tautkan `encounterId` |

**RBAC:** OWNER / ADMIN / RESEPSIONIS / DOKTER / PERAWAT. Server actions: `createAppointment`, `updateAppointmentStatus`, `startVisit`.

> Catatan: saat ini "jadwal dokter" berupa daftar janji temu terfilter; template ketersediaan dokter berulang (recurring availability) belum ada — lihat `TECH_DEBT.md`.

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
