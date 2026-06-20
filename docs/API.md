# 🔌 Spesifikasi API — SmaraMedika

API menggunakan **Next.js Route Handlers** (`src/app/api/*`) dengan gaya **REST**.

## Konvensi Umum

- Base URL: `/api`
- Format: JSON
- Auth: semua endpoint (kecuali login) membutuhkan sesi valid (cookie/JWT via Auth.js)
- **Tenant context:** endpoint operasional membutuhkan **tenant aktif** (dari sesi atau header `X-Tenant-Id`). Server memvalidasi user adalah anggota tenant tsb & memfilter data sesuai `tenantId`.
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

**Reset kata sandi (server actions + halaman publik):**
| Action / Halaman | Deskripsi | Role |
|------------------|-----------|------|
| `requestPasswordReset` | Buat token reset (acak 32-byte, hash SHA-256, kedaluwarsa 1 jam, token lama dibatalkan). **Mode dev:** tautan reset ditampilkan di layar (`/forgot-password`) | publik |
| `resetPassword` | Validasi token → ganti kata sandi (bcrypt, min 8 char, konfirmasi) → tandai token terpakai → redirect `/login?reset=1` | publik |
| Halaman | `/forgot-password`, `/reset-password?token=…` | publik |

> Pengiriman email sungguhan menyusul saat provider (Resend/SMTP) dipilih — lihat `TECH_DEBT.md`.

### 🏢 Tenant & Keanggotaan
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/me/tenants` | Daftar tenant yang diikuti user (untuk switcher) | semua |
| POST | `/api/tenants/switch` | Set tenant aktif di sesi | semua |
| GET | `/api/tenants/:id` | Profil tenant | anggota |
| PATCH | `/api/tenants/:id` | Update profil tenant | OWNER, ADMIN |
| GET | `/api/tenants/:id/members` | Daftar anggota tenant | OWNER, ADMIN |
| POST | `/api/tenants/:id/members` | Undang anggota + peran | OWNER, ADMIN |
| PATCH | `/api/tenants/:id/members/:mid` | Ubah peran/status anggota | OWNER, ADMIN |
| DELETE | `/api/tenants/:id/members/:mid` | Nonaktifkan anggota | OWNER, ADMIN |

> Manajemen "staf" = manajemen **Membership** per tenant (bukan user global). Pembuatan akun user global terjadi saat undangan/registrasi.

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

### 🔍 Pencarian & Akses Pasien Lintas Tenant
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/patients/search-global?nik=&name=` | Cari pasien lintas tenant (**info terbatas**) | semua |
| POST | `/api/patient-access-requests` | Minta akses detail pasien ke tenant pemilik | DOKTER, ADMIN |
| GET | `/api/patient-access-requests?type=incoming\|outgoing` | Daftar permintaan masuk/keluar | OWNER, ADMIN, DOKTER |
| PATCH | `/api/patient-access-requests/:id` | Setujui/tolak/cabut akses | OWNER, ADMIN (pemilik) |

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

### 🤝 Rekanan (Partnership)
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/partnerships` | Daftar rekanan tenant aktif | OWNER, ADMIN, APOTEKER |
| POST | `/api/partnerships` | Ajukan rekanan ke tenant lain | OWNER, ADMIN |
| PATCH | `/api/partnerships/:id` | Setujui/tolak/putus rekanan | OWNER, ADMIN |

### 💊 Stok & Transfer Obat Antar-Rekanan
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/partners/stock?drug=&partnerId=` | Cari stok obat di rekanan | DOKTER, APOTEKER, ADMIN |
| POST | `/api/drug-orders` | Buat order transfer obat (multi-item) | DOKTER, APOTEKER, ADMIN |
| GET | `/api/drug-orders?type=incoming\|outgoing&status=` | Daftar order masuk/keluar | APOTEKER, ADMIN |
| GET | `/api/drug-orders/:id` | Detail order + item + tracking | anggota terkait |
| PATCH | `/api/drug-orders/:id/status` | Ubah status (confirm/prepare/ship/receive/reject/cancel) | sesuai peran & sisi |
| GET | `/api/drug-orders/:id/tracking` | Riwayat tracking (timeline) | anggota terkait |

**Aturan transisi status** (`PATCH /status`):
- Penyedia (supplier): `REQUESTED → CONFIRMED → PREPARING → SHIPPED → IN_TRANSIT → DELIVERED`, atau `→ REJECTED`
- Pemohon (requester): `DELIVERED → RECEIVED` (stok bertambah), atau `→ CANCELLED` (sebelum SHIPPED)
- Setiap perubahan otomatis menambah entri `DrugOrderTracking`.

### 🔎 Referensi
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/icd?q=` | Cari kode ICD-10 | semua |

### 📊 Dashboard & Laporan
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/dashboard/summary` | Statistik ringkas | semua |
| GET | `/api/reports/visits?from=&to=` | Laporan kunjungan | ADMIN, DOKTER |
| GET | `/api/reports/drug-transfers?from=&to=` | Laporan transfer obat (masuk/keluar + status) | ADMIN, APOTEKER |

