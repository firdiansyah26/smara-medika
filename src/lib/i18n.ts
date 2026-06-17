export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_STORAGE_KEY = "smara-locale";

type FeatureText = { title: string; desc: string };

export type Dictionary = {
  common: {
    search: string;
    comingSoon: string;
    demoNotice: string;
    viewAll: string;
  };
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
  brandCard: { meaning: string; points: string[] };
  features: { heading: string; subtitle: string; items: FeatureText[] };
  cta: { heading: string; paragraph: string; button: string };
  footer: string;
  login: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    submit: string;
    forgot: string;
    backHome: string;
    note: string;
    invalid: string;
    demoHint: string;
  };
  app: {
    nav: {
      dashboard: string;
      patients: string;
      records: string;
      drugTransfer: string;
      partners: string;
      sharedApi: string;
      settings: string;
    };
    topbar: {
      searchPlaceholder: string;
      switchTenant: string;
      signOut: string;
    };
  };
  dashboardHome: {
    greeting: string;
    subtitle: string;
    stats: {
      patientsToday: string;
      activeVisits: string;
      pendingOrders: string;
      partners: string;
    };
    recentTitle: string;
    recentEmpty: string;
  };
  patients: {
    title: string;
    subtitle: string;
    add: string;
    searchPlaceholder: string;
    columns: {
      mrNumber: string;
      name: string;
      gender: string;
      age: string;
      phone: string;
      lastVisit: string;
    };
    male: string;
    female: string;
    years: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  id: {
    common: {
      search: "Cari",
      comingSoon: "segera hadir",
      demoNotice:
        "Data di bawah ini adalah contoh (mock). Akan terhubung ke database saat PostgreSQL & autentikasi disiapkan.",
      viewAll: "Lihat semua",
    },
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
        "Masuk untuk mencoba pratinjau aplikasi. Pendaftaran fasilitas akan tersedia pada rilis berikutnya.",
      button: "Masuk",
    },
    footer: "Platform Rekam Medis Elektronik",
    login: {
      title: "Masuk ke SmaraMedika",
      subtitle: "Kelola rekam medis fasilitas Anda dengan aman.",
      email: "Email",
      emailPlaceholder: "nama@fasilitas.id",
      password: "Kata sandi",
      passwordPlaceholder: "••••••••",
      submit: "Masuk",
      forgot: "Lupa kata sandi?",
      backHome: "Kembali ke beranda",
      note: "Autentikasi aktif (Auth.js). Masuk dengan akun terdaftar.",
      invalid: "Email atau kata sandi salah.",
      demoHint: "Akun demo: andi@sehatsentosa.id / password123",
    },
    app: {
      nav: {
        dashboard: "Dashboard",
        patients: "Pasien",
        records: "Rekam Medis",
        drugTransfer: "Transfer Obat",
        partners: "Rekanan",
        sharedApi: "Shared API",
        settings: "Pengaturan",
      },
      topbar: {
        searchPlaceholder: "Cari pasien, No. RM…",
        switchTenant: "Ganti fasilitas",
        signOut: "Keluar",
      },
    },
    dashboardHome: {
      greeting: "Selamat datang",
      subtitle: "Ringkasan aktivitas fasilitas Anda hari ini.",
      stats: {
        patientsToday: "Pasien hari ini",
        activeVisits: "Kunjungan aktif",
        pendingOrders: "Order obat tertunda",
        partners: "Rekanan aktif",
      },
      recentTitle: "Kunjungan terbaru",
      recentEmpty: "Belum ada kunjungan.",
    },
    patients: {
      title: "Pasien",
      subtitle: "Daftar pasien fasilitas aktif.",
      add: "Tambah Pasien",
      searchPlaceholder: "Cari nama / NIK / No. RM…",
      columns: {
        mrNumber: "No. RM",
        name: "Nama",
        gender: "Jenis Kelamin",
        age: "Usia",
        phone: "Telepon",
        lastVisit: "Kunjungan Terakhir",
      },
      male: "Laki-laki",
      female: "Perempuan",
      years: "th",
    },
  },
  en: {
    common: {
      search: "Search",
      comingSoon: "coming soon",
      demoNotice:
        "The data below is sample (mock) data. It will connect to the database once PostgreSQL & authentication are set up.",
      viewAll: "View all",
    },
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
        "Sign in to try the app preview. Facility registration will be available in the next release.",
      button: "Sign in",
    },
    footer: "Electronic Medical Records Platform",
    login: {
      title: "Sign in to SmaraMedika",
      subtitle: "Manage your facility's medical records securely.",
      email: "Email",
      emailPlaceholder: "name@facility.id",
      password: "Password",
      passwordPlaceholder: "••••••••",
      submit: "Sign in",
      forgot: "Forgot password?",
      backHome: "Back to home",
      note: "Authentication is active (Auth.js). Sign in with a registered account.",
      invalid: "Invalid email or password.",
      demoHint: "Demo account: andi@sehatsentosa.id / password123",
    },
    app: {
      nav: {
        dashboard: "Dashboard",
        patients: "Patients",
        records: "Medical Records",
        drugTransfer: "Drug Transfer",
        partners: "Partners",
        sharedApi: "Shared API",
        settings: "Settings",
      },
      topbar: {
        searchPlaceholder: "Search patients, MR no…",
        switchTenant: "Switch facility",
        signOut: "Sign out",
      },
    },
    dashboardHome: {
      greeting: "Welcome",
      subtitle: "A summary of your facility's activity today.",
      stats: {
        patientsToday: "Patients today",
        activeVisits: "Active visits",
        pendingOrders: "Pending drug orders",
        partners: "Active partners",
      },
      recentTitle: "Recent visits",
      recentEmpty: "No visits yet.",
    },
    patients: {
      title: "Patients",
      subtitle: "Patient list for the active facility.",
      add: "Add Patient",
      searchPlaceholder: "Search name / NIK / MR no…",
      columns: {
        mrNumber: "MR No.",
        name: "Name",
        gender: "Gender",
        age: "Age",
        phone: "Phone",
        lastVisit: "Last Visit",
      },
      male: "Male",
      female: "Female",
      years: "yo",
    },
  },
};
