# 🗺️ Roadmap Pengembangan — SmaraMedika

Roadmap bertahap agar aplikasi bisa dikembangkan & dirilis secara inkremental.

---

## ✅ Fase 0 — Perencanaan (Selesai)
- [x] Penentuan nama & branding (SmaraMedika)
- [x] Dokumentasi fitur, arsitektur, database, API
- [x] Penentuan tech stack

---

## 🚧 Fase 1 — Fondasi & Setup
**Target: project siap dikembangkan**

- [ ] `git init` + struktur repo
- [ ] Scaffold Next.js + TypeScript + Tailwind
- [ ] Setup shadcn/ui
- [ ] Setup Prisma + koneksi PostgreSQL
- [ ] Konfigurasi ESLint + Prettier
- [ ] Setup Auth.js (struktur dasar)
- [ ] Layout dasar (sidebar, header, navigasi)
- [ ] `.env.example` + dokumentasi setup

---

## 🎯 Fase 2 — MVP (Fitur Inti P0)
**Target: klinik bisa pakai untuk pencatatan dasar**

- [ ] **Auth & RBAC**
  - [ ] Login/logout
  - [ ] Middleware proteksi route
  - [ ] Role-based access (5 peran)
  - [ ] Audit log dasar
- [ ] **Manajemen User** (CRUD oleh admin)
- [ ] **Manajemen Pasien**
  - [ ] Registrasi (No. RM otomatis)
  - [ ] Daftar + pencarian
  - [ ] Detail & edit
- [ ] **Rekam Medis**
  - [ ] Buat kunjungan
  - [ ] Form SOAP
  - [ ] Tanda vital
  - [ ] Diagnosa ICD-10
  - [ ] Riwayat alergi
- [ ] **Dashboard** ringkasan
- [ ] Seed data + ICD-10 dasar

---

## 🔜 Fase 3 — Operasional Klinik (P1)
**Target: alur kerja klinik harian**

- [ ] Antrian & pendaftaran kunjungan
- [ ] Status kunjungan (menunggu → diperiksa → selesai)
- [ ] Jadwal praktik dokter
- [ ] Resep elektronik + master obat
- [ ] Riwayat pengobatan
- [ ] Cetak resep & resume medis
- [ ] Laporan kunjungan + export PDF/Excel
- [ ] Lupa password (email)

---

## 🌟 Fase 4 — Lanjutan (P2)
**Target: fitur bernilai tambah**

- [ ] Billing & tagihan
- [ ] Order lab/radiologi + input hasil
- [ ] Manajemen stok obat
- [ ] Appointment/booking online
- [ ] Notifikasi WhatsApp/email
- [ ] Telemedicine
- [ ] Multi-cabang
- [ ] Integrasi SATUSEHAT (Kemenkes)
- [ ] Integrasi BPJS

---

## 🧪 Lintas-Fase (Continuous)
- [ ] Unit test (Vitest) untuk service layer
- [ ] E2E test (Playwright) untuk alur kritis
- [ ] CI/CD pipeline
- [ ] Audit keamanan berkala
- [ ] Strategi backup database

---

## Estimasi Prioritas Pengerjaan

```
Fase 1 (Setup)  →  Fase 2 (MVP)  →  Fase 3 (Operasional)  →  Fase 4 (Lanjutan)
   fondasi          bisa dipakai        klinik harian          nilai tambah
```

> Rekomendasi: rilis internal/uji coba setelah **Fase 2**, lalu iterasi berdasarkan feedback pengguna nyata.
