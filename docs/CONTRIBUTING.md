# 🤝 Panduan Kontribusi — SmaraMedika

Terima kasih ingin berkontribusi! Panduan ini menjaga kode tetap konsisten & mudah dirawat.

---

## Tahapan Setup Lokal

**Prasyarat:** Node.js v18+ dan **PostgreSQL** v14+ berjalan lokal.

```bash
# 1. Clone & dependencies
git clone <repo-url>
cd smaramedika
npm install

# 2. Environment — salin & sesuaikan
cp .env.example .env
#   wajib diisi:
#   DATABASE_URL="postgresql://user:password@localhost:5432/smaramedika?schema=public"
#   AUTH_SECRET="..."   # buat dengan: openssl rand -base64 32
#   AUTH_URL="http://localhost:3000"

# 3. Setup database (buat DB jika belum ada → migrasi → seed)
npm run db:setup
#   atau manual: npm run db:migrate && npm run db:seed

# 4. Jalankan dev server
npm run dev
```

Aplikasi di `http://localhost:3000`. Akun demo (dari seed): `andi@sehatsentosa.id` / `password123`.

**Script berguna:** `db:generate`, `db:migrate`, `db:deploy`, `db:seed`, `db:studio`, `db:reset`, `db:setup` (lihat `README.md`).

---

## Alur Kerja Git (gitflow)

Branch utama: **`main`** (rilis/produksi) dan **`develop`** (integrasi pengembangan).

1. Buat branch fitur dari **`develop`**:
   ```bash
   git checkout develop && git pull
   git checkout -b <tipe>/<deskripsi-singkat>
   ```
2. Commit dengan pesan jelas (lihat konvensi di bawah).
3. Push & buka **Pull Request ke `develop`**.
4. Tunggu review → merge ke `develop`.
5. **Rilis:** `develop` → `main` (PR rilis) saat siap dilepas.

```
feat/xxx  ─PR─►  develop  ─PR(rilis)─►  main
```

> Jangan commit langsung ke `main` maupun `develop`. Pengembangan mengikuti **GitHub issues** per modul.

### Penamaan Branch
| Tipe | Untuk | Contoh |
|------|-------|--------|
| `feat/` | Fitur baru | `feat/manajemen-pasien` |
| `fix/` | Perbaikan bug | `fix/no-rm-duplikat` |
| `refactor/` | Refactor | `refactor/service-pasien` |
| `docs/` | Dokumentasi | `docs/update-api` |
| `chore/` | Konfigurasi/tooling | `chore/setup-eslint` |

---

## Konvensi Commit (Conventional Commits)

```
<tipe>: <deskripsi singkat>

[body opsional]
```

Contoh:
```
feat: tambah registrasi pasien dengan No. RM otomatis
fix: cegah duplikat No. RM saat registrasi bersamaan
docs: lengkapi spesifikasi API rekam medis
```

Tipe: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`.

---

## Standar Kode

- **TypeScript** — hindari `any`, manfaatkan tipe.
- **ESLint** — jalankan sebelum commit:
  ```bash
  npm run lint
  ```
- **Penamaan:**
  - Komponen: `PascalCase.tsx`
  - Util/service: `camelCase.ts`
  - Folder route: `kebab-case`
- **Validasi:** setiap input server divalidasi dengan **Zod** (`src/lib/schemas/`).
- **Layering:** komponen UI tidak akses Prisma langsung — lewat **Server Action / Route Handler** (lihat `ARCHITECTURE.md`).
- **Multi-tenant:** setiap query operasional WAJIB difilter `tenantId` aktif (`getActiveTenant()`).
- **Data medis:** operasi create/update/delete wajib panggil audit log.
- **Skema DB berubah:** buat migrasi (`npm run db:migrate`) + perbarui `seed.ts` bila perlu; jangan edit migrasi lama.

---

## Sebelum Membuka PR

Pastikan (lihat **Definition of Done** di `TECH_DEBT.md`):
- [ ] Fitur berfungsi sesuai `FEATURES.md`
- [ ] `npm run lint` bersih & `npm run build` lulus (type check)
- [ ] Migrasi Prisma disertakan bila skema berubah (`npm run db:migrate`)
- [ ] Validasi (Zod) & RBAC diterapkan; query difilter `tenantId`
- [ ] Audit log untuk operasi data medis
- [ ] Diuji manual
- [ ] PR diarahkan ke `develop` (bukan `main`)

---

## Struktur Folder

Lihat `ARCHITECTURE.md` untuk struktur lengkap & pola arsitektur.

---

## Pertanyaan?

Buka issue dengan label `question` atau hubungi maintainer.
