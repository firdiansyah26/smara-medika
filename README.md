# SmaraMedika 🩺

> **Smara** (Sanskerta: _smṛti_ — ingatan, sesuatu yang tercatat) + **Medika** (medis)
> — _"Catatan/ingatan medis"_

**SmaraMedika** adalah **platform Rekam Medis Elektronik (RME) multi-tenant** untuk jaringan fasilitas kesehatan — Rumah Sakit, Klinik, dan Apotek. Banyak fasilitas berada dalam satu platform dengan data terisolasi per fasilitas, namun bisa saling terhubung melalui **rekanan** untuk **transfer obat antar-fasilitas (dengan tracking)** dan **berbagi akses pasien** secara terkontrol. Dibangun dengan teknologi web terkini agar cepat, aman, dan mudah digunakan oleh tenaga kesehatan.

**Sorotan:**

- 🏢 **Multi-tenant** — satu platform, banyak RS/Klinik/Apotek; 1 user bisa tergabung di banyak fasilitas
- 🔄 **Transfer obat antar rekanan** — pesan obat dari fasilitas rekanan + pelacakan status sampai diterima
- 👥 **Berbagi pasien terkontrol** — cari pasien lintas fasilitas, detail via persetujuan pemilik

---

## 📖 Deskripsi

SmaraMedika membantu fasilitas kesehatan mengelola data pasien, riwayat kunjungan, diagnosa, resep, hingga laporan secara digital — menggantikan pencatatan manual yang rawan hilang dan sulit dicari. Dengan antarmuka yang bersih dan alur kerja yang sederhana, dokter dan staf dapat fokus pada pelayanan pasien.

Aplikasi ini dirancang dengan mengutamakan **keamanan data medis** dan **kemudahan penggunaan**, sesuai kebutuhan layanan kesehatan di Indonesia.

---

## 📚 Dokumentasi

Dokumentasi lengkap ada di folder [`docs/`](./docs/README.md):

| Dokumen                              | Isi                                          |
| ------------------------------------ | -------------------------------------------- |
| [Fitur](./docs/FEATURES.md)          | Spesifikasi fitur + prioritas & definisi MVP |
| [Arsitektur](./docs/ARCHITECTURE.md) | Tech stack, struktur folder, pola            |
| [Database](./docs/DATABASE.md)       | Skema database & relasi                      |
| [API](./docs/API.md)                 | Spesifikasi endpoint REST                    |
| [Roadmap](./docs/ROADMAP.md)         | Rencana pengembangan bertahap                |
| [Tech Debt](./docs/TECH_DEBT.md)     | Utang teknis & keputusan teknis              |
| [Keamanan](./docs/SECURITY.md)       | Keamanan & kepatuhan regulasi                |
| [Kontribusi](./docs/CONTRIBUTING.md) | Panduan kontribusi & konvensi                |

---

## ✨ Fitur Utama

### 🏢 Multi-Tenant & Keanggotaan

- Banyak fasilitas (RS / Klinik / Apotek) dalam satu platform
- **1 user bisa tergabung di banyak tenant** dengan peran berbeda per tenant
- Tenant switcher (pilih fasilitas aktif) & isolasi data per fasilitas

### 🔄 Rekanan & Transfer Obat Antar-Fasilitas

- Manajemen rekanan (partnership) antar fasilitas
- Order obat ke apotek/RS rekanan saat stok tidak tersedia
- **Tracking status** order: diajukan → dikonfirmasi → disiapkan → dikirim → diterima
- Stok bertambah otomatis saat obat diterima

### 👥 Berbagi Pasien Lintas Fasilitas (Terkontrol)

- Pencarian pasien lintas tenant (info terbatas)
- Permintaan & persetujuan akses detail pasien ke fasilitas pemilik

### 👤 Autentikasi & Manajemen Pengguna

- Login / logout dengan keamanan password ter-hash
- **Hak akses berbasis peran (Role-Based Access Control)**: Admin, Dokter, Perawat, Resepsionis, Apoteker
- **Audit log** — mencatat siapa mengakses & mengubah data (wajib untuk data medis)

### 🧑‍🤝‍🧑 Manajemen Pasien

- Registrasi pasien baru (No. Rekam Medis otomatis, NIK, BPJS)
- Pencarian & daftar pasien
- Profil lengkap + riwayat kunjungan

### 📋 Rekam Medis (Inti)

