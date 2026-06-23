# 🗄️ Desain Database — SmaraMedika

Database: **PostgreSQL** | ORM: **Prisma**

> **Platform multi-tenant.** Hampir semua entitas operasional memiliki `tenantId` untuk isolasi data. Lihat strategi di `ARCHITECTURE.md`.

Dokumen ini menjelaskan rancangan skema. Skema final ada di `prisma/schema.prisma`.

> **Penamaan fisik:** nama tabel & kolom di DB memakai **snake_case** (mis. `mr_number`,
> `tenant_id`, tabel `queue_tickets`) lewat `@map`/`@@map` Prisma; nama di Prisma Client tetap
> camelCase/PascalCase. Migrasi awal: `prisma/migrations/*_init`, lalu `*_queue`.

---

## Diagram Relasi (Ringkas)

```
User ──< Membership >── Tenant            (1 user ↔ banyak tenant, peran per membership)
User ──< AuditLog

Tenant ──< Patient (owner)                (pasien dimiliki tenant pembuat)
Tenant ──< Encounter
Tenant ──< DrugStock >── Drug             (stok obat per tenant, katalog Drug bersama)

Patient ──< Encounter ──< VitalSign
                       ├──< Diagnosis ──> IcdCode
                       ├──< Prescription ──< PrescriptionItem ──> Drug
                       └──< Attachment
Patient ──< Allergy
Patient ──< PatientAccessRequest >── Tenant (pemohon)   (akses pasien lintas tenant)

Tenant ──< TenantPartnership >── Tenant   (rekanan antar fasilitas)
Tenant ──< DrugOrder (pemohon) / (penyedia)
DrugOrder ──< DrugOrderItem ──> Drug
DrugOrder ──< DrugOrderTracking          (riwayat status / tracking)

Tenant ──< Invoice >── Patient           (tagihan per pasien, opsional ke Encounter)
Invoice ──< InvoiceItem                   (item biaya berkategori)
Tenant ──< Appointment >── Patient        (janji temu; dokter = User "AppointmentDoctor")
Appointment ──> Encounter?                (terisi saat "Mulai Kunjungan")

Tenant ──< ApiKey                        (Shared API: kunci publik per tenant)
Tenant ──< WebhookEndpoint ──< WebhookDelivery
Tenant ──< ApiRequestLog                 (audit pemakaian API)

User ──< PasswordResetToken              (token reset kata sandi)
```

---

## Entitas Multi-Tenant (Fondasi)

### Tenant (Fasilitas: RS / Klinik / Apotek)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| name | String | nama fasilitas |
| type | Enum | RUMAH_SAKIT, KLINIK, APOTEK |
| code | String | kode unik fasilitas |
| address | String? | |
| city | String? | |
| phone | String? | |
| isActive | Boolean | |
| createdAt / updatedAt | DateTime | |

### User (Akun Global)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| email | String | unik (global) |
| password | String | ter-hash (argon2/bcrypt) |
| name | String | nama lengkap |
| isPlatformAdmin | Boolean | super admin platform (opsional) |
| isActive | Boolean | |
| createdAt / updatedAt | DateTime | |

> Peran **tidak** ada di User. Peran ada di Membership (per tenant).

### Membership (Keanggotaan User ↔ Tenant) ⭐
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| userId | String | FK → User |
| tenantId | String | FK → Tenant |
| role | Enum | OWNER, ADMIN, DOKTER, PERAWAT, RESEPSIONIS, APOTEKER |
| isActive | Boolean | |
| invitedById | String? | FK → User (yang mengundang) |
| createdAt | DateTime | |

> **Unique** `(userId, tenantId)` — satu user satu keanggotaan per tenant. Inilah yang membuat **1 user bisa di banyak tenant**.

---

## Entitas Klinis (Scoped per Tenant)

### Patient (Pasien) — dimiliki tenant pembuat
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant (**pemilik**) |
| mrNumber | String | No. RM (unik **per tenant**) |
| nik | String? | NIK (untuk pencocokan lintas tenant) |
| name | String | nama lengkap |
| birthDate | DateTime | |
| gender | Enum | LAKI_LAKI, PEREMPUAN |
| bloodType | Enum? | |
| phone | String? | |
| address | String? | |
| city | String? | bagian dari info terbatas |
| emergencyContact | String? | |
| bpjsNumber | String? | |
| createdAt / updatedAt | DateTime | |

