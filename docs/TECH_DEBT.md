# 🛠️ Tech Debt & Keputusan Teknis — SmaraMedika

Dokumen ini melacak **utang teknis (tech debt)**, **keputusan yang ditunda**, dan **trade-off** yang diambil selama pengembangan. Tujuannya agar keputusan "sementara" tidak terlupakan.

---

## 🔄 Pembaruan status (implementasi)

- ✅ **Ditangani sebagian:** audit log dasar pada operasi pasien/farmasi/antrian (TD-001 lanjut);
  No. RM via `$transaction` (TD-006); soft delete pasien (`deletedAt`) (TD-003).
- 🟡 **Masih relevan:** isolasi tenant bergantung filter `tenantId` manual (TD-008); ICD-10 subset (TD-002);
  file storage & lampiran (TD-004); test coverage (TD-005); CI/CD (TD-020); paginasi UI (TD-022).
- 🆕 **Shared API sudah dibangun** (API key + `/api/v1` + scope + rate limit + log); sisa TD-013 (rate limit → Redis),
  TD-014 (webhook belum terkirim), TD-015 (volume log), TD-016 (versioning). Reset kata sandi jalan tetapi
  email belum ada (TD-017, mode dev).
- 🆕 **Baru — UI:** base-ui **`DropdownMenu`** belum dipakai di topbar (tenant/user) karena belum bisa
  diverifikasi membuka via harness preview otomatis; sementara pakai dropdown custom yang teruji.
  Migrasi DropdownMenu menyusul setelah dicek manual.
- 🆕 **Keputusan:** Prisma di-pin **v6** (v7 mewajibkan driver adapter); Next 16 pakai **`proxy.ts`**
  (gantikan `middleware`); UI memakai **shadcn (base-ui)**.

---

## Format Entri

Setiap item: **Status** · **Dampak** · **Deskripsi** · **Rencana**

- Status: 🔴 Belum ditangani · 🟡 Sedang ditangani · 🟢 Selesai
- Dampak: Tinggi / Sedang / Rendah

---

## 📌 Tech Debt Aktif

### TD-001 · 🔴 · Dampak: Tinggi — Audit log belum lengkap
Pada MVP, audit log mungkin hanya mencakup operasi utama. Akses-baca (READ) data sensitif perlu dicatat untuk kepatuhan penuh.
**Rencana:** Lengkapi pencatatan READ pada Fase 3, buat helper `withAudit()` yang konsisten.

### TD-002 · 🔴 · Dampak: Sedang — Data ICD-10 terbatas
MVP kemungkinan hanya memuat subset kode ICD-10 (yang umum). Belum mencakup keseluruhan + pencarian fuzzy.
**Rencana:** Import dataset ICD-10 lengkap + full-text search PostgreSQL.

### TD-003 · 🔴 · Dampak: Sedang — Belum ada soft delete
Skema awal mungkin pakai hard delete. Data medis idealnya tidak dihapus permanen.
**Rencana:** Tambahkan `deletedAt` + filter global sebelum rilis produksi.

### TD-004 · 🔴 · Dampak: Sedang — File storage lokal
Lampiran (hasil lab/rontgen) mungkin awalnya disimpan lokal. Tidak skalabel & berisiko.
**Rencana:** Migrasi ke S3-compatible storage pada Fase 3.

### TD-005 · 🔴 · Dampak: **Tinggi** — Belum ada test coverage (0 file test)
MVP fokus fitur; **belum ada satu pun file test** otomatis. Server actions & alur kritis (auth, total billing, transfer stok, status lab) rawan regresi.
**Rencana:** Tambah **Vitest** untuk unit/integration server actions & helper, **Playwright** untuk alur kritis E2E (login, buat pasien, buat rekam medis, hitung total invoice, transfer obat, status lab). Sertakan test khusus **isolasi tenant** (lihat TD-008).

### TD-006 · 🔴 · Dampak: Sedang — Penomoran MR & race condition
Generate No. RM perlu transaction agar tidak duplikat saat registrasi bersamaan.
**Rencana:** Implementasi dengan Prisma `$transaction` + unique constraint sebagai pengaman.

### TD-007 · 🔴 · Dampak: Rendah — i18n belum disiapkan
UI hardcoded bahasa Indonesia. Belum ada struktur multi-bahasa.
**Rencana:** Pertimbangkan `next-intl` bila dibutuhkan ekspansi.

### TD-008 · 🔴 · Dampak: **Tinggi** — Risiko kebocoran data antar tenant
Isolasi multi-tenant bergantung pada filter `tenantId` di setiap query. Lupa satu filter = data bocor ke tenant lain.
**Rencana:** Bungkus akses Prisma dengan helper `tenantScoped()` / Prisma extension yang otomatis menyuntikkan `tenantId`. Tambah test khusus isolasi tenant.

### TD-009 · 🔴 · Dampak: Sedang — Transisi status order belum ada state machine
Perubahan status DrugOrder rawan transisi tidak valid (mis. langsung RECEIVED tanpa SHIPPED).
**Rencana:** Implementasi validasi state machine eksplisit + cek sisi (requester vs supplier) per transisi.