- Catatan kunjungan dengan format **SOAP** (Subjective, Objective, Assessment, Plan)
- Diagnosa dengan kode **ICD-10**
- Pencatatan tanda vital (tekanan darah, suhu, nadi, BB/TB)
- Riwayat alergi & penyakit kronis
- Lampiran hasil pemeriksaan (PDF/gambar)

### 📅 Antrian & Pendaftaran

- Pendaftaran kunjungan / appointment
- Nomor antrian per poli/dokter
- Jadwal praktik dokter

### 💊 Resep & Farmasi

- Resep elektronik (e-prescription)
- Master data & stok obat
- Riwayat pengobatan pasien

### 💳 Billing & Penunjang

- Tagihan & pembayaran tindakan
- Order pemeriksaan lab/radiologi + input hasil

### 📊 Dashboard & Laporan

- Statistik kunjungan & diagnosa terbanyak
- Laporan harian/bulanan
- Export PDF/Excel

---

## 🛠️ Teknologi (Tech Stack)

| Lapisan         | Teknologi                                                |
| --------------- | -------------------------------------------------------- |
| **Framework**   | [Next.js](https://nextjs.org/) (App Router) — full stack |
| **API**         | Next.js Route Handlers (Node.js)                         |
| **Database**    | [PostgreSQL](https://www.postgresql.org/)                |
| **ORM**         | [Prisma](https://www.prisma.io/)                         |
| **Styling**     | [Tailwind CSS](https://tailwindcss.com/)                 |
| **Komponen UI** | [shadcn/ui](https://ui.shadcn.com/)                      |
| **Autentikasi** | [Auth.js (NextAuth)](https://authjs.dev/)                |
| **Validasi**    | [Zod](https://zod.dev/)                                  |
| **Bahasa**      | TypeScript                                               |

---

## 🚀 Memulai (Getting Started)

### Prasyarat

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) v14 atau lebih baru
- npm / pnpm / yarn

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/username/smaramedika.git
cd smaramedika

# 2. Install dependencies
npm install

# 3. Salin file environment & sesuaikan
cp .env.example .env

# 4. Jalankan migrasi database
npx prisma migrate dev

# 5. (Opsional) Isi data awal
npx prisma db seed

# 6. Jalankan aplikasi
npm run dev
```

Aplikasi berjalan di [http://localhost:3000](http://localhost:3000)

### Contoh Konfigurasi `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smaramedika"
NEXTAUTH_SECRET="ganti-dengan-secret-acak"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📂 Struktur Proyek (Rencana)

```
smaramedika/
├── prisma/              # Skema & migrasi database
├── src/
│   ├── app/             # Halaman & API routes (Next.js App Router)
│   │   ├── (auth)/      # Halaman autentikasi
│   │   ├── dashboard/   # Dashboard utama
│   │   ├── pasien/      # Manajemen pasien
│   │   └── api/         # API endpoints
│   ├── components/      # Komponen UI reusable
│   ├── lib/             # Utilitas (db, auth, helpers)
│   └── types/           # Tipe TypeScript
├── public/              # Aset statis
└── README.md
```

---

## 🔒 Keamanan & Kepatuhan

Data medis bersifat sangat sensitif. SmaraMedika menerapkan:

- 🔐 Password ter-hash (bcrypt/argon2)
- 📝 Audit trail untuk setiap akses & perubahan rekam medis
- 🔑 Kontrol akses berbasis peran
- 💾 Anjuran backup database rutin

Pengembangan mengacu pada regulasi terkait:

- **UU No. 27 Tahun 2022** tentang Pelindungan Data Pribadi (UU PDP)
- **Permenkes** tentang Rekam Medis Elektronik (RME)

---

## 🗺️ Roadmap

- [x] Perencanaan + scaffold + fondasi (Next.js 16, Prisma, Auth.js, shadcn)
- [x] **MVP**: Auth & RBAC, Multi-tenant, Manajemen Pasien, Rekam Medis SOAP (+ indikator vital), Dashboard
- [x] **Operasional (sebagian)**: Antrian (kiosk/display/suara), Farmasi (stok)
- [ ] Berikutnya: rekanan & transfer obat, berbagi pasien lintas tenant, resep, laporan, Shared API

Status detail & terbaru: lihat [docs/ROADMAP.md](./docs/ROADMAP.md).

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buka _issue_ atau _pull request_.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">Dibuat dengan ❤️ untuk pelayanan kesehatan yang lebih baik di Indonesia</p>
