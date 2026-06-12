# 🤝 Panduan Kontribusi — SmaraMedika

Terima kasih ingin berkontribusi! Panduan ini menjaga kode tetap konsisten & mudah dirawat.

---

## Setup Pengembangan

```bash
git clone <repo-url>
cd smaramedika
npm install
cp .env.example .env   # sesuaikan
npx prisma migrate dev
npm run dev
```

---

## Alur Kerja Git

1. Buat branch dari `main`:
   ```bash
   git checkout -b <tipe>/<deskripsi-singkat>
   ```
2. Commit dengan pesan jelas (lihat konvensi di bawah).
3. Push & buka Pull Request.
4. Tunggu review sebelum merge.

> Jangan commit langsung ke `main`.

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
- **ESLint + Prettier** — jalankan sebelum commit:
  ```bash
  npm run lint
  npm run format
  ```
- **Penamaan:**
  - Komponen: `PascalCase.tsx`
  - Util/service: `camelCase.ts`
  - Folder route: `kebab-case`
- **Validasi:** setiap input server divalidasi dengan **Zod**.
- **Layering:** komponen UI tidak akses Prisma langsung — lewat service/API (lihat `ARCHITECTURE.md`).
- **Data medis:** operasi create/update/delete wajib panggil audit log.

---

## Sebelum Membuka PR

Pastikan (lihat **Definition of Done** di `TECH_DEBT.md`):
- [ ] Fitur berfungsi sesuai `FEATURES.md`
- [ ] `npm run lint` bersih
- [ ] Type check lulus
- [ ] Validasi & RBAC diterapkan
- [ ] Audit log untuk operasi data medis
- [ ] Diuji manual

---

## Struktur Folder

Lihat `ARCHITECTURE.md` untuk struktur lengkap & pola arsitektur.

---

## Pertanyaan?

Buka issue dengan label `question` atau hubungi maintainer.
