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

---

## ⚠️ Risiko yang Harus Diperhatikan

| Risiko | Mitigasi |
|--------|----------|
| Kebocoran data medis | Enkripsi, RBAC ketat, audit log, HTTPS |
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