> **Unique** `(tenantId, mrNumber)`. NIK dipakai untuk pencarian lintas tenant (menampilkan info terbatas saja).

### PatientAccessRequest (Permintaan Akses Pasien Lintas Tenant) ⭐
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| patientId | String | FK → Patient (yang diminta) |
| ownerTenantId | String | FK → Tenant (pemilik pasien) |
| requesterTenantId | String | FK → Tenant (pemohon) |
| requestedById | String | FK → User |
| reason | String? | alasan permintaan |
| status | Enum | PENDING, APPROVED, REJECTED, REVOKED |
| respondedById | String? | FK → User (yang merespons) |
| expiresAt | DateTime? | masa berlaku akses (opsional) |
| createdAt / updatedAt | DateTime | |

> Saat `APPROVED`, tenant pemohon boleh melihat detail pasien (hingga `expiresAt` / di-`REVOKED`).

### Encounter, VitalSign, Diagnosis, Allergy
Sama seperti desain sebelumnya, **plus `tenantId`** pada Encounter (& diturunkan ke anak-anaknya). Ringkas:
- **Encounter**: id, **tenantId**, patientId (FK), doctorId (FK → User), visitDate, status, subjective, objective, assessment, plan
- **VitalSign**: id, encounterId (FK), systolic/diastolic, temperature, heartRate, respiratoryRate, spo2, weight, height
- **Diagnosis**: id, encounterId (FK), icdCode, icdName, type (PRIMER/SEKUNDER), notes
- **Allergy**: id, patientId (FK), allergen, reaction, severity

---

## Entitas Farmasi & Transfer Obat

### Drug (Katalog Obat — master bersama)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| name | String | nama obat |
| genericName | String? | nama generik |
| unit | String | satuan (tablet, botol, dll) |
| category | String? | kategori (mis. obat mata, lambung) |

> Katalog Drug bersifat **master bersama** agar transfer antar tenant merujuk obat yang sama. Harga & jumlah ada di DrugStock per tenant.

### DrugStock (Stok Obat per Tenant)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant |
| drugId | String | FK → Drug |
| quantity | Int | jumlah tersedia |
| price | Decimal? | harga jual/transfer |
| minStock | Int? | ambang minimum (peringatan) |

> **Unique** `(tenantId, drugId)`.

### Prescription & PrescriptionItem
- **Prescription**: id, tenantId, encounterId (FK), notes, createdAt
- **PrescriptionItem**: id, prescriptionId (FK), drugId (FK), dosage, frequency, quantity, instruction

---

## Entitas Rekanan & Order Transfer Obat ⭐

### TenantPartnership (Rekanan antar Fasilitas)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| requesterTenantId | String | FK → Tenant (pengaju) |
| addresseeTenantId | String | FK → Tenant (tujuan) |
| status | Enum | PENDING, ACTIVE, REJECTED, INACTIVE |
| requestedById | String | FK → User |
| respondedById | String? | FK → User |
| createdAt / updatedAt | DateTime | |

> **Unique** pasangan tenant (cegah duplikat rekanan). Transfer obat hanya boleh jika `status = ACTIVE`.

### DrugOrder (Order/Transfer Obat antar Rekanan)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| orderNumber | String | nomor order unik (mis. `TRF-202606-00012`) |
| requesterTenantId | String | FK → Tenant (pemohon, mis. RS A) |
| supplierTenantId | String | FK → Tenant (penyedia, mis. Apotek B) |
| status | Enum | REQUESTED, CONFIRMED, PREPARING, SHIPPED, IN_TRANSIT, DELIVERED, RECEIVED, REJECTED, CANCELLED |
| requestedById | String | FK → User |
| note | String? | catatan order |
| totalAmount | Decimal? | total nilai (opsional) |
| createdAt / updatedAt | DateTime | |

