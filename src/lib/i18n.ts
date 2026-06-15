export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_STORAGE_KEY = "smara-locale";

type FeatureText = { title: string; desc: string };

export type Dictionary = {
  nav: { features: string; signIn: string };
  hero: {
    badge: string;
    headingLead: string;
    headingHighlight: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  tenantTypes: string[]; // [Rumah Sakit, Klinik, Apotek]
  brandCard: {
    meaning: string;
    points: string[];
  };
  features: { heading: string; subtitle: string; items: FeatureText[] };
  cta: { heading: string; paragraph: string; button: string };
  footer: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  id: {
    nav: { features: "Fitur", signIn: "Masuk" },
    hero: {
      badge: "Platform RME Multi-Tenant",
      headingLead: "Catatan medis yang",
      headingHighlight: "terhubung & terpercaya",
      paragraph:
        "SmaraMedika menyatukan Rumah Sakit, Klinik, dan Apotek dalam satu platform — rekam medis digital, transfer obat antar rekanan dengan tracking, dan berbagi pasien yang terkontrol.",
      ctaPrimary: "Mulai Sekarang",
      ctaSecondary: "Pelajari Fitur",
    },
    tenantTypes: ["Rumah Sakit", "Klinik", "Apotek"],
    brandCard: {
      meaning: "Smara (ingatan/catatan) + Medika (medis)",
      points: [
        "Rekam medis SOAP + ICD-10",
        "Transfer obat + tracking",
        "Akses pasien terkontrol",
      ],
    },
    features: {
      heading: "Semua kebutuhan fasilitas kesehatan",
      subtitle:
        "Dari pencatatan harian hingga jaringan antar-fasilitas, dalam satu platform yang aman.",
      items: [
        {
          title: "Multi-Tenant",
          desc: "Banyak RS, Klinik, & Apotek dalam satu platform. Satu akun bisa tergabung di banyak fasilitas dengan peran berbeda.",
        },
        {
          title: "Rekam Medis SOAP",
          desc: "Catatan kunjungan terstruktur (SOAP), diagnosa ICD-10, tanda vital, dan riwayat alergi dalam satu tempat.",
        },
        {
          title: "Transfer Obat Antar Rekanan",
          desc: "Pesan obat dari fasilitas rekanan saat stok kosong, lengkap dengan pelacakan status hingga obat diterima.",
        },
        {
          title: "Berbagi Pasien Terkontrol",
          desc: "Cari pasien lintas fasilitas dengan info terbatas; detail hanya terbuka setelah disetujui fasilitas pemilik.",
        },
        {
          title: "Shared API",
          desc: "API publik per tenant untuk integrasi pihak ketiga — API key, scope, rate limit, dan webhook.",
        },
        {
          title: "Aman & Patuh Regulasi",
          desc: "Audit log, kontrol akses berbasis peran, dan isolasi data per tenant — selaras UU PDP & Permenkes RME.",
        },
      ],
    },
    cta: {
      heading: "Siap mendigitalkan layanan kesehatan Anda?",
      paragraph:
        "SmaraMedika masih dalam pengembangan. Halaman masuk & pendaftaran akan tersedia pada rilis berikutnya.",
      button: "Masuk · segera hadir",
    },
    footer: "Platform Rekam Medis Elektronik",
  },
  en: {
    nav: { features: "Features", signIn: "Sign in" },
    hero: {
      badge: "Multi-Tenant EMR Platform",
      headingLead: "Medical records that are",
      headingHighlight: "connected & trusted",
      paragraph:
        "SmaraMedika unites Hospitals, Clinics, and Pharmacies on a single platform — digital medical records, drug transfers between partners with tracking, and controlled patient sharing.",
      ctaPrimary: "Get Started",
      ctaSecondary: "Explore Features",
    },
    tenantTypes: ["Hospital", "Clinic", "Pharmacy"],
    brandCard: {
      meaning: "Smara (memory/record) + Medika (medical)",
      points: [
        "SOAP records + ICD-10",
        "Drug transfer + tracking",
        "Controlled patient access",
      ],
    },
    features: {
      heading: "Everything a healthcare facility needs",
      subtitle:
        "From daily charting to cross-facility networks, on one secure platform.",
      items: [
        {
          title: "Multi-Tenant",
          desc: "Many Hospitals, Clinics & Pharmacies on one platform. One account can join multiple facilities with different roles.",
        },
        {
          title: "SOAP Medical Records",
          desc: "Structured visit notes (SOAP), ICD-10 diagnoses, vital signs, and allergy history in one place.",
        },
        {
          title: "Inter-Partner Drug Transfer",
          desc: "Order drugs from partner facilities when out of stock, with full status tracking until the drugs are received.",
        },
        {
          title: "Controlled Patient Sharing",
          desc: "Search patients across facilities with limited info; details open only after approval from the owning facility.",
        },
        {
          title: "Shared API",
          desc: "Per-tenant public API for third-party integration — API keys, scopes, rate limits, and webhooks.",
        },
        {
          title: "Secure & Compliant",
          desc: "Audit logs, role-based access control, and per-tenant data isolation — aligned with Indonesia's PDP Law & EMR regulations.",
        },
      ],
    },
    cta: {
      heading: "Ready to digitize your healthcare services?",
      paragraph:
        "SmaraMedika is still under development. Sign-in & registration pages will be available in the next release.",
      button: "Sign in · coming soon",
    },
    footer: "Electronic Medical Records Platform",
  },
};