### TD-010 · 🔴 · Dampak: Sedang — Konsistensi stok saat transfer
Pengurangan/penambahan stok saat kirim & terima harus atomik agar stok tidak salah.
**Rencana:** Gunakan `$transaction` + pengecekan stok; tangani race condition order paralel.

### TD-011 · 🔴 · Dampak: Sedang — Cakupan & masa berlaku akses pasien
PatientAccessRequest yang disetujui perlu cakupan (data apa saja) & kedaluwarsa yang jelas, plus pencabutan (revoke).
**Rencana:** Definisikan scope & `expiresAt`; jadwalkan auto-expire; catat akses di audit log.

### TD-012 · 🔴 · Dampak: **Tinggi** — Keamanan & rotasi API key (Shared API)
Secret key wajib di-hash & hanya tampil sekali; kebocoran key = risiko akses data tenant. Rotasi/revokasi harus cepat.
**Rencana:** Hash secret (argon2), simpan hanya `prefix`; dukung rotasi + grace period; revoke instan; opsi IP allowlist & `expiresAt`. Lihat `SHARED_API.md`.

### TD-013 · 🔴 · Dampak: Sedang — Infrastruktur rate limiting
Rate limit in-memory tidak konsisten di multi-instance (skala horizontal).
**Rencana:** Mulai in-memory (single instance), pindah ke **Redis** (token bucket/sliding window) saat scale-out.

### TD-014 · 🔴 · Dampak: Sedang — Keandalan webhook
Pengiriman webhook bisa gagal (consumer down). Tanpa retry/dead-letter, event hilang.
**Rencana:** Queue + retry exponential backoff + dead-letter + halaman status pengiriman (`WebhookDelivery`). HMAC signature wajib.

### TD-015 · 🔴 · Dampak: Rendah — Volume ApiRequestLog
Log pemakaian API bisa tumbuh sangat besar.
**Rencana:** Kebijakan retensi, partisi/arsip, atau ringkasan agregat; hindari simpan payload penuh.

### TD-016 · 🔴 · Dampak: Sedang — Versioning & kompatibilitas Public API
Perubahan kontrak `/v1` berisiko merusak integrasi mitra.
**Rencana:** Kontrak OpenAPI sebagai sumber kebenaran; kebijakan deprecation + header `Sunset`; uji kontrak.

