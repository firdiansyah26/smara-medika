# 🏗️ Arsitektur — SmaraMedika

## Gambaran Umum

SmaraMedika adalah aplikasi **full-stack monolith multi-tenant** berbasis **Next.js (App Router)**, di mana frontend dan backend API berada dalam satu codebase. Satu instance melayani **banyak fasilitas** (RS/klinik/apotek) dengan data terisolasi per fasilitas. Pendekatan ini dipilih karena:
- Lebih sederhana untuk dikembangkan & di-deploy (satu repo, satu proses)
- Type-safety end-to-end (TypeScript + Prisma + Zod)
- Cocok untuk tim kecil & skala klinik hingga jaringan fasilitas

```
┌──────────────────────────────────────────────────┐    ┌──────────────────────┐
│                    Browser (Client)                │    │  Klien eksternal/mitra │
│         React Components + Tailwind + shadcn/ui     │    │   (server-to-server)   │
└───────────────────────┬───────────────────────────┘    └───────────┬──────────┘
                        │ HTTP (fetch / Server Actions)                │ Bearer API key
┌───────────────────────▼───────────────────────────────────────────▼──────────┐
│                            Next.js (App Router)                                 │
│  ┌──────────────────────────────────────────────┐                             │
│  │ proxy.ts — gerbang auth rute /dashboard (edge) │                             │
│  └──────────────────────────────────────────────┘                             │
│  ┌──────────────┐  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │ Server        │  │ Server Actions      │  │ Route Handlers (/api/*)      │  │
│  │ Components    │  │ — mutasi (Node.js)  │  │ — auth, icd, antrian, /v1/*  │  │
│  └──────────────┘  └─────────────────────┘  └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ lib/ — tenant-context, audit, api-auth (scope/rate-limit/log), validasi Zod││
│  └──────────────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Prisma ORM                                                                 ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────┬────────────────────────────────────────────┘
                                    │ SQL
┌───────────────────────────────────▼────────────────────────────────────────────┐
│                                 PostgreSQL                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Lapisan | Pilihan | Catatan |
|---------|---------|--------|
| Framework | **Next.js 16 (App Router)** | Full-stack, SSR, RSC. Konvensi `middleware` → **`proxy.ts`** |
| Bahasa | **TypeScript** + **React 19** | Type safety |
| API | **Route Handlers** + **Server Actions** | mutasi via Server Action |
| Database | **PostgreSQL 16** | nama tabel/kolom **snake_case** via `@map`/`@@map` |
| ORM | **Prisma v6** | (v7 ditunda — butuh driver adapter) |
| Styling | **Tailwind CSS v4** | konfigurasi CSS-first (`@theme`) |
| Komponen UI | **shadcn/ui (base-ui)** | theme dipetakan ke brand Teal |
| Auth | **Auth.js v5** (Credentials + **bcryptjs**) | config split edge-safe (`auth.config.ts`) + Node (`auth.ts`) |
| Validasi | **Zod** | dipakai di Server Actions |
| i18n | hook `useLocale` + localStorage | ID/EN (tanpa next-intl) |
| Ikon | **lucide-react** | dari shadcn |
| Linting | **ESLint** | — |
| Testing | Vitest + Playwright | *belum dipasang* |

> **Catatan auth/edge:** `auth.config.ts` (tanpa Prisma/bcrypt) dipakai `proxy.ts` (edge) untuk proteksi rute; provider Credentials (Prisma+bcrypt) ada di `auth.ts` (Node). Keanggotaan tenant dibawa di JWT/session; `getActiveTenant()` membaca sesi + cookie `smara-active-tenant`.

---

## Struktur Folder

> **Catatan:** struktur nyata **tidak** memakai route group `(auth)`/`(dashboard)` maupun folder
> `services/`/`types/`. Business logic tinggal di **Server Actions** (`actions.ts` per modul) + helper
> `src/lib/`. Proteksi rute memakai **`src/proxy.ts`** (bukan `middleware.ts`).

```
smaramedika/
├── prisma/
│   ├── schema.prisma            # Skema database (29 model)
│   ├── migrations/              # init, queue, billing, appointment,
│   │                           #   password_reset, lab_radiology
│   └── seed.ts                  # Data awal
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing
│   │   ├── login/              # page.tsx + actions.ts
│   │   ├── forgot-password/    # page.tsx + actions.ts
│   │   ├── reset-password/     # page.tsx + reset-form.tsx + actions.ts
│   │   ├── antrian/[code]/
│   │   │   ├── ambil/          # kiosk ambil nomor (publik)
│   │   │   └── display/        # papan display + TTS (publik)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── icd/route.ts            # cari ICD-10
│   │   │   ├── antrian/[code]/state/route.ts
│   │   │   └── v1/                     # Shared API publik
│   │   │       ├── me/route.ts
│   │   │       ├── patients/route.ts
│   │   │       ├── patients/[id]/route.ts
│   │   │       └── encounters/route.ts
│   │   └── dashboard/                  # area terproteksi (+ actions.ts per modul)
│   │       ├── page.tsx                # dashboard home
│   │       ├── pasien/                 # page, baru, [id], [id]/edit
│   │       ├── rekam-medis/            # page, [id], [id]/resep
│   │       ├── antrian/                # panel panggil per counter
│   │       ├── jadwal/                 # Appointment / Janji Temu
│   │       ├── farmasi/                # master obat + stok
│   │       ├── transfer-obat/          # page, [id]
│   │       ├── rekanan/                # kemitraan
│   │       ├── akses-pasien/           # page, [id]
│   │       ├── billing/                # page, [id], [id]/cetak
│   │       ├── penunjang/              # Lab & Radiologi: page, [id], [id]/cetak
│   │       ├── laporan/                # laporan + export CSV/cetak
│   │       ├── shared-api/             # kelola API key + log
│   │       ├── pengaturan/             # kelola anggota tenant
│   │       └── notifikasi/ telemedicine/ integrasi/   # halaman "Soon"
│   ├── components/
│   │   ├── ui/                  # shadcn/ui (badge, button, card, dialog,
│   │   │                       #   dropdown-menu, input, label, select,
│   │   │                       #   separator, table)
│   │   ├── app-shell.tsx  landing.tsx  logo.tsx
│   │   ├── language-switcher.tsx
│   │   └── page-placeholder.tsx  coming-soon.tsx
│   ├── lib/
│   │   ├── db.ts                # Prisma client (singleton)
│   │   ├── auth-types.ts        # tipe sesi/membership
│   │   ├── tenant-context.ts    # getActiveTenant / konteks tenant
│   │   ├── audit.ts             # helper audit log
│   │   ├── i18n.ts  use-locale.ts  utils.ts
│   │   ├── icd10.ts  vitals.ts  queue.ts
│   │   ├── mr-number.ts  order-number.ts  invoice-number.ts  lab-number.ts
│   │   ├── reset-token.ts       # token reset kata sandi (SHA-256)
│   │   ├── api-auth.ts          # serveApi: API key + scope + rate-limit + log
│   │   └── schemas/            # Zod: patient.ts, drug.ts, encounter.ts
│   ├── auth.ts                  # Auth.js Node (provider Credentials + Prisma + bcrypt)
│   ├── auth.config.ts          # Auth.js edge-safe (tanpa Prisma/bcrypt)
│   └── proxy.ts                # proteksi rute (Next 16, gantikan middleware)
├── docs/                        # dokumentasi markdown
├── .env.example
└── package.json
```

---

## 🔄 Alur Request & Data

### Aplikasi internal (dashboard)
```
Browser
  → proxy.ts (gerbang auth: rute /dashboard wajib sesi; jika belum login → /login)
  → Server Component (render data) / Server Action (mutasi)
      • getActiveTenant() menentukan tenant aktif (sesi + cookie smara-active-tenant)
      • validasi input dengan Zod
      • cek RBAC (peran membership di tenant aktif)
      • catat audit log (operasi data medis: create/update/delete)
  → Prisma (query SELALU difilter tenantId aktif)
  → PostgreSQL
