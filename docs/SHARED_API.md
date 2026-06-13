# 🔗 Shared API (API Publik Pihak Ketiga) — SmaraMedika

> **Technical Design Document**

Shared API adalah **API publik per tenant** yang memungkinkan sistem eksternal (mis. SIM-RS lain,
aplikasi mitra, integrator) mengakses data SmaraMedika **milik tenant tersebut** secara aman &
terkontrol — lengkap dengan **API key**, **scope izin**, **rate limit**, dan **webhook**.

- **Status:** 🟢 P2 (lanjutan) — dibangun setelah fondasi multi-tenant & fitur inti stabil.
- **Audiens:** developer integrator / mitra tenant.
- **Prinsip:** *tenant-scoped, least-privilege, auditable, tidak menembus consent yang sudah ada.*

---

## 1. Ringkasan & Use Case

| Use case | Contoh |
|----------|--------|
| Integrasi SIM-RS | RS menarik/menyetor data kunjungan dari sistem internal mereka |
| Aplikasi mitra | Aplikasi antrian/registrasi pihak ketiga membuat pasien & encounter |
| Apotek eksternal | Sistem apotek menerima notifikasi order obat & update status (tracking) |
| Analitik/BI | Tarik data agregat (read-only) untuk dashboard eksternal |
| Otomasi | Webhook memicu workflow di sistem luar saat status order berubah |

**Bukan untuk:** akses lintas tenant tanpa izin. Semua aturan consent internal tetap berlaku
(lihat `FEATURES.md` & `SECURITY.md`).

---

## 2. Konsep Inti

- **Consumer** = sistem eksternal yang bertindak **atas nama satu tenant**.
- Setiap request membawa **API key** yang **terikat ke satu tenant** → server otomatis men-scope
  semua data ke `tenantId` pemilik key.
- API key memiliki **scope** (izin granular). Operasi di luar scope → `403`.
- **Akses lintas tenant tetap tunduk consent**: data pasien tenant lain hanya bisa diakses bila ada
  `PatientAccessRequest` `APPROVED`; transfer obat hanya ke `TenantPartnership` `ACTIVE`. API key
  **tidak** memberi jalan pintas terhadap aturan ini.

```
[Sistem Eksternal Tenant A]
        │  Authorization: Bearer sk_live_...
        ▼
[Public API /api/v1/*]  ──►  validasi key → tenant A → cek scope → rate limit
        │                                              │
        ▼                                              ▼
   Service Layer (tenant-scoped)               ApiRequestLog (audit)
        │
        ▼
   PostgreSQL (filter tenantId = A)
```

---

## 3. Autentikasi

### API Key
- Format ditampilkan **sekali** saat dibuat: `sk_live_<prefix>_<secret>` (mis. `sk_live_ab12cd_3f9...`).
  - `prefix` (publik) → untuk identifikasi & tampil di daftar key.
  - `secret` → **hanya di-hash** (argon2/bcrypt) di DB; tidak pernah disimpan/ditampilkan ulang.
- Mode: `sk_live_...` (produksi) & `sk_test_...` (sandbox).

### Cara mengirim
```http
GET /api/v1/patients HTTP/1.1
Host: api.smaramedika.id
Authorization: Bearer sk_live_ab12cd_3f9...
```
Alternatif header: `X-API-Key: sk_live_...`.

### Siklus hidup
- **Buat / cabut / rotasi** key dari dashboard tenant (peran OWNER/ADMIN).
- **Rotasi**: buat key baru → migrasi → cabut key lama (grace period opsional).
- **Kedaluwarsa**: `expiresAt` opsional; key kedaluwarsa ditolak `401`.

---

## 4. Otorisasi & Scope

Scope mengikuti pola `resource:action` (least-privilege — beri seminimal mungkin).

| Scope | Izin |
|-------|------|
| `patients:read` | Baca data pasien (sesuai consent) |
| `patients:write` | Buat/ubah pasien |
| `encounters:read` | Baca rekam medis/kunjungan |
| `encounters:write` | Buat/ubah kunjungan & SOAP |
| `stock:read` | Baca stok obat tenant |
| `drug-orders:read` | Baca order transfer obat |
| `drug-orders:write` | Buat/ubah status order (sesuai sisi tenant) |
| `webhooks:manage` | Kelola endpoint webhook via API |

- Key menyimpan daftar scope; request di luar scope → `403 { code: "INSUFFICIENT_SCOPE" }`.
- Scope **tidak** memperluas batas tenant/consent — hanya membatasi di dalamnya.

---

## 5. Endpoint Publik (`/api/v1`)

Subset terkontrol dari API internal, dirancang stabil untuk konsumsi eksternal.