### TD-017 · 🔴 · Dampak: Sedang — Pengiriman email belum ada (reset kata sandi mode dev)
Alur lupa/reset kata sandi sudah jalan, tetapi **belum ada layanan email**. Untuk sementara tautan reset ditampilkan langsung di layar (**MODE DEV**), yang tidak aman untuk produksi.
**Rencana:** Integrasi penyedia email (Resend/SMTP) yang juga akan dipakai untuk **Notifikasi (#15)**; kirim tautan reset via email & hentikan tampilan tautan di layar.

### TD-018 · 🔴 · Dampak: Rendah — Uang Billing disimpan sebagai integer rupiah
Nilai uang di Billing (`Invoice`, `InvoiceItem`) disimpan sebagai **Int rupiah** (tanpa desimal). Cukup untuk rupiah, tetapi kaku bila ada pembulatan/sen, mata uang lain, atau perhitungan pajak yang butuh presisi.
**Rencana:** Pertimbangkan tipe `Decimal` / penanganan mata uang khusus bila kebutuhan bertambah.

### TD-019 · 🔴 · Dampak: Rendah — Jadwal dokter belum ada template ketersediaan berulang
"Jadwal dokter" saat ini berupa **daftar appointment terfilter** (Hari ini/Mendatang/Semua). Belum ada template ketersediaan dokter berulang (recurring availability / jam praktik), sehingga konflik & slot kosong tidak terkelola otomatis.
**Rencana:** Tambah model jadwal praktik/ketersediaan berulang + validasi slot saat booking.

### TD-020 · 🔴 · Dampak: Sedang — Belum ada CI/CD
Belum ada pipeline otomatis. Lint/build/test serta validasi Prisma dijalankan manual, rawan regresi terlewat saat merge.
**Rencana:** GitHub Actions: `lint` + `build` + `test` + `prisma validate` (dan `prisma migrate diff` opsional) pada setiap PR ke `develop`/`main`.

### TD-021 · 🔴 · Dampak: Rendah — Seed data belum mencakup modul baru
`prisma/seed.ts` belum memuat contoh untuk modul yang lebih baru (billing/invoice, appointment, order lab, API key), sehingga demo kurang lengkap untuk fitur tersebut.
**Rencana:** Lengkapi seed agar tiap modul punya data contoh (invoice + item, appointment, lab order + hasil, API key TEST) untuk demo & test E2E.

### TD-022 · 🔴 · Dampak: Sedang — Belum ada paginasi UI di sebagian daftar
Daftar seperti pasien, invoice, dan lab saat ini fetch terbatas (`take`) atau tanpa kontrol halaman. Pada data besar, sebagian record tak terlihat dan tak ada navigasi halaman.
**Rencana:** Tambah paginasi (cursor/offset) + kontrol halaman pada daftar utama; selaraskan dengan paginasi yang sudah ada di Shared API `/api/v1`.

### TD-023 · 🔴 · Dampak: Rendah — Umpan balik error Server Action terbatas
Sebagian Server Action `return` diam saat gagal guard (RBAC/validasi), tanpa pesan jelas ke pengguna. Kegagalan bisa tampak seperti "tidak terjadi apa-apa".
**Rencana:** Standarkan hasil action (sukses/gagal + pesan) dan tampilkan via toast/notifikasi di UI; konsistenkan penanganan error.

### TD-024 · 🔴 · Dampak: Rendah — Belum ada viewer audit log di UI
Audit log sudah tercatat di database, tetapi belum ada halaman untuk melihat/menelusuri (filter per user/aksi/entitas/waktu) dari UI.
**Rencana:** Tambah halaman lihat audit log (read-only, terfilter) untuk OWNER/ADMIN; pertimbangkan ekspor.

---

## 🧭 Keputusan Teknis (ADR Ringkas)

### Mengapa Next.js full-stack (bukan API terpisah)?
Tim kecil + skala klinik → monolith lebih sederhana, type-safe end-to-end, satu deployment. Bila skala membesar, API bisa dipecah nanti.

### Mengapa Prisma (bukan query SQL langsung / Drizzle)?
Type-safety, migrasi mudah, developer experience baik. Trade-off: sedikit overhead & kurang kontrol untuk query sangat kompleks (bisa pakai raw query bila perlu).

### Mengapa PostgreSQL (bukan MySQL/MongoDB)?
Relasional kuat (data medis sangat relasional), ACID, dukungan JSON, full-text search, andal.

### Mengapa shadcn/ui (bukan MUI/Chakra)?
Komponen di-copy ke repo (kontrol penuh), aksesibel, di atas Tailwind, tanpa lock-in.

### Mengapa multi-tenancy "shared DB + row-level (tenantId)" (bukan DB/schema per tenant)?
Paling sederhana dirawat & migrasi, cukup untuk skala target. Trade-off: isolasi bergantung pada disiplin query (lihat TD-008), bukan batas fisik DB. Bila ada tenant besar/regulasi khusus, bisa dipindah ke schema/DB terpisah nanti.

### Mengapa peran di Membership (bukan di User)?
Agar 1 user bisa punya peran berbeda di banyak tenant (mis. Dokter di RS A, Apoteker di Apotek B). Otorisasi = fungsi dari (tenant aktif, peran di tenant itu).

### Mengapa transfer obat hanya antar rekanan (bukan marketplace terbuka)?
Sesuai kebutuhan: lebih terkontrol, kepercayaan jelas, dan menghindari kompleksitas verifikasi/penyalahgunaan marketplace. Marketplace terbuka bisa dipertimbangkan di masa depan.

### Mengapa Shared API pakai API key (bukan OAuth2/OIDC penuh) di awal?
API key + scope jauh lebih sederhana untuk integrasi server-to-server mitra, cukup untuk kebutuhan awal. OAuth2/OIDC (alur user-delegated) bisa ditambahkan kemudian bila ada use case pihak ketiga yang bertindak atas nama user.

### Mengapa API key tenant-scoped & tidak menembus consent?
Menjaga model keamanan tetap konsisten: API hanyalah saluran lain ke data tenant. Isolasi antar tenant & consent (akses pasien lintas tenant, rekanan) tetap satu-satunya gerbang berbagi data — mencegah API jadi celah bypass.

### Mengapa webhook pakai HMAC signature?
Agar consumer dapat memverifikasi keaslian & integritas payload tanpa perlu memanggil balik API; sederhana, standar, dan tahan terhadap spoofing.

---

## ⚠️ Risiko yang Harus Diperhatikan

| Risiko | Mitigasi |
|--------|----------|
| Kebocoran data medis | Enkripsi, RBAC ketat, audit log, HTTPS |
| Kebocoran data antar tenant | Filter `tenantId` wajib, helper tenant-scoped, test isolasi |
| Transisi status order tidak valid | State machine eksplisit + validasi sisi |
| Stok tidak konsisten saat transfer | Operasi atomik (`$transaction`) |
| Kebocoran API key | Hash secret, rotasi/revoke cepat, IP allowlist, audit |
| Event webhook hilang | Retry + dead-letter + HMAC signature |
| Kehilangan data | Backup otomatis harian + uji restore |
| Race condition (No. RM, antrian) | Database transaction + unique constraint |
| Kepatuhan regulasi (UU PDP, RME) | Review hukum sebelum produksi |
| Scope creep | Patuhi roadmap bertahap, fokus MVP dulu |

---

## ✅ Definition of Done (DoD)

Sebuah fitur dianggap selesai bila:
- [ ] Berfungsi sesuai spesifikasi (lihat `FEATURES.md`)
- [ ] Input divalidasi (Zod) di server
- [ ] Otorisasi peran (RBAC) diterapkan
- [ ] Operasi pada data medis tercatat di audit log
- [ ] Tidak ada error lint/type
- [ ] Diuji manual (idealnya ada test otomatis)
