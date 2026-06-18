# SmaraMedika 🩺

> **Smara** (Sanskerta: _smṛti_ — ingatan, sesuatu yang tercatat) + **Medika** (medis)
> — _"Catatan/ingatan medis"_

**SmaraMedika** adalah **platform Rekam Medis Elektronik (RME) multi-tenant** untuk jaringan fasilitas kesehatan — Rumah Sakit, Klinik, dan Apotek. Banyak fasilitas berada dalam satu platform dengan data terisolasi per fasilitas, namun bisa saling terhubung melalui **rekanan** untuk **transfer obat antar-fasilitas** dan **berbagi akses pasien** secara terkontrol.

**Sorotan:**

- 🏢 **Multi-tenant** — satu platform, banyak RS/Klinik/Apotek; 1 user bisa tergabung di banyak fasilitas
- 🔢 **Antrian lengkap** — kiosk cetak nomor, papan display bersuara (TTS), panel panggil per counter
- 🩻 **Rekam medis SOAP** + diagnosa ICD-10 + tanda vital dengan **indikator klinis** otomatis

> **Status:** MVP selesai (Auth, Multi-tenant, Pasien, Rekam Medis, Dashboard) + Antrian & Farmasi. Lihat [docs/ROADMAP.md](./docs/ROADMAP.md).

---

## 📚 Dokumentasi

Dokumentasi lengkap ada di folder [`docs/`](./docs/README.md):

| Dokumen | Isi |
| --- | --- |
| [Fitur](./docs/FEATURES.md) | Spesifikasi fitur + status implementasi |
| [Arsitektur](./docs/ARCHITECTURE.md) | Tech stack, struktur, pola |
| [Database](./docs/DATABASE.md) | Skema database & relasi |
| [API](./docs/API.md) | Endpoint REST internal |
| [Shared API](./docs/SHARED_API.md) | API publik pihak ketiga (rencana) |
| [Roadmap](./docs/ROADMAP.md) | Status & rencana bertahap |
| [Tech Debt](./docs/TECH_DEBT.md) | Utang teknis & keputusan |
| [Keamanan](./docs/SECURITY.md) | Keamanan & kepatuhan |
| [Kontribusi](./docs/CONTRIBUTING.md) | Panduan kontribusi |

---

## ✨ Fitur (✅ selesai · 🔜 rencana)

- ✅ **Multi-Tenant & keanggotaan** — 1 user banyak tenant, tenant switcher, isolasi data per fasilitas
- ✅ **Autentikasi & RBAC** — login (Auth.js), proteksi route, peran per tenant, audit log
- ✅ **Manajemen Pasien** — registrasi (No. RM otomatis), cari, detail, edit, soft-delete, alergi
- ✅ **Rekam Medis** — kunjungan, SOAP, diagnosa ICD-10, tanda vital + **indikator klinis**
- ✅ **Dashboard** — ringkasan, diagnosa terbanyak, filter periode
- ✅ **Antrian** — kiosk cetak nomor, papan display + suara, panel panggil per counter (BPJS/Asuransi/Umum)
- ✅ **Farmasi** — master obat + stok per tenant (indikator stok menipis)
- ✅ **UI** — komponen **shadcn ui**, dwibahasa **ID/EN**
- 🔜 **Rekanan & transfer obat** antar fasilitas (dengan tracking)
- 🔜 **Berbagi pasien lintas tenant** (pencarian + persetujuan akses)
- 🔜 **Resep elektronik**, laporan & export, billing, lab/radiologi
- 🔜 **Shared API** publik (API key, scope, webhook) — lihat `docs/SHARED_API.md`

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) + React 19 — full-stack |
| **Bahasa** | TypeScript |
| **API** | Route Handlers + Server Actions |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) (nama tabel/kolom snake_case) |
| **ORM** | [Prisma v6](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Komponen UI** | [shadcn/ui](https://ui.shadcn.com/) (base-ui) + lucide-react |
| **Autentikasi** | [Auth.js v5](https://authjs.dev/) (Credentials + bcryptjs) |
| **Validasi** | [Zod](https://zod.dev/) |
| **i18n** | hook ringan + localStorage (ID/EN) |

---

## 🚀 Memulai (Getting Started)

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+ (berjalan lokal)

### Instalasi

```bash
# 1. Clone
git clone https://github.com/firdiansyah26/smara-medika.git
cd smara-medika

# 2. Dependencies
npm install

# 3. Environment — salin & sesuaikan DATABASE_URL + AUTH_SECRET
cp .env.example .env

# 4. Setup database (buat DB jika belum ada → migrasi → seed)
npm run db:setup
#   atau manual: npx prisma migrate dev && npm run db:seed

# 5. Jalankan
npm run dev
```

Aplikasi di [http://localhost:3000](http://localhost:3000).

**Akun demo (dari seed):** `andi@sehatsentosa.id` / `password123`

**Halaman publik antrian** (ganti `RSSS` dengan kode tenant):

- Kiosk cetak nomor: `/antrian/RSSS/ambil`
- Papan display: `/antrian/RSSS/display`

### Contoh `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smaramedika?schema=public"
AUTH_SECRET="ganti-dengan-secret-acak"   # openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

### Script berguna

```bash
npm run dev          # dev server
npm run build        # build produksi
npm run lint         # eslint
npm run db:migrate   # prisma migrate dev
npm run db:seed      # isi data contoh
npm run db:studio    # Prisma Studio
```

---

## 📂 Struktur Proyek

```
src/
├── app/
│   ├── login/                 # halaman login
│   ├── antrian/[code]/        # kiosk & display (publik)
│   ├── dashboard/             # area terproteksi
│   │   ├── pasien/  rekam-medis/  antrian/  farmasi/  ...
│   │   └── actions.ts         # server actions (tenant, logout)
│   └── api/                   # route handlers (auth, icd, antrian)
├── components/
│   ├── ui/                    # komponen shadcn
│   ├── app-shell.tsx  landing.tsx  logo.tsx  ...
├── lib/                       # db, auth-types, i18n, queue, vitals, utils
├── auth.ts  auth.config.ts    # Auth.js (Node + edge-safe)
├── proxy.ts                   # proteksi route (Next 16, gantikan middleware)
prisma/                        # schema.prisma, migrations, seed.ts
```

---

## 🔒 Keamanan & Kepatuhan

- 🔐 Password ter-hash (bcrypt) · 📝 audit log · 🔑 RBAC per tenant · 🧱 isolasi data per `tenantId`
- Mengacu pada **UU No. 27/2022 (PDP)** & **Permenkes** tentang Rekam Medis Elektronik (RME). Lihat [docs/SECURITY.md](./docs/SECURITY.md).

---

## 🗺️ Roadmap

- [x] Perencanaan + scaffold + fondasi (Next.js 16, Prisma, Auth.js, shadcn)
- [x] **MVP**: Auth & RBAC, Multi-tenant, Manajemen Pasien, Rekam Medis SOAP (+ indikator vital), Dashboard
- [x] **Operasional (sebagian)**: Antrian (kiosk/display/suara), Farmasi (stok)
- [ ] Berikutnya: rekanan & transfer obat, berbagi pasien lintas tenant, resep, laporan, Shared API

Status detail: [docs/ROADMAP.md](./docs/ROADMAP.md).

---

## 🤝 Kontribusi

Development mengikuti **GitHub issues**; branch fitur → PR ke `develop` → merge. Lihat [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md).

---

## 📄 Lisensi

[MIT License](LICENSE).

---

<p align="center">Dibuat dengan ❤️ untuk pelayanan kesehatan yang lebih baik di Indonesia</p>