> Halaman `/dashboard/laporan` menyajikan laporan kunjungan & transfer obat dengan **export CSV** dan **cetak/PDF**.

### 🧾 Billing / Tagihan (Server Actions)
Modul Billing memakai **Server Actions** (mutasi dari form), bukan REST. Nilai uang berupa integer rupiah.

| Action | Deskripsi | Role |
|--------|-----------|------|
| `createInvoice` | Buat invoice per pasien (opsional terkait encounter); nomor `INV-YYYYMM-XXXXX` per tenant; status awal DRAFT | OWNER, ADMIN, RESEPSIONIS |
| `addInvoiceItem` | Tambah item biaya berkategori (CONSULTATION/DRUG/PROCEDURE/LAB/OTHER) + qty & harga satuan | OWNER, ADMIN, RESEPSIONIS |
| `removeInvoiceItem` | Hapus item dari invoice | OWNER, ADMIN, RESEPSIONIS |
| `setDiscount` | Set diskon → total dihitung ulang (Σ item − diskon) | OWNER, ADMIN, RESEPSIONIS |
| `updateInvoiceStatus` | Ubah status DRAFT → UNPAID → PAID / CANCELLED | OWNER, ADMIN, RESEPSIONIS |

**Halaman:** `/dashboard/billing` (daftar), `/dashboard/billing/[id]` (detail), `/dashboard/billing/[id]/cetak` (cetak invoice).

### 📅 Jadwal & Janji Temu / Appointment (Server Actions)
Modul Appointment memakai **Server Actions**.

| Action | Deskripsi | Role |
|--------|-----------|------|
| `createAppointment` | Booking janji temu (pasien + dokter + tanggal/jam + durasi + keperluan); status awal SCHEDULED | OWNER, ADMIN, RESEPSIONIS, DOKTER, PERAWAT |
| `updateAppointmentStatus` | Ubah status SCHEDULED → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW | OWNER, ADMIN, RESEPSIONIS, DOKTER, PERAWAT |
| `startVisit` | Buat Encounter dari appointment (dokter & pasien otomatis), tandai COMPLETED + tautkan `encounterId` | OWNER, ADMIN, RESEPSIONIS, DOKTER, PERAWAT |

**Halaman:** `/dashboard/jadwal` (filter Hari ini / Mendatang / Semua).

### 🔗 Manajemen Shared API (Internal — Admin Tenant)
Endpoint untuk **mengelola** akses Shared API tenant (bukan API publiknya sendiri).

| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| GET | `/api/api-keys` | Daftar API key tenant (tanpa secret) | OWNER, ADMIN |
| POST | `/api/api-keys` | Buat API key (secret tampil **sekali**) | OWNER, ADMIN |
| DELETE | `/api/api-keys/:id` | Cabut (revoke) API key | OWNER, ADMIN |
| POST | `/api/api-keys/:id/rotate` | Rotasi key | OWNER, ADMIN |
| GET | `/api/webhooks` | Daftar endpoint webhook | OWNER, ADMIN |
| POST | `/api/webhooks` | Tambah endpoint webhook | OWNER, ADMIN |
| PATCH | `/api/webhooks/:id` | Ubah/nonaktifkan webhook | OWNER, ADMIN |
| GET | `/api/api-logs?keyId=&from=&to=` | Log pemakaian API | OWNER, ADMIN |

> **Public API (`/api/v1/*`)** — API yang dikonsumsi pihak ketiga (autentikasi via API key, scope, rate limit, webhook). Spesifikasi lengkapnya ada di **[SHARED_API.md](./SHARED_API.md)**, terpisah dari API internal di atas yang berbasis sesi user.

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

## Contoh: Buat Order Transfer Obat

**Request** `POST /api/drug-orders` (tenant aktif = RS A)
```json
{
  "supplierTenantId": "tenant_apotek_b",
  "note": "Kebutuhan obat kaki untuk pasien rawat jalan",
  "items": [
    { "drugId": "drug_obat_kaki_x", "quantity": 20 }
  ]
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "orderNumber": "TRF-202606-00012",
    "status": "REQUESTED",
    "supplierTenantId": "tenant_apotek_b"
  }
}
```

**Lacak status** `GET /api/drug-orders/clx.../tracking`
```json
{
  "success": true,
  "data": [
    { "status": "REQUESTED", "createdAt": "2026-06-12T08:00:00Z" },
    { "status": "CONFIRMED", "note": "Stok tersedia", "createdAt": "2026-06-12T08:15:00Z" },
    { "status": "SHIPPED", "note": "Kurir: JNE, resi 123", "createdAt": "2026-06-12T10:00:00Z" }
  ]
}
```

---

## Catatan Implementasi

- Pertimbangkan **Server Actions** untuk mutasi dari form (alternatif REST) — lebih ringkas di Next.js App Router.
- Setiap mutasi pada data medis **wajib** memanggil helper audit log.
- Pagination default: `page=1`, `limit=20`.
