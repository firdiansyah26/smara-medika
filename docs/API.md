# 🔌 Spesifikasi API — SmaraMedika

API menggunakan **Next.js Route Handlers** (`src/app/api/*`) dengan gaya **REST**.

## Konvensi Umum

- Base URL: `/api`
- Format: JSON
- Auth: semua endpoint (kecuali login) membutuhkan sesi valid (cookie/JWT via Auth.js)
- Validasi input: **Zod** di setiap handler

### Format Response Sukses
```json
{
  "success": true,
  "data": { ... }
}
```

### Format Response Error
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "..." }
}
```

### Kode Status HTTP
| Kode | Arti |
|------|------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validasi gagal) |
| 401 | Unauthorized (belum login) |
| 403 | Forbidden (peran tidak diizinkan) |
| 404 | Not Found |
| 500 | Server Error |

---

## Endpoint

### 🔐 Auth
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login | publik |
| POST | `/api/auth/logout` | Logout | semua |
| GET | `/api/auth/me` | Info user aktif | semua |

### 👥 User (Manajemen Staf)
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/users` | Daftar user | ADMIN |
| POST | `/api/users` | Buat user | ADMIN |
| GET | `/api/users/:id` | Detail user | ADMIN |
| PATCH | `/api/users/:id` | Update user | ADMIN |
| DELETE | `/api/users/:id` | Nonaktifkan user | ADMIN |

### 🧑 Pasien
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/patients` | Daftar + pencarian (`?q=`, `?page=`) | semua |
| POST | `/api/patients` | Registrasi pasien baru | RESEPSIONIS, ADMIN |
| GET | `/api/patients/:id` | Detail pasien | semua |
| PATCH | `/api/patients/:id` | Update data pasien | RESEPSIONIS, ADMIN |
| GET | `/api/patients/:id/encounters` | Riwayat kunjungan | semua |
| GET | `/api/patients/:id/allergies` | Daftar alergi | semua |
| POST | `/api/patients/:id/allergies` | Tambah alergi | DOKTER, PERAWAT |

### 📋 Rekam Medis (Encounter)
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/encounters` | Daftar kunjungan (filter tanggal/status) | semua |
| POST | `/api/encounters` | Buat kunjungan baru | RESEPSIONIS, DOKTER |
| GET | `/api/encounters/:id` | Detail rekam medis | semua |
| PATCH | `/api/encounters/:id` | Update SOAP/status | DOKTER, PERAWAT |
| POST | `/api/encounters/:id/vitals` | Input tanda vital | PERAWAT, DOKTER |
| POST | `/api/encounters/:id/diagnoses` | Tambah diagnosa | DOKTER |
| POST | `/api/encounters/:id/attachments` | Upload lampiran | DOKTER, PERAWAT |

### 💊 Resep & Obat (Fase 2)
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/drugs` | Daftar obat | semua |
| POST | `/api/drugs` | Tambah obat | APOTEKER, ADMIN |
| POST | `/api/encounters/:id/prescriptions` | Buat resep | DOKTER |
| GET | `/api/prescriptions/:id` | Detail resep | semua |

### 🔎 Referensi
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/icd?q=` | Cari kode ICD-10 | semua |

### 📊 Dashboard & Laporan
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/dashboard/summary` | Statistik ringkas | semua |
| GET | `/api/reports/visits?from=&to=` | Laporan kunjungan | ADMIN, DOKTER |

---

## Contoh: Buat Pasien

**Request** `POST /api/patients`
```json
{
  "nik": "3201234567890001",
  "name": "Budi Santoso",
  "birthDate": "1990-05-15",
  "gender": "LAKI_LAKI",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 1"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "mrNumber": "RM-202606-00042",
    "name": "Budi Santoso"
  }
}
```

---

## Catatan Implementasi

- Pertimbangkan **Server Actions** untuk mutasi dari form (alternatif REST) — lebih ringkas di Next.js App Router.
- Setiap mutasi pada data medis **wajib** memanggil helper audit log.
- Pagination default: `page=1`, `limit=20`.