### DrugOrderItem (Item dalam Order — multi obat)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| orderId | String | FK → DrugOrder |
| drugId | String | FK → Drug |
| quantity | Int | jumlah dipesan |
| price | Decimal? | harga per unit saat order |

### DrugOrderTracking (Riwayat Status / Tracking) ⭐
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| orderId | String | FK → DrugOrder |
| status | Enum | (sama dengan status DrugOrder) |
| note | String? | keterangan (mis. nama kurir, no. resi) |
| changedById | String? | FK → User |
| createdAt | DateTime | waktu perubahan |

> Setiap perubahan status DrugOrder membuat satu baris DrugOrderTracking → timeline pelacakan lengkap. Saat status `RECEIVED`, sistem menambah DrugStock tenant pemohon (transaction).

### AuditLog
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String? | konteks tenant |
| userId | String | FK → User (pelaku) |
| action | Enum | CREATE, READ, UPDATE, DELETE, LOGIN |
| entity | String | nama entitas |
| entityId | String? | id record |
| changes | Json? | before/after |
| ipAddress | String? | |
| createdAt | DateTime | |

---

## Entitas Billing (Tagihan)

### Invoice (Tagihan per Pasien) ⭐
Tagihan untuk satu pasien, opsional terkait satu kunjungan/encounter. Nilai uang disimpan sebagai **Int rupiah** (tanpa desimal).

| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| patientId | String | FK → Patient |
| encounterId | String? | FK → Encounter (opsional) |
| invoiceNumber | String | `INV-YYYYMM-XXXXX` (unik **per tenant**) |
| status | Enum | InvoiceStatus: DRAFT, UNPAID, PAID, CANCELLED (default DRAFT) |
| discount | Int | diskon rupiah (default 0) |
| total | Int | total rupiah = Σ item − diskon (default 0) |
| note | String? | catatan |
| createdById | String | FK → User |
| paidAt | DateTime? | waktu pembayaran |
| createdAt / updatedAt | DateTime | |

> **Relasi:** tenant, patient, encounter?, items `InvoiceItem[]`. **Index:** `@@unique([tenantId, invoiceNumber])`, `[tenantId, status]`, `[patientId]`.

### InvoiceItem (Item Biaya)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| invoiceId | String | FK → Invoice (onDelete Cascade) |
| category | Enum | BillingCategory: CONSULTATION, DRUG, PROCEDURE, LAB, OTHER (default OTHER) |
| description | String | uraian item |
| quantity | Int | jumlah (default 1) |
| unitPrice | Int | harga satuan rupiah (default 0) |
| amount | Int | subtotal rupiah = quantity × unitPrice (default 0) |

> **Index:** `[invoiceId]`.

---

## Entitas Jadwal & Janji Temu

### Appointment (Janji Temu) ⭐
Booking janji temu pasien dengan dokter. Saat "Mulai Kunjungan", sistem membuat Encounter dan mengisi `encounterId`.

| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| patientId | String | FK → Patient |
| doctorId | String | FK → User (relation `"AppointmentDoctor"`) |
| scheduledAt | DateTime | waktu janji temu |
| durationMin | Int | durasi menit (default 30) |
| status | Enum | AppointmentStatus: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW (default SCHEDULED) |
| reason | String? | keperluan |
| note | String? | catatan |
| encounterId | String? | FK → Encounter (terisi saat mulai kunjungan) |
| createdById | String | FK → User |
| createdAt / updatedAt | DateTime | |

> **Relasi:** tenant, patient, doctor (User, relation `"AppointmentDoctor"`). **Index:** `[tenantId, scheduledAt]`, `[doctorId, scheduledAt]`.

---

## Entitas Reset Kata Sandi

### PasswordResetToken (Token Reset Kata Sandi) ⭐
Token untuk alur lupa/reset kata sandi. Token acak 32-byte; yang disimpan adalah **hash SHA-256**, kedaluwarsa 1 jam, token lama dibatalkan saat permintaan baru.

| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| userId | String | FK → User (onDelete Cascade) |
| tokenHash | String | hash SHA-256 token (unik) |
| expiresAt | DateTime | kedaluwarsa (1 jam) |
| usedAt | DateTime? | waktu token dipakai |
| createdAt | DateTime | |

