# 🏗️ Arsitektur — SmaraMedika

## Gambaran Umum

SmaraMedika adalah aplikasi **full-stack monolith multi-tenant** berbasis **Next.js (App Router)**, di mana frontend dan backend API berada dalam satu codebase. Satu instance melayani **banyak fasilitas** (RS/klinik/apotek) dengan data terisolasi per fasilitas. Pendekatan ini dipilih karena:
- Lebih sederhana untuk dikembangkan & di-deploy (satu repo, satu proses)
- Type-safety end-to-end (TypeScript + Prisma + Zod)
- Cocok untuk tim kecil & skala klinik hingga jaringan fasilitas

```
┌──────────────────────────────────────────────────┐
│                    Browser (Client)                │
│         React Components + Tailwind + shadcn/ui     │
└───────────────────────┬───────────────────────────┘
                        │ HTTP (fetch / Server Actions)
┌───────────────────────▼───────────────────────────┐
│                  Next.js (App Router)               │
│  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │ Server        │  │ Route Handlers (/api/*)     │ │
│  │ Components    │  │ — REST API (Node.js)        │ │
│  └──────────────┘  └─────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ Middleware (auth, RBAC, audit)                 │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ Service Layer (business logic)                 │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ Prisma ORM                                     │ │
│  └──────────────────────────────────────────────┘ │
└───────────────────────┬───────────────────────────┘
                        │ SQL
┌───────────────────────▼───────────────────────────┐
│                   PostgreSQL                        │
└────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Lapisan | Pilihan | Alasan |
|---------|---------|--------|
| Framework | **Next.js 14+ (App Router)** | Full-stack, SSR, RSC |
| Bahasa | **TypeScript** | Type safety, mengurangi bug |
| API | **Route Handlers** (`/app/api`) | Node.js, satu codebase |
| Database | **PostgreSQL** | Relasional, andal, ACID |
| ORM | **Prisma** | Type-safe, migrasi mudah |
| Styling | **Tailwind CSS** | Utility-first, cepat |
| Komponen UI | **shadcn/ui** | Aksesibel, kustomisasi penuh |
| Auth | **Auth.js (NextAuth v5)** | Standar, fleksibel |
| Validasi | **Zod** | Schema validation, sinkron dgn TS |
| Form | **React Hook Form** | Performa form yang baik |
| Data fetching | **TanStack Query** (opsional) | Cache & sinkronisasi |
| Testing | **Vitest** + **Playwright** | Unit & E2E |
| Linting | **ESLint** + **Prettier** | Konsistensi kode |

---

## Struktur Folder

```
smaramedika/
├── prisma/
│   ├── schema.prisma        # Skema database
│   ├── migrations/          # Riwayat migrasi
│   └── seed.ts              # Data awal
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, dll (route group)
│   │   ├── (dashboard)/     # Halaman setelah login
│   │   │   ├── dashboard/
│   │   │   ├── pasien/
│   │   │   ├── rekam-medis/
│   │   │   └── pengaturan/
│   │   ├── api/             # Route Handlers (REST API)
│   │   │   ├── auth/
│   │   │   ├── pasien/
│   │   │   └── rekam-medis/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── features/        # Komponen per fitur
│   ├── lib/
│   │   ├── db.ts            # Prisma client (singleton)
│   │   ├── auth.ts          # Konfigurasi Auth.js
│   │   ├── audit.ts         # Helper audit log
│   │   └── utils.ts
│   ├── services/            # Business logic per domain
│   ├── schemas/             # Skema Zod (validasi)
│   ├── types/               # Tipe TypeScript global
│   └── middleware.ts        # Proteksi route & RBAC
├── public/
├── .env.example
└── package.json
```

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
- Setiap request membawa **tenant aktif** (dari sesi). Helper `getTenantContext()` menyediakan `userId`, `tenantId`, dan `role`.
- **Aturan emas:** setiap query operasional WAJIB difilter `tenantId` aktif. Service layer bertanggung jawab menerapkan filter ini — jangan pernah query tanpa scope tenant.
- Pengecualian terkontrol: **pencarian pasien lintas tenant** (hanya info terbatas) dan **transfer obat antar rekanan** — keduanya melalui jalur khusus dengan otorisasi tersendiri.

### Akses Lintas Tenant (Terkontrol)
- **Pasien:** dimiliki tenant pembuat. Tenant lain hanya melihat info terbatas via pencarian; detail butuh `PatientAccessRequest` yang disetujui pemilik.
- **Transfer obat:** hanya antar tenant yang berstatus rekanan `ACTIVE` (`TenantPartnership`).

### Implikasi RBAC
- Otorisasi = fungsi dari **(tenant aktif, peran di tenant itu)**.
- Cek di `middleware.ts` (route) **dan** service layer (operasi). Lihat `SECURITY.md`.

---

## Pola & Konvensi

### Lapisan (Layering)
1. **UI (Components)** — hanya tampilan & interaksi
2. **API / Server Actions** — entry point, validasi input (Zod)
3. **Service Layer** — business logic, reusable
4. **Data (Prisma)** — akses database

> Aturan: komponen UI **tidak** memanggil Prisma langsung. Selalu lewat service/API.

### Validasi
- Setiap input dari client divalidasi dengan **Zod** di sisi server.
- Skema Zod disimpan di `src/schemas/` dan dipakai ulang di form (client) & API (server).

### Autentikasi & Otorisasi
- **Auth.js** mengelola sesi (JWT/session).
- `middleware.ts` memproteksi route `(dashboard)`.
- Pengecekan peran (RBAC) dilakukan di service layer & middleware.

### Audit Log
- Setiap operasi **create/update/delete** pada data medis memanggil helper `audit.ts` untuk mencatat: user, aksi, entitas, waktu, dan data lama→baru.

### Penamaan
- File komponen: `PascalCase.tsx`
- File util/service: `camelCase.ts`
- Route folder: `kebab-case`
- Tabel DB & field: `snake_case` (via `@map` Prisma)

---

## Deployment (Rencana)

| Komponen | Opsi |
|----------|------|
| Aplikasi | Vercel / VPS (Docker) |
| Database | Postgres terkelola (Supabase/Neon) atau VPS |
| File storage | S3-compatible (untuk lampiran) |
| Environment | `.env` untuk secrets, jangan commit |

> Untuk data medis, pertimbangkan hosting di Indonesia / on-premise sesuai regulasi.