```
- **Read** dilakukan di Server Component (RSC), **mutasi** lewat Server Action (`actions.ts` per modul) — komponen UI tidak memanggil Prisma langsung.
- Beberapa halaman publik (kiosk `ambil`, papan `display`) tidak melewati gerbang auth `/dashboard`; statusnya diambil lewat `GET /api/antrian/[code]/state`.

### Shared API (publik `/api/v1`)
```
Klien eksternal (Bearer <API key>)
  → Route Handler /api/v1/*
  → serveApi() di lib/api-auth.ts:
      • verifikasi API key (hash) → tentukan tenant
      • cek scope yang diperlukan (mis. patients:read) → 403 bila kurang
      • rate limit per key (60 req/menit) → 429 + header X-RateLimit-*
      • catat ApiRequestLog (key, endpoint, status, latency)
  → Prisma (tetap tenant-scoped, tidak menembus consent)
  → PostgreSQL
```
> API key **tidak menembus** isolasi tenant maupun consent (akses pasien lintas tenant & rekanan tetap berlaku). Lihat `SHARED_API.md`.

---

## 🔐 Alur Autentikasi (Auth.js v5)

Konfigurasi Auth.js **di-split** agar aman dipakai di edge:

| Berkas | Runtime | Isi |
|--------|---------|-----|
| `src/auth.config.ts` | edge-safe | konfigurasi dasar + callback `authorized` (tanpa Prisma/bcrypt). Dipakai `proxy.ts` |
| `src/auth.ts` | Node.js | provider **Credentials** (Prisma lookup + `bcryptjs` compare), callback JWT/session |
| `src/proxy.ts` | edge | gerbang proteksi rute `/dashboard` (gantikan `middleware`) |

**Alur:**
1. User submit email+password → Server Action `login` → `signIn("credentials", …)`.
2. `auth.ts` mencari user via Prisma, verifikasi hash dengan bcrypt.
3. Callback **JWT** menanamkan daftar **memberships** (tenant + peran) ke token; **session** mengeksposnya ke server.
4. **Tenant aktif** dibaca `getActiveTenant()` dari sesi + cookie `smara-active-tenant` (tenant switcher menulis cookie ini).
5. Setiap request `/dashboard` melewati `proxy.ts`; jika tak ada sesi → redirect `/login`.

**Lupa/reset kata sandi:** token di-hash **SHA-256**, berlaku **1 jam** (`lib/reset-token.ts`). **MODE DEV:** tautan reset ditampilkan di layar (belum kirim email — lihat `TECH_DEBT.md`).

---

## 🏢 Multi-Tenancy

SmaraMedika menggunakan strategi **shared database, shared schema** dengan **row-level isolation** — yaitu setiap baris data operasional memiliki kolom `tenantId`. Ini paling sederhana untuk dirawat & cukup untuk skala target.

```
1 User ──< Membership >── N Tenant     (peran melekat pada Membership, bukan User)
```

### Konsep Inti
- **User** = akun global (login sekali). **Tenant** = fasilitas (RS/klinik/apotek).
- **Membership** menghubungkan user ↔ tenant dengan **peran per tenant**. Maka 1 user bisa jadi *Dokter di RS A* sekaligus *Apoteker di Apotek B*.
- **Tenant aktif**: setelah login, user memilih tenant yang sedang dipakai (tenant switcher). Tenant aktif disimpan di sesi/konteks.

### Tenant Context & Isolasi Data
- Setiap request membawa **tenant aktif** (dari sesi + cookie `smara-active-tenant`). Helper `getActiveTenant()` di `lib/tenant-context.ts` menyediakan `userId`, `tenantId`, dan `role`.
- **Aturan emas:** setiap query operasional WAJIB difilter `tenantId` aktif. Server Action/Server Component bertanggung jawab menerapkan filter ini — jangan pernah query tanpa scope tenant.
- Pengecualian terkontrol: **pencarian pasien lintas tenant** (hanya info terbatas) dan **transfer obat antar rekanan** — keduanya melalui jalur khusus dengan otorisasi tersendiri.

### Akses Lintas Tenant (Terkontrol)
- **Pasien:** dimiliki tenant pembuat. Tenant lain hanya melihat info terbatas via pencarian; detail butuh `PatientAccessRequest` yang disetujui pemilik.
- **Transfer obat:** hanya antar tenant yang berstatus rekanan `ACTIVE` (`TenantPartnership`).

### Implikasi RBAC
- Otorisasi = fungsi dari **(tenant aktif, peran di tenant itu)**.
- Cek di `proxy.ts` (akses rute `/dashboard`) **dan** di tiap Server Action/Route Handler (operasi). Lihat `SECURITY.md`.

---

## Pola & Konvensi

### Lapisan (Layering)
1. **UI (Components)** — hanya tampilan & interaksi
2. **Server Actions / Route Handlers** — entry point, validasi input (Zod), RBAC, business logic
3. **Helper `lib/`** — utilitas reusable (tenant-context, audit, api-auth, penomoran, dst)
4. **Data (Prisma)** — akses database

> Aturan: komponen UI **tidak** memanggil Prisma langsung. Selalu lewat Server Action / Route Handler. (Belum ada folder `services/` terpisah — logika tinggal di `actions.ts` per modul + `lib/`.)

### Validasi
- Setiap input dari client divalidasi dengan **Zod** di sisi server.
- Skema Zod disimpan di `src/lib/schemas/` (patient, drug, encounter) dan dipakai ulang di form (client) & Server Action (server).

### Autentikasi & Otorisasi
- **Auth.js v5** mengelola sesi (JWT/session); config split `auth.config.ts` (edge) + `auth.ts` (Node).
- `proxy.ts` memproteksi route `/dashboard` (gantikan middleware).
- Pengecekan peran (RBAC) dilakukan di Server Action/Route Handler & `proxy.ts`.

### Audit Log
- Setiap operasi **create/update/delete** pada data medis memanggil helper `audit.ts` untuk mencatat: user, aksi, entitas, waktu, dan data lama→baru.

### Penamaan
- File komponen: `PascalCase.tsx`
- File util/service: `camelCase.ts`
- Route folder: `kebab-case`
- Tabel DB & field: `snake_case` (via `@map` Prisma)

---

## 🪜 Tahapan Development

Pengembangan dibangun bertahap di atas fondasi multi-tenant. Urutan fase (semua **selesai** kecuali integrasi luar):

1. **Fondasi / scaffold** ✅ — Next.js 16 + TypeScript + Tailwind v4 + shadcn (base-ui) + Prisma v6 + Auth.js v5 + ESLint, layout dasar, `.env.example`, script `db:*`.
2. **Multi-tenant + Auth** ✅ — Tenant, Membership (peran per tenant), tenant switcher, isolasi `tenantId`, login/logout, proteksi rute (`proxy.ts`), RBAC, audit log; kemudian lupa/reset kata sandi (mode dev) & undang/kelola anggota.
3. **Pasien + Rekam Medis** ✅ — CRUD pasien (No. RM otomatis, soft-delete, alergi, riwayat pengobatan), Encounter SOAP + tanda vital (indikator klinis) + ICD-10 + resep elektronik & cetak, dashboard ringkasan.
4. **Antrian** ✅ — kiosk ambil nomor, papan display bersuara (TTS), panel panggil per counter.
5. **Farmasi / Rekanan / Transfer obat** ✅ — master obat + stok per tenant, kemitraan (partnership), order multi-item antar rekanan + tracking status + penerimaan → stok auto update.
6. **Berbagi pasien lintas tenant** ✅ — pencarian info terbatas + permintaan/persetujuan akses.
7. **Billing / Appointment / Lab** ✅ — invoice (item berkategori, diskon, status, cetak), janji temu (status flow + "Mulai Kunjungan" → Encounter), Lab & Radiologi (order penunjang + input hasil + tanda + cetak); + Laporan & export (CSV + cetak/PDF).
8. **Shared API** ✅ — API key (LIVE/TEST), endpoint `/api/v1`, scope granular, rate limit, log pemakaian (webhook menyusul).
9. **Integrasi (Soon)** 🔜 — Notifikasi (butuh provider email/WA), Telemedicine (video/WebRTC), SATUSEHAT & BPJS (butuh kredensial pemerintah). Menu & halaman "Soon" sudah ada.

> Lihat status terperinci & checklist per fase di `ROADMAP.md`, dan utang teknis di `TECH_DEBT.md`.

---

## Deployment (Rencana)

| Komponen | Opsi |
|----------|------|
| Aplikasi | Vercel / VPS (Docker) |
| Database | Postgres terkelola (Supabase/Neon) atau VPS |
| File storage | S3-compatible (untuk lampiran) |
| Environment | `.env` untuk secrets, jangan commit |

> Untuk data medis, pertimbangkan hosting di Indonesia / on-premise sesuai regulasi.