> **Relasi:** user. **Index:** `[userId]`.

---

## Entitas Shared API (Integrasi Pihak Ketiga)

Mendukung fitur API publik per tenant. Detail teknis: lihat `SHARED_API.md`.

### ApiKey
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant (pemilik key) |
| name | String | label key (mis. "Integrasi SIM-RS") |
| prefix | String | bagian publik key (untuk identifikasi & tampil) |
| hashedSecret | String | hash secret (argon2/bcrypt) — secret asli tak disimpan |
| mode | Enum | LIVE, TEST |
| scopes | String[] | daftar scope (mis. `patients:read`) |
| ipAllowlist | String[]? | pembatasan IP (opsional) |
| status | Enum | ACTIVE, REVOKED |
| lastUsedAt | DateTime? | pemakaian terakhir |
| expiresAt | DateTime? | kedaluwarsa (opsional) |
| createdById | String | FK → User |
| createdAt / updatedAt | DateTime | |

> **Index** `prefix` (unik) untuk lookup cepat saat autentikasi.

### WebhookEndpoint
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant |
| url | String | tujuan webhook |
| secret | String | untuk HMAC signature |
| events | String[] | event yang dilanggan (mis. `drug_order.status_changed`) |
| isActive | Boolean | |
| createdAt / updatedAt | DateTime | |

### WebhookDelivery (Riwayat Pengiriman)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| endpointId | String | FK → WebhookEndpoint |
| event | String | nama event |
| payload | Json | isi yang dikirim |
| status | Enum | PENDING, SUCCESS, FAILED, DEAD_LETTER |
| attempts | Int | jumlah percobaan |
| responseCode | Int? | status HTTP respons consumer |
| nextRetryAt | DateTime? | jadwal retry berikutnya |
| createdAt | DateTime | |

### ApiRequestLog (Audit Pemakaian API)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant |
| apiKeyId | String? | FK → ApiKey |
| method | String | GET/POST/... |
| path | String | endpoint |
| statusCode | Int | hasil |
| latencyMs | Int? | durasi proses |
| ipAddress | String? | |
| createdAt | DateTime | |

> Volume `ApiRequestLog` bisa besar → pertimbangkan retensi/partisi (lihat `TECH_DEBT.md`).

---

## Entitas Antrian (Queue)

Mendukung fitur antrian (kiosk cetak nomor, papan display, panel panggil). Tabel `queue_tickets`.

### QueueTicket
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant |
| serviceType | Enum | BPJS, ASURANSI, UMUM |
| number | Int | nomor urut per tenant + layanan + hari (reset harian) |
| code | String | mis. `A0001` (BPJS→A, Asuransi→PA, Umum→U) |
| status | Enum | WAITING, CALLED, SERVED, SKIPPED |
| counter | String? | counter pemanggil (mis. `A1`, `PA1`) |
| calledById | String? | user pemanggil |
| calledAt / servedAt | DateTime? | waktu dipanggil/selesai |
| createdAt | DateTime | |

> Counter & layanan dikonfigurasi di `src/lib/queue.ts` (BPJS: A1–A3, Asuransi: PA1–PA2, Umum: U1–U2). Kiosk & display bersifat **publik** per tenant (`/antrian/[code]/...`).

---

## Contoh Skema Prisma (Cuplikan)

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum TenantType { RUMAH_SAKIT  KLINIK  APOTEK }
enum Role { OWNER  ADMIN  DOKTER  PERAWAT  RESEPSIONIS  APOTEKER }
enum OrderStatus {
  REQUESTED  CONFIRMED  PREPARING  SHIPPED
  IN_TRANSIT DELIVERED  RECEIVED   REJECTED  CANCELLED
}
enum InvoiceStatus { DRAFT  UNPAID  PAID  CANCELLED }
enum BillingCategory { CONSULTATION  DRUG  PROCEDURE  LAB  OTHER }
enum AppointmentStatus { SCHEDULED  CONFIRMED  COMPLETED  CANCELLED  NO_SHOW }