| Method | Endpoint | Scope | Catatan |
|--------|----------|-------|---------|
| GET | `/api/v1/patients` | `patients:read` | Daftar pasien tenant (pagination) |
| POST | `/api/v1/patients` | `patients:write` | Buat pasien (idempotency key) |
| GET | `/api/v1/patients/:id` | `patients:read` | Detail (consent berlaku) |
| GET | `/api/v1/patients/:id/encounters` | `encounters:read` | Riwayat kunjungan |
| POST | `/api/v1/encounters` | `encounters:write` | Buat kunjungan |
| GET | `/api/v1/encounters/:id` | `encounters:read` | Detail rekam medis |
| GET | `/api/v1/stock` | `stock:read` | Stok obat tenant |
| GET | `/api/v1/drug-orders` | `drug-orders:read` | Order masuk/keluar |
| POST | `/api/v1/drug-orders` | `drug-orders:write` | Buat order ke rekanan |
| PATCH | `/api/v1/drug-orders/:id/status` | `drug-orders:write` | Update status (tracking) |

> Endpoint publik **versi** (`/v1`) dijaga kompatibilitasnya; perubahan breaking → versi baru.

---

## 6. Rate Limiting & Kuota

- Batas **per API key** (mis. `1000 req / menit`, dapat dikonfigurasi per tenant/plan).
- Header pada setiap respons:
  ```
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 987
  X-RateLimit-Reset: 1718270400
  ```
- Melebihi batas → `429 Too Many Requests` + header `Retry-After`.
- Implementasi: token bucket / sliding window. Awal boleh in-memory, produksi → **Redis**
  (lihat tech debt).

---

## 7. Webhook

Notifikasi event dari SmaraMedika ke URL milik tenant.

### Event (contoh)
| Event | Dipicu saat |
|-------|-------------|
| `patient.created` | Pasien baru dibuat |
| `encounter.created` | Kunjungan baru |
| `encounter.updated` | SOAP/status kunjungan berubah |
| `drug_order.status_changed` | Status order transfer obat berubah |
| `patient_access.responded` | Permintaan akses pasien disetujui/ditolak |

### Pengiriman & Keamanan
- `POST` ke `WebhookEndpoint.url` dengan body JSON `{ id, event, data, createdAt }`.
- **HMAC signature**: header `X-Smara-Signature: sha256=<hmac(secret, rawBody)>` → consumer
  memverifikasi keaslian.
- **Retry** dengan exponential backoff (mis. 5x), lalu **dead-letter**; status tiap percobaan
  tercatat (`WebhookDelivery`).
- Idempotensi: consumer harus tahan terhadap pengiriman ganda (gunakan `id` event).

---

## 8. Konvensi API

### Format Error (konsisten dgn `API.md`)
```json
{ "success": false, "error": { "code": "INSUFFICIENT_SCOPE", "message": "..." } }
```
Kode umum: `UNAUTHORIZED`, `INSUFFICIENT_SCOPE`, `RATE_LIMITED`, `VALIDATION_ERROR`,
`NOT_FOUND`, `CONSENT_REQUIRED`.

### Pagination
- Query `?page=&limit=` (default `page=1`, `limit=20`, `limit` maks 100).
- Respons menyertakan `meta: { page, limit, total }`.

### Idempotency (operasi tulis)
- Header `Idempotency-Key: <uuid>` pada `POST` → request berulang dengan key sama mengembalikan
  hasil yang sama (cegah duplikasi, mis. pasien/order ganda).

### Versioning & Deprecation
- Prefix versi: `/api/v1`. Perubahan breaking → `/api/v2`.
- Saat sebuah versi disunset: header `Sunset: <tanggal>` + pengumuman di changelog.

---

## 9. Keamanan

- **Penyimpanan kunci**: hanya simpan **hash** secret + `prefix`. Secret asli tidak pernah disimpan.
- **Transport**: HTTPS wajib.
- **Least privilege**: minta scope seperlunya; default tanpa scope = tidak bisa apa-apa.
- **IP allowlist** (opsional) per key.
- **Audit**: setiap request publik tercatat (`ApiRequestLog`) — key, endpoint, status, latency, IP.
- **Isolasi**: key tenant A **tidak pernah** mengakses data tenant B; akses lintas tenant tetap
  lewat consent internal.
- **Sandbox vs Production**: key `sk_test_` beroperasi pada data uji/terpisah; tidak memicu webhook
  produksi.
- **Rotasi & revokasi** cepat bila key bocor.

> Lihat `SECURITY.md` untuk prinsip keamanan platform secara umum & kepatuhan (UU PDP, RME).

---

## 10. Dokumentasi Kontrak (OpenAPI)

- **OpenAPI 3.1** sebagai sumber kebenaran kontrak Public API → generate referensi & SDK client.
- Sajikan **portal developer**: daftar endpoint, contoh, halaman kelola API key & webhook,
  changelog versi.

---

## 11. Status & Batasan Awal

Cakupan awal (saat fitur ini mulai dibangun) **direncanakan** mencakup: API key + scope, endpoint
`/v1` read untuk pasien/encounter/stok, rate limit dasar, dan webhook untuk `drug_order.status_changed`.
Yang **belum** tercakup di awal (lihat `TECH_DEBT.md`): OAuth2/OIDC penuh, marketplace API,
SDK resmi, kuota berbasis paket/billing.
