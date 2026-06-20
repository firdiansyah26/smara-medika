# 🗺️ Roadmap Pengembangan — SmaraMedika

Roadmap bertahap. Status diperbarui mengikuti implementasi nyata (branch `develop`).

> **Status ringkas (per update terakhir):** Fase 1 & 2 (MVP) **selesai**. Fase 3 **selesai sebagian besar**
> (Antrian, Farmasi master/stok, **rekanan & transfer obat + tracking**, **berbagi pasien lintas tenant**,
> **resep elektronik + cetak**, **riwayat pengobatan**, **laporan + export**, **undang/kelola anggota**,
> **lupa/reset kata sandi** mode dev). Fase 4 sebagian (**Billing/Tagihan** & **Appointment/Janji Temu**
> selesai). Tambahan: **migrasi UI penuh ke shadcn ui** & sistem **antrian** (kiosk cetak nomor, papan
> display + suara, panel panggil per counter). Sisa: Shared API publik, Lab/Radiologi, Notifikasi,
> Telemedicine, Integrasi SATUSEHAT/BPJS.

---

## ✅ Fase 0 — Perencanaan (Selesai)
- [x] Penentuan nama & branding (SmaraMedika)
- [x] Dokumentasi fitur, arsitektur, database, API
- [x] Penentuan tech stack

---

## ✅ Fase 1 — Fondasi & Setup (Selesai)
- [x] `git init` + struktur repo (workflow: fitur → PR → `develop`)
- [x] Scaffold Next.js 16 + TypeScript + Tailwind v4
- [x] Setup shadcn/ui (base-ui) + theme brand Teal
- [x] Setup Prisma v6 + koneksi PostgreSQL (+ snake_case via `@map`)
- [x] Konfigurasi ESLint
- [x] Setup Auth.js v5 (Credentials + bcrypt + Zod)
- [x] Layout dasar (sidebar, topbar, navigasi)
- [x] `.env.example` + script `db:setup`/`db:seed`

---

## ✅ Fase 2 — MVP (Selesai)
- [x] **Multi-Tenant**: Tenant, Membership, 1 user banyak tenant, tenant switcher, isolasi per `tenantId`
- [x] **Auth & RBAC**: login/logout, proteksi route (`proxy.ts`), RBAC per tenant, audit log
- [x] **Manajemen Pasien**: registrasi (No. RM otomatis), daftar+cari, detail, edit, soft-delete, alergi
- [x] **Rekam Medis**: buat kunjungan, SOAP, tanda vital (+ indikator klinis), diagnosa ICD-10
- [x] **Dashboard**: ringkasan + diagnosa terbanyak + filter periode
- [x] Seed data + subset ICD-10
- [x] **Manajemen anggota tenant** (undang: tautkan akun lama / buat akun baru + kata sandi awal; ubah peran inline; keluarkan; guard Pemilik terakhir)

---

## ✅ Fase 3 — Operasional & Jaringan (selesai sebagian besar)

**Operasional:**
- [x] **Antrian** — kiosk cetak nomor, papan display + suara (TTS), panel panggil per counter
- [x] **Farmasi**: master obat + stok per tenant (+ indikator stok menipis)
- [x] Status kunjungan (Menunggu → Diperiksa → Selesai)
- [ ] Pendaftaran kunjungan terhubung antrian (tiket → encounter)
- [ ] Jadwal praktik dokter (recurring availability) — *belum* (lihat `TECH_DEBT.md`)
- [x] **Resep elektronik + riwayat pengobatan + cetak resep**
- [x] **Laporan kunjungan & transfer obat + export CSV + cetak/PDF**
- [x] **Lupa & reset kata sandi** (mode dev: tautan tampil di layar; email menyusul)

**Berbagi pasien lintas tenant:**
- [x] **Pencarian lintas tenant (info terbatas) + permintaan/persetujuan akses** (`/dashboard/akses-pasien`)

**Rekanan & transfer obat (fitur unggulan):**
- [x] **Manajemen rekanan; cari stok rekanan; order multi-item; tracking; penerimaan → stok auto update**
  (`/dashboard/rekanan`, `/dashboard/transfer-obat`)

---

## 🌟 Fase 4 — Lanjutan (sebagian)
- [x] **Billing / Tagihan** — invoice per pasien, item berkategori, diskon, status DRAFT→UNPAID→PAID/CANCELLED, cetak (`/dashboard/billing`)
- [x] **Appointment / Janji Temu** — booking pasien+dokter, status flow, "Mulai Kunjungan" → Encounter (`/dashboard/jadwal`)
- [ ] Lab/radiologi
- [ ] Notifikasi WhatsApp/email · Telemedicine
- [ ] Integrasi SATUSEHAT & BPJS
- [ ] **Shared API** publik (lihat `SHARED_API.md`)

---

## 🎨 Lintas-fase — UI
- [x] Migrasi UI penuh ke **shadcn ui** (form, tabel, card, badge, shell, antrian)

## 🧪 Lintas-fase — Kualitas (belum)
- [ ] Unit test (Vitest) · E2E (Playwright) · CI/CD · backup terjadwal

---

> Pengembangan mengikuti **GitHub issues** (#1–#17 per modul + #27 UI). Branch fitur → PR ke
> `develop` → merge. `main` untuk rilis.
