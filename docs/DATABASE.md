# 🗄️ Desain Database — SmaraMedika

Database: **PostgreSQL** | ORM: **Prisma**

Dokumen ini menjelaskan rancangan skema. Skema final akan ada di `prisma/schema.prisma`.

---

## Diagram Relasi (Ringkas)

```
User ──< AuditLog
User ──< Encounter (sebagai dokter)

Patient ──< Encounter ──< VitalSign
                       ├──< Diagnosis ──> IcdCode
                       ├──< Prescription ──< PrescriptionItem ──> Drug
                       └──< Attachment
Patient ──< Allergy
Patient ──< Appointment ──> User (dokter)
```

---

## Entitas Utama

### User (Pengguna/Staf)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| email | String | unik |
| password | String | ter-hash (argon2/bcrypt) |
| name | String | nama lengkap |
| role | Enum | ADMIN, DOKTER, PERAWAT, RESEPSIONIS, APOTEKER |
| isActive | Boolean | status akun |
| createdAt / updatedAt | DateTime | |

### Patient (Pasien)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| mrNumber | String | No. Rekam Medis (unik, auto) |
| nik | String? | NIK (unik) |
| name | String | nama lengkap |
| birthDate | DateTime | tanggal lahir |
| gender | Enum | LAKI_LAKI, PEREMPUAN |
| bloodType | Enum? | A, B, AB, O (+ rhesus) |
| phone | String? | |
| address | String? | |
| emergencyContact | String? | |
| bpjsNumber | String? | |
| createdAt / updatedAt | DateTime | |

### Encounter (Kunjungan / Rekam Medis)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String (cuid) | PK |
| patientId | String | FK → Patient |
| doctorId | String | FK → User |
| visitDate | DateTime | tanggal kunjungan |
| status | Enum | MENUNGGU, DIPERIKSA, SELESAI |
| subjective | Text? | S (keluhan) |
| objective | Text? | O (pemeriksaan) |
| assessment | Text? | A (penilaian) |
| plan | Text? | P (rencana) |
| createdAt / updatedAt | DateTime | |

### VitalSign (Tanda Vital)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| encounterId | String | FK → Encounter |
| systolic / diastolic | Int? | tekanan darah |
| temperature | Float? | suhu (°C) |
| heartRate | Int? | nadi |
| respiratoryRate | Int? | pernapasan |
| spo2 | Int? | saturasi oksigen |
| weight / height | Float? | BB (kg) / TB (cm) |

### Diagnosis
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| encounterId | String | FK → Encounter |
| icdCode | String | kode ICD-10 |
| icdName | String | nama diagnosa |
| type | Enum | PRIMER, SEKUNDER |
| notes | Text? | |

### Allergy (Alergi)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| patientId | String | FK → Patient |
| allergen | String | zat/obat pemicu |
| reaction | String? | reaksi |
| severity | Enum? | RINGAN, SEDANG, BERAT |

### Drug (Obat) & Prescription (Resep)
**Drug**: id, name, unit, price, stock
**Prescription**: id, encounterId (FK), notes, createdAt
**PrescriptionItem**: id, prescriptionId (FK), drugId (FK), dosage, frequency, quantity, instruction

### Appointment (Janji Temu) — Fase 2
id, patientId (FK), doctorId (FK), scheduledAt, queueNumber, status, notes

### Attachment (Lampiran)
id, encounterId (FK), fileName, fileUrl, fileType, uploadedAt

### AuditLog
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | String | PK |
| userId | String | FK → User (pelaku) |
| action | Enum | CREATE, READ, UPDATE, DELETE, LOGIN |
| entity | String | nama tabel/entitas |
| entityId | String? | id record terkait |
| changes | Json? | perubahan (before/after) |
| ipAddress | String? | |
| createdAt | DateTime | |

---

## Contoh Skema Prisma (Cuplikan)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  DOKTER
  PERAWAT
  RESEPSIONIS
  APOTEKER
}

enum Gender {
  LAKI_LAKI
  PEREMPUAN
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String
  role      Role       @default(RESEPSIONIS)
  isActive  Boolean    @default(true)
  encounters Encounter[]
  auditLogs  AuditLog[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Patient {
  id           String      @id @default(cuid())
  mrNumber     String      @unique
  nik          String?     @unique
  name         String
  birthDate    DateTime
  gender       Gender
  phone        String?
  address      String?
  bpjsNumber   String?
  encounters   Encounter[]
  allergies    Allergy[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Encounter {
  id         String      @id @default(cuid())
  patientId  String
  patient    Patient     @relation(fields: [patientId], references: [id])
  doctorId   String
  doctor     User        @relation(fields: [doctorId], references: [id])
  visitDate  DateTime    @default(now())
  status     String      @default("MENUNGGU")
  subjective String?
  objective  String?
  assessment String?
  plan       String?
  vitalSign  VitalSign?
  diagnoses  Diagnosis[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

> Catatan: cuplikan di atas disederhanakan. Skema lengkap (VitalSign, Diagnosis, Drug, Prescription, AuditLog, dll) dibuat saat implementasi.

---

## Strategi Penomoran Rekam Medis (MR Number)

Format usulan: `RM-YYYYMM-XXXXX` (contoh: `RM-202606-00042`)
- `YYYYMM` — tahun & bulan registrasi
- `XXXXX` — nomor urut (5 digit, reset opsional)

Generate di service layer dengan transaction agar tidak bentrok (race condition).

---

## Pertimbangan

- **Soft delete**: data medis sebaiknya tidak dihapus permanen. Tambahkan `deletedAt` (nullable) untuk arsip.
- **Indexing**: index pada `mrNumber`, `nik`, `patientId`, `visitDate` untuk performa pencarian.
- **Timezone**: simpan UTC, tampilkan WIB/WITA/WIT sesuai lokasi.
- **Backup**: jadwalkan backup otomatis harian.
