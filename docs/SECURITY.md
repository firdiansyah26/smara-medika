# 🔒 Keamanan & Kepatuhan — SmaraMedika

Data rekam medis termasuk **data pribadi sensitif** dengan tingkat perlindungan tertinggi. Dokumen ini merangkum prinsip keamanan & kepatuhan yang wajib diterapkan.

---

## Prinsip Utama

1. **Least Privilege** — setiap peran hanya mengakses yang diperlukan.
2. **Defense in Depth** — keamanan berlapis (auth, validasi, enkripsi, audit).
3. **Auditability** — setiap akses & perubahan data medis tercatat.
4. **Privacy by Design** — keamanan dipikirkan sejak desain, bukan ditambal belakangan.

---

## Autentikasi

- Password di-hash dengan **argon2** (atau bcrypt), tidak pernah disimpan plain text.
- Sesi dikelola **Auth.js** (cookie httpOnly + secure di produksi).
- Pertimbangkan: kebijakan password kuat, rate limiting pada login, 2FA (fase lanjutan).

## Otorisasi (RBAC)

- Pengecekan peran di **middleware** (level route) **dan** **service layer** (level operasi).
- Jangan pernah hanya mengandalkan UI menyembunyikan tombol — backend wajib menolak.

## Validasi Input

- Semua input dari client divalidasi dengan **Zod** di server.
- Cegah injeksi: Prisma (parameterized query) menangani SQL injection; tetap waspada pada raw query.
- Sanitasi konten yang ditampilkan (cegah XSS).

## Audit Log

Catat minimal untuk operasi pada data medis:
- Siapa (userId), Apa (action), Entitas (entity + id), Kapan (timestamp), Dari mana (IP).
- Untuk update: simpan perubahan (before → after).
- Audit log **tidak boleh** bisa diubah/dihapus oleh pengguna biasa.

## Enkripsi

- **In transit:** HTTPS/TLS wajib di produksi.
- **At rest:** pertimbangkan enkripsi disk database; field super sensitif bisa dienkripsi tambahan.
- Secrets (`.env`) **tidak** di-commit ke git.

## Manajemen Data

- **Soft delete** untuk data medis (`deletedAt`), bukan hard delete.
- **Backup** otomatis harian + uji restore berkala.
- **Retensi data** sesuai ketentuan (rekam medis punya masa simpan minimal menurut regulasi).

---

## Kepatuhan Regulasi (Indonesia)

| Regulasi | Relevansi |
|----------|-----------|
| **UU No. 27/2022 (PDP)** | Pelindungan data pribadi — dasar hukum utama |
| **Permenkes No. 24/2022** | Rekam Medis Elektronik (RME) |
| **SATUSEHAT (Kemenkes)** | Platform interoperabilitas nasional (fase lanjutan) |

> ⚠️ **Penting:** Sebelum digunakan di lingkungan produksi nyata, lakukan **review hukum & kepatuhan** dengan ahli. Dokumen ini panduan teknis, bukan nasihat hukum.

---

## Checklist Keamanan Pra-Produksi

- [ ] HTTPS aktif
- [ ] Semua password ter-hash (argon2/bcrypt)
- [ ] RBAC diuji untuk setiap peran
- [ ] Audit log aktif untuk CRUD data medis
- [ ] Rate limiting pada endpoint auth
- [ ] Secrets di environment (bukan di kode)
- [ ] Soft delete aktif
- [ ] Backup otomatis + uji restore
- [ ] Dependency scan (npm audit) bersih
- [ ] Header keamanan (CSP, HSTS, dll)
- [ ] Review kepatuhan UU PDP & Permenkes RME

---

## Pelaporan Kerentanan

Jika menemukan celah keamanan, laporkan secara privat ke maintainer (jangan buat issue publik). Detail kontak akan ditambahkan saat repo dirilis.
