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
**Target: beberapa fasilitas bisa beroperasi mandiri di satu platform**

- [ ] **Multi-Tenant (fondasi)**
  - [ ] Model Tenant + tipe (RS/Klinik/Apotek)
  - [ ] Membership (user ↔ tenant, peran per tenant)
  - [ ] 1 user bisa di banyak tenant
  - [ ] Tenant switcher (pilih tenant aktif)
  - [ ] Isolasi data per `tenantId` (tenant context + scoping)
- [ ] **Auth & RBAC**
  - [ ] Login/logout
  - [ ] Middleware proteksi route
  - [ ] Role-based access per tenant (6 peran: Owner/Admin/Dokter/Perawat/Resepsionis/Apoteker)
  - [ ] Audit log dasar (per tenant)
- [ ] **Manajemen Anggota Tenant** (undang + atur peran)
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

## 🔜 Fase 3 — Operasional & Jaringan Antar-Fasilitas (P1) ⭐
**Target: alur kerja harian + fitur jaringan (rekanan, transfer obat, berbagi pasien)**

**Operasional klinik:**
- [ ] Antrian & pendaftaran kunjungan
- [ ] Status kunjungan (menunggu → diperiksa → selesai)
- [ ] Jadwal praktik dokter
- [ ] Resep elektronik + master obat + stok per tenant
- [ ] Riwayat pengobatan
- [ ] Cetak resep & resume medis
- [ ] Laporan kunjungan + export PDF/Excel
- [ ] Lupa password (email)

**Berbagi pasien lintas tenant:**
- [ ] Pencarian pasien lintas tenant (info terbatas)
- [ ] Permintaan akses detail pasien
- [ ] Persetujuan/penolakan akses oleh tenant pemilik

**Rekanan & transfer obat (fitur unggulan):**
- [ ] Manajemen rekanan (ajukan/setujui/putus)
- [ ] Cari stok obat di rekanan
- [ ] Buat order transfer obat (multi-item)
- [ ] Konfirmasi/tolak order oleh penyedia
- [ ] Tracking status order (timeline lengkap)
- [ ] Penerimaan obat → stok bertambah otomatis
- [ ] Riwayat & laporan transfer obat

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