model Tenant {
  id          String       @id @default(cuid())
  name        String
  type        TenantType
  code        String       @unique
  isActive    Boolean      @default(true)
  memberships Membership[]
  patients    Patient[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model User {
  id          String       @id @default(cuid())
  email       String       @unique
  password    String
  name        String
  isActive    Boolean      @default(true)
  memberships Membership[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  tenantId  String
  role      Role
  isActive  Boolean  @default(true)
  user      User     @relation(fields: [userId], references: [id])
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, tenantId])   // 1 user ↔ banyak tenant
}

model DrugOrder {
  id                 String              @id @default(cuid())
  orderNumber        String              @unique
  requesterTenantId  String
  supplierTenantId   String
  status             OrderStatus         @default(REQUESTED)
  note               String?
  items              DrugOrderItem[]
  trackings          DrugOrderTracking[]
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
}
```

> Cuplikan disederhanakan. Skema lengkap (Patient, Encounter, PatientAccessRequest, TenantPartnership, DrugStock, DrugOrderItem, DrugOrderTracking, Invoice, InvoiceItem, Appointment, PasswordResetToken, AuditLog, dll) dibuat saat implementasi.

---

## Strategi & Pertimbangan

- **Isolasi data:** semua query operasional WAJIB difilter `tenantId` aktif (kecuali pencarian pasien lintas tenant yang sengaja terbatas). Lihat `ARCHITECTURE.md` & `SECURITY.md`.
- **Penomoran No. RM:** `RM-YYYYMM-XXXXX`, unik **per tenant**, generate via `$transaction`.
- **Penomoran Order:** `TRF-YYYYMM-XXXXX`, unik global, generate via `$transaction`.
- **Penomoran Invoice:** `INV-YYYYMM-XXXXX`, unik **per tenant**, generate via `$transaction`. Nilai uang Billing disimpan sebagai **Int rupiah** (lihat `TECH_DEBT.md`).
- **Soft delete:** data medis pakai `deletedAt` (nullable), bukan hard delete.
- **Indexing:** `(tenantId, mrNumber)`, `nik`, `(tenantId, drugId)`, `DrugOrder.status`, `DrugOrderTracking.orderId`.
- **Transfer obat:** validasi rekanan `ACTIVE` + stok cukup sebelum order; kurangi stok penyedia saat dikirim, tambah stok pemohon saat diterima (transaction).
- **Akses pasien lintas tenant:** default hanya info terbatas; detail butuh `PatientAccessRequest` berstatus `APPROVED` & belum kedaluwarsa.
- **Timezone:** simpan UTC, tampilkan WIB/WITA/WIT.

### LabOrder (Order Penunjang) ⭐ — Lab & Radiologi

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant |
| patientId | String | FK → Patient |
| encounterId | String? | FK → Encounter (opsional) |
| orderNumber | String | `LAB-YYYYMM-XXXXX` / `RAD-YYYYMM-XXXXX`, unik per tenant |
| category | LabCategory | `LABORATORIUM` \| `RADIOLOGI` |
| status | LabOrderStatus | `REQUESTED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED` |
| clinicalNote | String? | Catatan klinis |
| orderedById | String | User pembuat order |
| completedAt | DateTime? | Diisi saat status `COMPLETED` |

> **Relasi:** tenant, patient, encounter?, items `LabOrderItem[]`. **Index:** `@@unique([tenantId, orderNumber])`, `[tenantId, status]`, `[patientId]`.

### LabOrderItem (Pemeriksaan & Hasil)

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| labOrderId | String | FK → LabOrder (onDelete Cascade) |
| testName | String | Nama pemeriksaan |
| result | String? | Hasil |
| unit | String? | Satuan |
| referenceRange | String? | Nilai rujukan |
| flag | LabFlag? | `NORMAL` \| `LOW` \| `HIGH` \| `ABNORMAL` |
| note | String? | Catatan |

> **Enum baru:** `LabCategory`, `LabOrderStatus`, `LabFlag`.

---

## Entitas Lampiran (Attachment)

### Attachment (Lampiran/Gambar — polymorphic, disimpan di DB) ⭐
Penyimpanan lampiran **terpadu** (satu tabel) yang dipakai banyak modul. Relasi ke item terkait
bersifat **polymorphic** via `entityType` + `entityId` (bukan FK), jadi modul mana pun bisa
menempelkan lampiran tanpa mengubah skema. **File disimpan langsung di DB** (`bytea`), bukan object
storage/CDN.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| tenantId | String | FK → Tenant (isolasi data) |
| entityType | AttachmentEntity | `DRUG` \| `PATIENT` \| `ENCOUNTER` \| `LAB_ORDER` \| `INVOICE` \| `OTHER` |
| entityId | String | ID item terkait di modul tujuan |
| fileName | String | Nama berkas asli |
| mimeType | String | Tipe (image/png, image/jpeg, …, application/pdf) |
| size | Int | Ukuran (byte) |
| data | Bytes | Isi berkas (`bytea`) |
| uploadedById | String | User pengunggah |

> **Index:** `[tenantId, entityType, entityId]`. **Batas:** maks **2 MB**/berkas, tipe gambar + PDF.
> **Penyajian:** route `GET /api/attachments/{id}` (wajib sesi + tenant cocok) menyajikan byte dengan
> `Content-Type` sesuai. **Komponen:** `<AttachmentSection entityType=… entityId=… />` (reusable).
> **Realisasi pertama:** halaman detail pasien (Dokumen & Lampiran).
> **Catatan:** menyimpan file di DB memakai kuota Postgres (lebih kecil dari object storage) — lihat
> `TECH_DEBT.md`; untuk volume besar pertimbangkan Supabase Storage.

---

## 🔌 Koneksi & Migrasi Database

### Variabel lingkungan
Prisma memakai **dua** koneksi (lihat `.env.example`):

| Var | Untuk | Catatan |
|-----|-------|---------|
| `DATABASE_URL` | Runtime aplikasi | Koneksi yang dipakai Prisma Client |
| `DIRECT_URL` | Migrasi (`prisma migrate`) | Koneksi non-pooled / session; dipakai `migrate`/`db push` |

`datasource db` di `schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Opsi A — PostgreSQL lokal
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smaramedika?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/smaramedika?schema=public"
```

### Opsi B — Supabase (Supavisor pooler)
Ambil string dari **Supabase Dashboard → Connect → ORMs/Prisma**. Pola:
```env
# Runtime: transaction pooler (port 6543) + pgbouncer
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
# Migrasi: session pooler (port 5432)
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require"
```
Catatan:
- **URL-encode** karakter spesial pada password (mis. `@` → `%40`).
- Koneksi **direct** (`db.<ref>.supabase.co`) bersifat **IPv6-only** di free tier → pakai **pooler** (mendukung IPv4).
- Host pooler memakai prefix **`aws-1-`** (cek region di dashboard).
- Jangan commit kredensial: `.env` sudah di-`.gitignore`.

### Alur migrasi
| Situasi | Perintah | Keterangan |
|---------|----------|-----------|
| Ubah `schema.prisma` (dev) | `npm run db:migrate -- --name <nama>` | `prisma migrate dev`: buat + terapkan migrasi, regen client |
| Terapkan migrasi di server/produksi | `npm run db:deploy` | `prisma migrate deploy`: hanya menerapkan migrasi yang ada (tanpa membuat baru) |
| Isi data contoh | `npm run db:seed` | Menjalankan `prisma/seed.ts` |
| Cek status migrasi | `npx prisma migrate status` | Membandingkan migrasi lokal vs database |
| Reset (HATI-HATI, hapus data) | `npm run db:reset` | Drop + migrate ulang + seed |
| Setup awal lokal (DB baru) | `npm run db:setup` | Buat DB → migrasi → seed |

### Deploy ke Supabase / produksi
1. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL` di **environment variables** platform (Vercel/dll) — bukan dari `.env`.
2. Terapkan skema: `npm run db:deploy` (atau jalankan di pipeline rilis).
3. (Opsional, sekali) Seed data awal: `npm run db:seed`.
4. Verifikasi: `npx prisma migrate status` → "Database schema is up to date!".

> **Status saat ini:** database produksi di **Supabase** (region `ap-southeast-1`), 6 migrasi terpasang & ter-seed.
