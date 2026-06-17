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
    ageParts: { years: string; months: string; days: string };
    form: {
      newTitle: string;
      editTitle: string;
      name: string;
      nik: string;
      birthDate: string;
      gender: string;
      bloodType: string;
      phone: string;
      address: string;
      city: string;
      bpjs: string;
      emergencyContact: string;
      selectGender: string;
      selectBlood: string;
      save: string;
      saving: string;
      cancel: string;
      optional: string;
    };
    detail: {
      back: string;
      edit: string;
      deleteBtn: string;
      deleteConfirm: string;
      infoTitle: string;
      visitsTitle: string;
      allergiesTitle: string;
      noVisits: string;
      noAllergies: string;
      addAllergyTitle: string;
      allergen: string;
      reaction: string;
      severity: string;
      selectSeverity: string;
      sevRingan: string;
      sevSedang: string;
      sevBerat: string;
      addAllergyBtn: string;
      notFound: string;
      identity: string;
      contact: string;
      administration: string;
      registered: string;
      ageLabel: string;
    };
  };
  records: {
    title: string;
    subtitle: string;
    empty: string;
    newVisit: string;
    columns: { date: string; patient: string; status: string; diagnoses: string };
    status: { MENUNGGU: string; DIPERIKSA: string; SELESAI: string };
    editor: {
      back: string;
      save: string;
      saving: string;
      saved: string;
      statusLabel: string;
      soapTitle: string;
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
      vitalsTitle: string;
      bloodPressure: string;
      temperature: string;
      heartRate: string;
      respiratoryRate: string;
      spo2: string;
      weight: string;
      height: string;
      diagnosesTitle: string;
      searchIcd: string;
      noDiagnoses: string;
      type: string;
      primer: string;
      sekunder: string;
      add: string;
      vitalAlertsTitle: string;
      vitalAlerts: {
        bpLow: string;
        bpElevated: string;
        bpHigh: string;
        bpCrisis: string;
        tempLow: string;
        tempFever: string;
        hrLow: string;
        hrHigh: string;
        rrLow: string;
        rrHigh: string;
        spo2Low: string;
        spo2Crit: string;
        bmiUnder: string;
        bmiOver: string;
        bmiObese: string;
      };
    };
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
      ageParts: { years: "tahun", months: "bulan", days: "hari" },
      form: {
        newTitle: "Pasien Baru",
        editTitle: "Edit Pasien",
        name: "Nama lengkap",
        nik: "NIK",
        birthDate: "Tanggal lahir",
        gender: "Jenis kelamin",
        bloodType: "Golongan darah",
        phone: "Telepon",
        address: "Alamat",
        city: "Kota",
        bpjs: "No. BPJS",
        emergencyContact: "Kontak darurat",
        selectGender: "Pilih jenis kelamin",
        selectBlood: "Pilih golongan darah",
        save: "Simpan",
        saving: "Menyimpan…",
        cancel: "Batal",
        optional: "opsional",
      },
      detail: {
        back: "Kembali",
        edit: "Edit",
        deleteBtn: "Hapus",
        deleteConfirm: "Hapus pasien ini? (arsip, bisa dipulihkan)",
        infoTitle: "Informasi Pasien",
        visitsTitle: "Riwayat Kunjungan",
        allergiesTitle: "Riwayat Alergi",
        noVisits: "Belum ada kunjungan.",
        noAllergies: "Belum ada alergi tercatat.",
        addAllergyTitle: "Tambah alergi",
        allergen: "Alergen",
        reaction: "Reaksi",
        severity: "Tingkat",
        selectSeverity: "Pilih tingkat",
        sevRingan: "Ringan",
        sevSedang: "Sedang",
        sevBerat: "Berat",
        addAllergyBtn: "Tambah",
        notFound: "Pasien tidak ditemukan.",
        identity: "Identitas",
        contact: "Kontak",
        administration: "Administrasi",
        registered: "Terdaftar",
        ageLabel: "Umur",
      },
    },
    records: {
      title: "Rekam Medis",
      subtitle: "Kunjungan & catatan medis fasilitas aktif.",
      empty: "Belum ada kunjungan.",
      newVisit: "Kunjungan Baru",
      columns: {
        date: "Tanggal",
        patient: "Pasien",
        status: "Status",
        diagnoses: "Diagnosa",
      },
      status: { MENUNGGU: "Menunggu", DIPERIKSA: "Diperiksa", SELESAI: "Selesai" },
      editor: {
        back: "Kembali",
        save: "Simpan",
        saving: "Menyimpan…",
        saved: "Tersimpan",
        statusLabel: "Status kunjungan",
        soapTitle: "Catatan SOAP",
        subjective: "Subjective (keluhan)",
        objective: "Objective (pemeriksaan)",
        assessment: "Assessment (penilaian)",
        plan: "Plan (rencana)",
        vitalsTitle: "Tanda Vital",
        bloodPressure: "Tekanan darah (sistol/diastol)",
        temperature: "Suhu (°C)",
        heartRate: "Nadi (x/mnt)",
        respiratoryRate: "Napas (x/mnt)",
        spo2: "SpO₂ (%)",
        weight: "Berat (kg)",
        height: "Tinggi (cm)",
        diagnosesTitle: "Diagnosa (ICD-10)",
        searchIcd: "Cari kode/nama ICD-10…",
        noDiagnoses: "Belum ada diagnosa.",
        type: "Tipe",
        primer: "Primer",
        sekunder: "Sekunder",
        add: "Tambah",
        vitalAlertsTitle: "Catatan tanda vital",
        vitalAlerts: {
          bpLow: "Tekanan darah rendah (hipotensi). Pertimbangkan evaluasi.",
          bpElevated: "Tekanan darah meningkat. Pantau & sarankan gaya hidup sehat.",
          bpHigh: "Tekanan darah tinggi (hipertensi). Harap evaluasi lebih lanjut.",
          bpCrisis: "Krisis hipertensi! Perlu penanganan segera.",
          tempLow: "Suhu tubuh rendah (hipotermia).",
          tempFever: "Demam. Pantau & cari penyebab.",
          hrLow: "Nadi lambat (bradikardia).",
          hrHigh: "Nadi cepat (takikardia).",
          rrLow: "Laju napas lambat.",
          rrHigh: "Laju napas cepat (takipnea).",
          spo2Low: "Saturasi oksigen rendah. Pantau.",
          spo2Crit: "Saturasi oksigen sangat rendah (hipoksemia)! Perhatian.",
          bmiUnder: "IMT: berat badan kurang.",
          bmiOver: "IMT: berat badan berlebih.",
          bmiObese: "IMT: obesitas.",
        },
      },
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
      ageParts: { years: "years", months: "months", days: "days" },
      form: {
        newTitle: "New Patient",
        editTitle: "Edit Patient",
        name: "Full name",
        nik: "National ID (NIK)",
        birthDate: "Date of birth",
        gender: "Gender",
        bloodType: "Blood type",
        phone: "Phone",
        address: "Address",
        city: "City",
        bpjs: "BPJS no.",
        emergencyContact: "Emergency contact",
        selectGender: "Select gender",
        selectBlood: "Select blood type",
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        optional: "optional",
      },
      detail: {
        back: "Back",
        edit: "Edit",
        deleteBtn: "Delete",
        deleteConfirm: "Delete this patient? (archived, recoverable)",
        infoTitle: "Patient Information",
        visitsTitle: "Visit History",
        allergiesTitle: "Allergy History",
        noVisits: "No visits yet.",
        noAllergies: "No allergies recorded.",
        addAllergyTitle: "Add allergy",
        allergen: "Allergen",
        reaction: "Reaction",
        severity: "Severity",
        selectSeverity: "Select severity",
        sevRingan: "Mild",
        sevSedang: "Moderate",
        sevBerat: "Severe",
        addAllergyBtn: "Add",
        notFound: "Patient not found.",
        identity: "Identity",
        contact: "Contact",
        administration: "Administration",
        registered: "Registered",
        ageLabel: "Age",
      },
    },
    records: {
      title: "Medical Records",
      subtitle: "Visits & medical notes for the active facility.",
      empty: "No visits yet.",
      newVisit: "New Visit",
      columns: {
        date: "Date",
        patient: "Patient",
        status: "Status",
        diagnoses: "Diagnoses",
      },
      status: { MENUNGGU: "Waiting", DIPERIKSA: "In progress", SELESAI: "Done" },
      editor: {
        back: "Back",
        save: "Save",
        saving: "Saving…",
        saved: "Saved",
        statusLabel: "Visit status",
        soapTitle: "SOAP Notes",
        subjective: "Subjective (complaint)",
        objective: "Objective (examination)",
        assessment: "Assessment",
        plan: "Plan",
        vitalsTitle: "Vital Signs",
        bloodPressure: "Blood pressure (sys/dia)",
        temperature: "Temperature (°C)",
        heartRate: "Heart rate (bpm)",
        respiratoryRate: "Resp. rate (/min)",
        spo2: "SpO₂ (%)",
        weight: "Weight (kg)",
        height: "Height (cm)",
        diagnosesTitle: "Diagnoses (ICD-10)",
        searchIcd: "Search ICD-10 code/name…",
        noDiagnoses: "No diagnoses yet.",
        type: "Type",
        primer: "Primary",
        sekunder: "Secondary",
        add: "Add",
        vitalAlertsTitle: "Vital sign notes",
        vitalAlerts: {
          bpLow: "Low blood pressure (hypotension). Consider evaluation.",
          bpElevated: "Elevated blood pressure. Monitor & advise healthy lifestyle.",
          bpHigh: "High blood pressure (hypertension). Please evaluate further.",
          bpCrisis: "Hypertensive crisis! Immediate attention needed.",
          tempLow: "Low body temperature (hypothermia).",
          tempFever: "Fever. Monitor & find the cause.",
          hrLow: "Slow heart rate (bradycardia).",
          hrHigh: "Fast heart rate (tachycardia).",
          rrLow: "Slow respiratory rate.",
          rrHigh: "Fast respiratory rate (tachypnea).",
          spo2Low: "Low oxygen saturation. Monitor.",
          spo2Crit: "Very low oxygen saturation (hypoxemia)! Attention.",
          bmiUnder: "BMI: underweight.",
          bmiOver: "BMI: overweight.",
          bmiObese: "BMI: obese.",
        },
      },
    },
  },
};
