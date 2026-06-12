# 🛠️ Tech Debt & Keputusan Teknis — SmaraMedika

Dokumen ini melacak **utang teknis (tech debt)**, **keputusan yang ditunda**, dan **trade-off** yang diambil selama pengembangan. Tujuannya agar keputusan "sementara" tidak terlupakan.

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

### TD-005 · 🔴 · Dampak: Rendah — Belum ada test coverage
MVP fokus fitur; test otomatis menyusul.
**Rencana:** Tambah Vitest untuk service layer & Playwright untuk alur kritis (login, buat pasien, buat rekam medis).

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

---

## ⚠️ Risiko yang Harus Diperhatikan

| Risiko | Mitigasi |
|--------|----------|
| Kebocoran data medis | Enkripsi, RBAC ketat, audit log, HTTPS |
| Kebocoran data antar tenant | Filter `tenantId` wajib, helper tenant-scoped, test isolasi |
| Transisi status order tidak valid | State machine eksplisit + validasi sisi |
| Stok tidak konsisten saat transfer | Operasi atomik (`$transaction`) |
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
