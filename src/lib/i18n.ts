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
    resetSuccess: string;
    forgotTitle: string;
    forgotSubtitle: string;
    sendLink: string;
    sentNotice: string;
    devLinkNotice: string;
    openResetLink: string;
    resetTitle: string;
    resetSubtitle: string;
    newPassword: string;
    confirmPassword: string;
    resetSubmit: string;
    errWeak: string;
    errMismatch: string;
    errExpired: string;
  };
  app: {
    nav: {
      dashboard: string;
      patients: string;
      records: string;
      queue: string;
      appointments: string;
      pharmacy: string;
      drugTransfer: string;
      partners: string;
      patientAccess: string;
      billing: string;
      diagnostics: string;
      reports: string;
      sharedApi: string;
      notifications: string;
      telemedicine: string;
      integrations: string;
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
    period: { label: string; today: string; week: string; month: string; all: string };
    topDiagnoses: string;
    visitsInPeriod: string;
    noDiagnoses: string;
    cases: string;
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
      medsTitle: string;
      noVisits: string;
      noAllergies: string;
      noMeds: string;
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
      rxTitle: string;
      rxSelectDrug: string;
      rxDosage: string;
      rxFrequency: string;
      rxQty: string;
      rxInstruction: string;
      rxEmpty: string;
      rxPrint: string;
      rxNoStock: string;
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
  queue: {
    services: { BPJS: string; ASURANSI: string; UMUM: string };
    kiosk: {
      title: string;
      subtitle: string;
      pick: string;
      yourNumber: string;
      goWait: string;
      print: string;
      takeAnother: string;
      ticket: string;
    };
    display: {
      title: string;
      nowServing: string;
      counter: string;
      waiting: string;
      idle: string;
      announceTemplate: string;
    };
    panel: {
      title: string;
      subtitle: string;
      selectCounter: string;
      callNext: string;
      recall: string;
      serve: string;
      skip: string;
      waiting: string;
      called: string;
      noWaiting: string;
      openDisplay: string;
      openKiosk: string;
      number: string;
    };
  };
  pharmacy: {
    title: string;
    subtitle: string;
    addTitle: string;
    name: string;
    generic: string;
    unit: string;
    category: string;
    quantity: string;
    price: string;
    add: string;
    save: string;
    search: string;
    empty: string;
    lowStock: string;
    optional: string;
    colStock: string;
    colAction: string;
  };
  partners: {
    title: string;
    subtitle: string;
    inviteTitle: string;
    selectTenant: string;
    send: string;
    incoming: string;
    active: string;
    outgoing: string;
    approve: string;
    reject: string;
    end: string;
    pending: string;
    noIncoming: string;
    noActive: string;
    noCandidates: string;
    endConfirm: string;
  };
  transfer: {
    title: string;
    subtitle: string;
    outgoing: string;
    incoming: string;
    newOrder: string;
    partner: string;
    drug: string;
    quantity: string;
    stock: string;
    note: string;
    create: string;
    selectPartner: string;
    selectDrug: string;
    orderNo: string;
    items: string;
    empty: string;
    noPartners: string;
    back: string;
    timeline: string;
    advance: string;
    receive: string;
    reject: string;
    cancel: string;
    statuses: {
      REQUESTED: string;
      CONFIRMED: string;
      PREPARING: string;
      SHIPPED: string;
      IN_TRANSIT: string;
      DELIVERED: string;
      RECEIVED: string;
      REJECTED: string;
      CANCELLED: string;
    };
  };
  access: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    search: string;
    owner: string;
    requestAccess: string;
    requested: string;
    incoming: string;
    outgoing: string;
    approve: string;
    reject: string;
    revoke: string;
    reasonPlaceholder: string;
    view: string;
    noResults: string;
    noIncoming: string;
    noOutgoing: string;
    expiresOn: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    statusRevoked: string;
    viewTitle: string;
    allergies: string;
    visits: string;
    noAllergies: string;
    noVisits: string;
    back: string;
    noAccess: string;
  };
  reports: {
    title: string;
    subtitle: string;
    typeVisits: string;
    typeTransfer: string;
    exportCsv: string;
    print: string;
    total: string;
    empty: string;
    colDate: string;
    colPatient: string;
    colDoctor: string;
    colStatus: string;
    colDiagnoses: string;
    colOrderNo: string;
    colDirection: string;
    colPartner: string;
    colQty: string;
    dirOut: string;
    dirIn: string;
  };
  settings: {
    title: string;
    subtitle: string;
    membersTitle: string;
    colName: string;
    colEmail: string;
    colRole: string;
    colStatus: string;
    colAction: string;
    active: string;
    inactive: string;
    you: string;
    removeBtn: string;
    removeConfirm: string;
    inviteTitle: string;
    inviteHint: string;
    fName: string;
    fEmail: string;
    fRole: string;
    fPassword: string;
    inviteBtn: string;
    invited: string;
    readOnly: string;
    roles: {
      OWNER: string;
      ADMIN: string;
      DOKTER: string;
      PERAWAT: string;
      RESEPSIONIS: string;
      APOTEKER: string;
    };
    errors: {
      required: string;
      exists: string;
      lastOwner: string;
      self: string;
      notAllowed: string;
    };
  };
  billing: {
    title: string;
    subtitle: string;
    newInvoice: string;
    create: string;
    selectPatient: string;
    colNo: string;
    colPatient: string;
    colDate: string;
    colTotal: string;
    colStatus: string;
    empty: string;
    back: string;
    itemsTitle: string;
    addItem: string;
    category: string;
    description: string;
    qty: string;
    unitPrice: string;
    amount: string;
    remove: string;
    subtotal: string;
    discount: string;
    grandTotal: string;
    saveDiscount: string;
    issue: string;
    markPaid: string;
    cancel: string;
    cancelConfirm: string;
    print: string;
    noItems: string;
    paidAt: string;
    invoiceLabel: string;
    billTo: string;
    statuses: {
      DRAFT: string;
      UNPAID: string;
      PAID: string;
      CANCELLED: string;
    };
    categories: {
      CONSULTATION: string;
      DRUG: string;
      PROCEDURE: string;
      LAB: string;
      OTHER: string;
    };
  };
  appointments: {
    title: string;
    subtitle: string;
    newAppt: string;
    book: string;
    selectPatient: string;
    selectDoctor: string;
    dateTime: string;
    duration: string;
    minutes: string;
    reason: string;
    colTime: string;
    colPatient: string;
    colDoctor: string;
    colReason: string;
    colStatus: string;
    colAction: string;
    empty: string;
    confirm: string;
    cancel: string;
    noShow: string;
    startVisit: string;
    cancelConfirm: string;
    filterToday: string;
    filterUpcoming: string;
    filterAll: string;
    statuses: {
      SCHEDULED: string;
      CONFIRMED: string;
      COMPLETED: string;
      CANCELLED: string;
      NO_SHOW: string;
    };
  };
  sharedApi: {
    title: string;
    subtitle: string;
    keysTitle: string;
    newKeyTitle: string;
    fName: string;
    fMode: string;
    fScopes: string;
    createBtn: string;
    modeLive: string;
    modeTest: string;
    tokenOnceTitle: string;
    tokenOnceHint: string;
    colName: string;
    colPrefix: string;
    colScopes: string;
    colStatus: string;
    colLastUsed: string;
    colAction: string;
    active: string;
    revoked: string;
    never: string;
    revoke: string;
    revokeConfirm: string;
    noKeys: string;
    readOnly: string;
    usageTitle: string;
    totalRequests: string;
    colMethod: string;
    colPath: string;
    colCode: string;
    colTime: string;
    noRequests: string;
    endpointsTitle: string;
    endpointsHint: string;
    errRequired: string;
  };
  diagnostics: {
    title: string;
    subtitle: string;
    newOrder: string;
    selectPatient: string;
    category: string;
    clinicalNote: string;
    catLab: string;
    catRad: string;
    colNo: string;
    colPatient: string;
    colCategory: string;
    colDate: string;
    colStatus: string;
    empty: string;
    back: string;
    itemsTitle: string;
    addTest: string;
    testName: string;
    unit: string;
    refRange: string;
    result: string;
    flag: string;
    selectFlag: string;
    save: string;
    remove: string;
    noItems: string;
    start: string;
    complete: string;
    cancel: string;
    cancelConfirm: string;
    print: string;
    completedAt: string;
    statuses: {
      REQUESTED: string;
      IN_PROGRESS: string;
      COMPLETED: string;
      CANCELLED: string;
    };
    flags: {
      NORMAL: string;
      LOW: string;
      HIGH: string;
      ABNORMAL: string;
    };
  };
  soon: {
    badge: string;
    plannedTitle: string;
    note: string;
    features: {
      notifikasi: { title: string; desc: string; items: string[] };
      telemedicine: { title: string; desc: string; items: string[] };
      integrasi: { title: string; desc: string; items: string[] };
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
      resetSuccess: "Kata sandi berhasil diubah. Silakan masuk.",
      forgotTitle: "Lupa kata sandi",
      forgotSubtitle: "Masukkan email Anda untuk membuat tautan reset.",
      sendLink: "Buat tautan reset",
      sentNotice:
        "Jika email terdaftar, tautan reset telah dibuat.",
      devLinkNotice:
        "Mode dev (tanpa email): gunakan tautan di bawah untuk mengatur ulang kata sandi.",
      openResetLink: "Buka tautan reset",
      resetTitle: "Atur ulang kata sandi",
      resetSubtitle: "Masukkan kata sandi baru Anda.",
      newPassword: "Kata sandi baru",
      confirmPassword: "Ulangi kata sandi",
      resetSubmit: "Simpan kata sandi",
      errWeak: "Kata sandi minimal 8 karakter.",
      errMismatch: "Konfirmasi kata sandi tidak cocok.",
      errExpired: "Tautan reset tidak valid atau kedaluwarsa.",
    },
    app: {
      nav: {
        dashboard: "Dashboard",
        patients: "Pasien",
        records: "Rekam Medis",
        queue: "Antrian",
        appointments: "Jadwal",
        pharmacy: "Farmasi",
        drugTransfer: "Transfer Obat",
        partners: "Rekanan",
        patientAccess: "Akses Pasien",
        billing: "Tagihan",
        diagnostics: "Lab & Radiologi",
        reports: "Laporan",
        sharedApi: "Shared API",
        notifications: "Notifikasi",
        telemedicine: "Telemedicine",
        integrations: "Integrasi",
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
      period: {
        label: "Periode",
        today: "Hari ini",
        week: "7 hari",
        month: "30 hari",
        all: "Semua",
      },
      topDiagnoses: "Diagnosa terbanyak",
      visitsInPeriod: "Kunjungan periode ini",
      noDiagnoses: "Belum ada diagnosa pada periode ini.",
      cases: "kasus",
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
        medsTitle: "Riwayat Pengobatan",
        noVisits: "Belum ada kunjungan.",
        noAllergies: "Belum ada alergi tercatat.",
        noMeds: "Belum ada riwayat pengobatan.",
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
        rxTitle: "Resep",
        rxSelectDrug: "Pilih obat",
        rxDosage: "Dosis",
        rxFrequency: "Frekuensi",
        rxQty: "Jumlah",
        rxInstruction: "Aturan pakai",
        rxEmpty: "Belum ada resep.",
        rxPrint: "Cetak resep",
        rxNoStock: "Belum ada obat di stok fasilitas. Tambahkan di menu Farmasi.",
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
    queue: {
      services: { BPJS: "BPJS", ASURANSI: "Asuransi", UMUM: "Umum" },
      kiosk: {
        title: "Ambil Nomor Antrian",
        subtitle: "Silakan pilih jenis layanan",
        pick: "Pilih layanan",
        yourNumber: "Nomor antrian Anda",
        goWait: "Silakan menunggu nomor Anda dipanggil",
        print: "Cetak",
        takeAnother: "Ambil nomor lain",
        ticket: "Tiket Antrian",
      },
      display: {
        title: "Antrian",
        nowServing: "Sedang dipanggil",
        counter: "Counter",
        waiting: "Menunggu",
        idle: "Menunggu panggilan…",
        announceTemplate: "Nomor antrian {code}, harap menuju counter {counter}",
      },
      panel: {
        title: "Antrian",
        subtitle: "Panggil & kelola antrian per counter.",
        selectCounter: "Pilih counter",
        callNext: "Panggil berikutnya",
        recall: "Panggil ulang",
        serve: "Selesai",
        skip: "Lewati",
        waiting: "Menunggu",
        called: "Dipanggil",
        noWaiting: "Tidak ada antrian menunggu.",
        openDisplay: "Buka layar display",
        openKiosk: "Buka kiosk cetak",
        number: "Nomor",
      },
    },
    pharmacy: {
      title: "Farmasi",
      subtitle: "Master obat & stok fasilitas aktif.",
      addTitle: "Tambah obat",
      name: "Nama obat",
      generic: "Nama generik",
      unit: "Satuan",
      category: "Kategori",
      quantity: "Stok",
      price: "Harga",
      add: "Tambah",
      save: "Simpan",
      search: "Cari obat…",
      empty: "Belum ada obat. Tambahkan di atas.",
      lowStock: "Stok menipis",
      optional: "opsional",
      colStock: "Stok",
      colAction: "Aksi",
    },
    partners: {
      title: "Rekanan",
      subtitle: "Kelola kemitraan antar fasilitas untuk transfer obat.",
      inviteTitle: "Ajukan rekanan",
      selectTenant: "Pilih fasilitas",
      send: "Ajukan",
      incoming: "Permintaan masuk",
      active: "Rekanan aktif",
      outgoing: "Menunggu persetujuan",
      approve: "Terima",
      reject: "Tolak",
      end: "Putus",
      pending: "Menunggu",
      noIncoming: "Tidak ada permintaan masuk.",
      noActive: "Belum ada rekanan aktif.",
      noCandidates: "Tidak ada fasilitas lain untuk diajak.",
      endConfirm: "Putus kemitraan dengan fasilitas ini?",
    },
    transfer: {
      title: "Transfer Obat",
      subtitle: "Order obat ke fasilitas rekanan & lacak statusnya.",
      outgoing: "Order keluar",
      incoming: "Order masuk",
      newOrder: "Buat order",
      partner: "Rekanan",
      drug: "Obat",
      quantity: "Jumlah",
      stock: "Stok",
      note: "Catatan",
      create: "Buat order",
      selectPartner: "Pilih rekanan",
      selectDrug: "Pilih obat",
      orderNo: "No. Order",
      items: "Item",
      empty: "Belum ada order.",
      noPartners: "Belum ada rekanan aktif. Tambahkan di menu Rekanan.",
      back: "Kembali",
      timeline: "Riwayat status",
      advance: "Proses berikutnya",
      receive: "Terima obat",
      reject: "Tolak",
      cancel: "Batalkan",
      statuses: {
        REQUESTED: "Diajukan",
        CONFIRMED: "Dikonfirmasi",
        PREPARING: "Disiapkan",
        SHIPPED: "Dikirim",
        IN_TRANSIT: "Dalam perjalanan",
        DELIVERED: "Tiba",
        RECEIVED: "Diterima",
        REJECTED: "Ditolak",
        CANCELLED: "Dibatalkan",
      },
    },
    access: {
      title: "Akses Pasien",
      subtitle: "Cari pasien lintas fasilitas & minta akses ke fasilitas pemilik.",
      searchPlaceholder: "Cari NIK / nama pasien…",
      search: "Cari",
      owner: "Pemilik",
      requestAccess: "Minta akses",
      requested: "Sudah diminta",
      incoming: "Permintaan masuk",
      outgoing: "Permintaan saya",
      approve: "Setujui",
      reject: "Tolak",
      revoke: "Cabut",
      reasonPlaceholder: "Alasan (opsional)",
      view: "Lihat",
      noResults: "Tidak ada hasil. Coba NIK atau nama lengkap.",
      noIncoming: "Tidak ada permintaan masuk.",
      noOutgoing: "Belum ada permintaan.",
      expiresOn: "Berlaku s/d",
      statusPending: "Menunggu",
      statusApproved: "Disetujui",
      statusRejected: "Ditolak",
      statusRevoked: "Dicabut",
      viewTitle: "Info Pasien (akses terbatas)",
      allergies: "Riwayat Alergi",
      visits: "Riwayat Kunjungan",
      noAllergies: "Tidak ada alergi tercatat.",
      noVisits: "Belum ada kunjungan.",
      back: "Kembali",
      noAccess: "Akses tidak tersedia atau sudah kedaluwarsa.",
    },
    reports: {
      title: "Laporan",
      subtitle: "Laporan kunjungan & transfer obat per periode.",
      typeVisits: "Kunjungan",
      typeTransfer: "Transfer obat",
      exportCsv: "Export CSV",
      print: "Cetak / PDF",
      total: "Total",
      empty: "Tidak ada data pada periode ini.",
      colDate: "Tanggal",
      colPatient: "Pasien",
      colDoctor: "Dokter",
      colStatus: "Status",
      colDiagnoses: "Diagnosa",
      colOrderNo: "No. Order",
      colDirection: "Arah",
      colPartner: "Rekanan",
      colQty: "Jumlah",
      dirOut: "Keluar",
      dirIn: "Masuk",
    },
    settings: {
      title: "Pengaturan",
      subtitle: "Kelola anggota fasilitas & peran akses.",
      membersTitle: "Anggota Fasilitas",
      colName: "Nama",
      colEmail: "Email",
      colRole: "Peran",
      colStatus: "Status",
      colAction: "Aksi",
      active: "Aktif",
      inactive: "Nonaktif",
      you: "Anda",
      removeBtn: "Keluarkan",
      removeConfirm: "Keluarkan anggota ini dari fasilitas?",
      inviteTitle: "Undang Anggota",
      inviteHint:
        "Jika email sudah terdaftar, anggota langsung ditautkan. Jika belum, akun baru dibuat dengan kata sandi awal di bawah.",
      fName: "Nama lengkap",
      fEmail: "Email",
      fRole: "Peran",
      fPassword: "Kata sandi awal",
      inviteBtn: "Undang",
      invited: "Anggota berhasil ditambahkan.",
      readOnly: "Hanya Pemilik/Admin yang dapat mengelola anggota.",
      roles: {
        OWNER: "Pemilik",
        ADMIN: "Admin",
        DOKTER: "Dokter",
        PERAWAT: "Perawat",
        RESEPSIONIS: "Resepsionis",
        APOTEKER: "Apoteker",
      },
      errors: {
        required: "Email, peran, dan kata sandi wajib diisi.",
        exists: "Pengguna ini sudah menjadi anggota fasilitas.",
        lastOwner: "Tidak bisa — minimal harus ada satu Pemilik.",
        self: "Anda tidak dapat mengubah keanggotaan sendiri.",
        notAllowed: "Anda tidak memiliki izin untuk tindakan ini.",
      },
    },
    billing: {
      title: "Tagihan",
      subtitle: "Kelola invoice & pembayaran kunjungan.",
      newInvoice: "Buat Tagihan",
      create: "Buat",
      selectPatient: "Pilih pasien…",
      colNo: "No. Invoice",
      colPatient: "Pasien",
      colDate: "Tanggal",
      colTotal: "Total",
      colStatus: "Status",
      empty: "Belum ada tagihan.",
      back: "Kembali ke Tagihan",
      itemsTitle: "Rincian Biaya",
      addItem: "Tambah item",
      category: "Kategori",
      description: "Deskripsi",
      qty: "Qty",
      unitPrice: "Harga satuan",
      amount: "Jumlah",
      remove: "Hapus",
      subtotal: "Subtotal",
      discount: "Diskon",
      grandTotal: "Total Tagihan",
      saveDiscount: "Simpan",
      issue: "Terbitkan",
      markPaid: "Tandai Lunas",
      cancel: "Batalkan",
      cancelConfirm: "Batalkan tagihan ini?",
      print: "Cetak",
      noItems: "Belum ada item biaya.",
      paidAt: "Dibayar pada",
      invoiceLabel: "INVOICE",
      billTo: "Ditagihkan kepada",
      statuses: {
        DRAFT: "Draf",
        UNPAID: "Belum Bayar",
        PAID: "Lunas",
        CANCELLED: "Dibatalkan",
      },
      categories: {
        CONSULTATION: "Konsultasi",
        DRUG: "Obat",
        PROCEDURE: "Tindakan",
        LAB: "Laboratorium",
        OTHER: "Lainnya",
      },
    },
    appointments: {
      title: "Jadwal & Janji Temu",
      subtitle: "Atur jadwal dokter & janji temu pasien.",
      newAppt: "Buat Janji",
      book: "Jadwalkan",
      selectPatient: "Pilih pasien…",
      selectDoctor: "Pilih dokter…",
      dateTime: "Tanggal & jam",
      duration: "Durasi",
      minutes: "menit",
      reason: "Keperluan",
      colTime: "Waktu",
      colPatient: "Pasien",
      colDoctor: "Dokter",
      colReason: "Keperluan",
      colStatus: "Status",
      colAction: "Aksi",
      empty: "Belum ada janji temu.",
      confirm: "Konfirmasi",
      cancel: "Batalkan",
      noShow: "Tidak Hadir",
      startVisit: "Mulai Kunjungan",
      cancelConfirm: "Batalkan janji temu ini?",
      filterToday: "Hari ini",
      filterUpcoming: "Mendatang",
      filterAll: "Semua",
      statuses: {
        SCHEDULED: "Terjadwal",
        CONFIRMED: "Dikonfirmasi",
        COMPLETED: "Selesai",
        CANCELLED: "Dibatalkan",
        NO_SHOW: "Tidak Hadir",
      },
    },
    sharedApi: {
      title: "Shared API",
      subtitle: "API publik per fasilitas untuk integrasi pihak ketiga.",
      keysTitle: "API Key",
      newKeyTitle: "Buat API Key",
      fName: "Nama",
      fMode: "Mode",
      fScopes: "Scope (izin)",
      createBtn: "Buat Key",
      modeLive: "Live",
      modeTest: "Test",
      tokenOnceTitle: "Salin token sekarang — hanya ditampilkan sekali!",
      tokenOnceHint:
        "Simpan token ini di tempat aman. Demi keamanan, token tidak dapat dilihat lagi setelah halaman ini ditutup.",
      colName: "Nama",
      colPrefix: "Prefix",
      colScopes: "Scope",
      colStatus: "Status",
      colLastUsed: "Terakhir dipakai",
      colAction: "Aksi",
      active: "Aktif",
      revoked: "Dicabut",
      never: "Belum pernah",
      revoke: "Cabut",
      revokeConfirm: "Cabut API key ini? Aplikasi yang memakainya akan berhenti bekerja.",
      noKeys: "Belum ada API key.",
      readOnly: "Hanya Pemilik/Admin yang dapat mengelola API key.",
      usageTitle: "Pemakaian Terakhir",
      totalRequests: "Total request",
      colMethod: "Metode",
      colPath: "Path",
      colCode: "Kode",
      colTime: "Waktu",
      noRequests: "Belum ada request.",
      endpointsTitle: "Endpoint Publik",
      endpointsHint:
        "Autentikasi: header `Authorization: Bearer <token>` atau `X-API-Key`. Rate limit 60 req/menit per key.",
      errRequired: "Nama dan minimal satu scope wajib diisi.",
    },
    diagnostics: {
      title: "Lab & Radiologi",
      subtitle: "Order pemeriksaan penunjang & input hasil.",
      newOrder: "Buat Order",
      selectPatient: "Pilih pasien…",
      category: "Kategori",
      clinicalNote: "Catatan klinis",
      catLab: "Laboratorium",
      catRad: "Radiologi",
      colNo: "No. Order",
      colPatient: "Pasien",
      colCategory: "Kategori",
      colDate: "Tanggal",
      colStatus: "Status",
      empty: "Belum ada order penunjang.",
      back: "Kembali ke Lab & Radiologi",
      itemsTitle: "Pemeriksaan & Hasil",
      addTest: "Tambah pemeriksaan",
      testName: "Nama pemeriksaan",
      unit: "Satuan",
      refRange: "Nilai rujukan",
      result: "Hasil",
      flag: "Tanda",
      selectFlag: "—",
      save: "Simpan",
      remove: "Hapus",
      noItems: "Belum ada pemeriksaan.",
      start: "Proses",
      complete: "Selesaikan",
      cancel: "Batalkan",
      cancelConfirm: "Batalkan order ini?",
      print: "Cetak",
      completedAt: "Selesai pada",
      statuses: {
        REQUESTED: "Diminta",
        IN_PROGRESS: "Diproses",
        COMPLETED: "Selesai",
        CANCELLED: "Dibatalkan",
      },
      flags: {
        NORMAL: "Normal",
        LOW: "Rendah",
        HIGH: "Tinggi",
        ABNORMAL: "Abnormal",
      },
    },
    soon: {
      badge: "Soon",
      plannedTitle: "Yang akan hadir",
      note: "Fitur ini sedang dikembangkan dan akan segera tersedia.",
      features: {
        notifikasi: {
          title: "Notifikasi",
          desc: "Kirim pengingat & pemberitahuan otomatis ke pasien dan staf via WhatsApp dan email.",
          items: [
            "Pengingat janji temu via WhatsApp & email",
            "Notifikasi hasil lab/radiologi siap",
            "Pemberitahuan status order obat antar rekanan",
            "Template pesan & riwayat pengiriman",
          ],
        },
        telemedicine: {
          title: "Telemedicine",
          desc: "Konsultasi online antara dokter dan pasien melalui video call dalam aplikasi.",
          items: [
            "Video call dokter–pasien terjadwal",
            "Chat & berbagi dokumen saat konsultasi",
            "Terhubung ke rekam medis & resep elektronik",
            "Riwayat sesi telekonsultasi",
          ],
        },
        integrasi: {
          title: "Integrasi SATUSEHAT & BPJS",
          desc: "Hubungkan SmaraMedika dengan ekosistem kesehatan nasional.",
          items: [
            "Kirim data kunjungan & diagnosa ke SATUSEHAT",
            "Verifikasi kepesertaan & rujukan BPJS",
            "Pemetaan kode (ICD-10, SNOMED, dll)",
            "Sinkronisasi otomatis & log integrasi",
          ],
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
      resetSuccess: "Password changed successfully. Please sign in.",
      forgotTitle: "Forgot password",
      forgotSubtitle: "Enter your email to generate a reset link.",
      sendLink: "Generate reset link",
      sentNotice: "If the email is registered, a reset link has been generated.",
      devLinkNotice:
        "Dev mode (no email): use the link below to reset your password.",
      openResetLink: "Open reset link",
      resetTitle: "Reset password",
      resetSubtitle: "Enter your new password.",
      newPassword: "New password",
      confirmPassword: "Repeat password",
      resetSubmit: "Save password",
      errWeak: "Password must be at least 8 characters.",
      errMismatch: "Password confirmation does not match.",
      errExpired: "Reset link is invalid or expired.",
    },
    app: {
      nav: {
        dashboard: "Dashboard",
        patients: "Patients",
        records: "Medical Records",
        queue: "Queue",
        appointments: "Appointments",
        pharmacy: "Pharmacy",
        drugTransfer: "Drug Transfer",
        partners: "Partners",
        patientAccess: "Patient Access",
        billing: "Billing",
        diagnostics: "Lab & Radiology",
        reports: "Reports",
        sharedApi: "Shared API",
        notifications: "Notifications",
        telemedicine: "Telemedicine",
        integrations: "Integrations",
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
      period: {
        label: "Period",
        today: "Today",
        week: "7 days",
        month: "30 days",
        all: "All",
      },
      topDiagnoses: "Top diagnoses",
      visitsInPeriod: "Visits this period",
      noDiagnoses: "No diagnoses in this period.",
      cases: "cases",
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
        medsTitle: "Medication History",
        noVisits: "No visits yet.",
        noAllergies: "No allergies recorded.",
        noMeds: "No medication history yet.",
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
        rxTitle: "Prescription",
        rxSelectDrug: "Select drug",
        rxDosage: "Dosage",
        rxFrequency: "Frequency",
        rxQty: "Qty",
        rxInstruction: "Instruction",
        rxEmpty: "No prescription yet.",
        rxPrint: "Print prescription",
        rxNoStock: "No drugs in facility stock. Add via Pharmacy menu.",
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
    queue: {
      services: { BPJS: "BPJS", ASURANSI: "Insurance", UMUM: "General" },
      kiosk: {
        title: "Take a Queue Number",
        subtitle: "Please select a service",
        pick: "Select service",
        yourNumber: "Your queue number",
        goWait: "Please wait for your number to be called",
        print: "Print",
        takeAnother: "Take another number",
        ticket: "Queue Ticket",
      },
      display: {
        title: "Queue",
        nowServing: "Now serving",
        counter: "Counter",
        waiting: "Waiting",
        idle: "Waiting for calls…",
        announceTemplate: "Queue number {code}, please proceed to counter {counter}",
      },
      panel: {
        title: "Queue",
        subtitle: "Call & manage the queue per counter.",
        selectCounter: "Select counter",
        callNext: "Call next",
        recall: "Recall",
        serve: "Done",
        skip: "Skip",
        waiting: "Waiting",
        called: "Called",
        noWaiting: "No waiting queue.",
        openDisplay: "Open display screen",
        openKiosk: "Open print kiosk",
        number: "Number",
      },
    },
    pharmacy: {
      title: "Pharmacy",
      subtitle: "Drug master & stock for the active facility.",
      addTitle: "Add drug",
      name: "Drug name",
      generic: "Generic name",
      unit: "Unit",
      category: "Category",
      quantity: "Stock",
      price: "Price",
      add: "Add",
      save: "Save",
      search: "Search drug…",
      empty: "No drugs yet. Add one above.",
      lowStock: "Low stock",
      optional: "optional",
      colStock: "Stock",
      colAction: "Action",
    },
    partners: {
      title: "Partners",
      subtitle: "Manage facility partnerships for drug transfers.",
      inviteTitle: "Invite partner",
      selectTenant: "Select facility",
      send: "Invite",
      incoming: "Incoming requests",
      active: "Active partners",
      outgoing: "Awaiting approval",
      approve: "Accept",
      reject: "Reject",
      end: "End",
      pending: "Pending",
      noIncoming: "No incoming requests.",
      noActive: "No active partners yet.",
      noCandidates: "No other facilities to invite.",
      endConfirm: "End partnership with this facility?",
    },
    transfer: {
      title: "Drug Transfer",
      subtitle: "Order drugs from partner facilities & track status.",
      outgoing: "Outgoing orders",
      incoming: "Incoming orders",
      newOrder: "New order",
      partner: "Partner",
      drug: "Drug",
      quantity: "Quantity",
      stock: "Stock",
      note: "Note",
      create: "Create order",
      selectPartner: "Select partner",
      selectDrug: "Select drug",
      orderNo: "Order No.",
      items: "Items",
      empty: "No orders yet.",
      noPartners: "No active partners. Add one in the Partners menu.",
      back: "Back",
      timeline: "Status history",
      advance: "Next step",
      receive: "Receive",
      reject: "Reject",
      cancel: "Cancel",
      statuses: {
        REQUESTED: "Requested",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        SHIPPED: "Shipped",
        IN_TRANSIT: "In transit",
        DELIVERED: "Delivered",
        RECEIVED: "Received",
        REJECTED: "Rejected",
        CANCELLED: "Cancelled",
      },
    },
    access: {
      title: "Patient Access",
      subtitle: "Search patients across facilities & request access from the owner.",
      searchPlaceholder: "Search NIK / patient name…",
      search: "Search",
      owner: "Owner",
      requestAccess: "Request access",
      requested: "Requested",
      incoming: "Incoming requests",
      outgoing: "My requests",
      approve: "Approve",
      reject: "Reject",
      revoke: "Revoke",
      reasonPlaceholder: "Reason (optional)",
      view: "View",
      noResults: "No results. Try the full NIK or name.",
      noIncoming: "No incoming requests.",
      noOutgoing: "No requests yet.",
      expiresOn: "Valid until",
      statusPending: "Pending",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      statusRevoked: "Revoked",
      viewTitle: "Patient Info (limited access)",
      allergies: "Allergy History",
      visits: "Visit History",
      noAllergies: "No allergies recorded.",
      noVisits: "No visits yet.",
      back: "Back",
      noAccess: "Access unavailable or expired.",
    },
    reports: {
      title: "Reports",
      subtitle: "Visit & drug transfer reports by period.",
      typeVisits: "Visits",
      typeTransfer: "Drug transfer",
      exportCsv: "Export CSV",
      print: "Print / PDF",
      total: "Total",
      empty: "No data in this period.",
      colDate: "Date",
      colPatient: "Patient",
      colDoctor: "Doctor",
      colStatus: "Status",
      colDiagnoses: "Diagnoses",
      colOrderNo: "Order No.",
      colDirection: "Direction",
      colPartner: "Partner",
      colQty: "Qty",
      dirOut: "Outgoing",
      dirIn: "Incoming",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage facility members & access roles.",
      membersTitle: "Facility Members",
      colName: "Name",
      colEmail: "Email",
      colRole: "Role",
      colStatus: "Status",
      colAction: "Action",
      active: "Active",
      inactive: "Inactive",
      you: "You",
      removeBtn: "Remove",
      removeConfirm: "Remove this member from the facility?",
      inviteTitle: "Invite Member",
      inviteHint:
        "If the email already exists, the member is linked immediately. Otherwise a new account is created with the initial password below.",
      fName: "Full name",
      fEmail: "Email",
      fRole: "Role",
      fPassword: "Initial password",
      inviteBtn: "Invite",
      invited: "Member added successfully.",
      readOnly: "Only Owner/Admin can manage members.",
      roles: {
        OWNER: "Owner",
        ADMIN: "Admin",
        DOKTER: "Doctor",
        PERAWAT: "Nurse",
        RESEPSIONIS: "Receptionist",
        APOTEKER: "Pharmacist",
      },
      errors: {
        required: "Email, role, and password are required.",
        exists: "This user is already a member of the facility.",
        lastOwner: "Cannot proceed — at least one Owner is required.",
        self: "You cannot change your own membership.",
        notAllowed: "You don't have permission for this action.",
      },
    },
    billing: {
      title: "Billing",
      subtitle: "Manage invoices & visit payments.",
      newInvoice: "New Invoice",
      create: "Create",
      selectPatient: "Select patient…",
      colNo: "Invoice No.",
      colPatient: "Patient",
      colDate: "Date",
      colTotal: "Total",
      colStatus: "Status",
      empty: "No invoices yet.",
      back: "Back to Billing",
      itemsTitle: "Charge Details",
      addItem: "Add item",
      category: "Category",
      description: "Description",
      qty: "Qty",
      unitPrice: "Unit price",
      amount: "Amount",
      remove: "Remove",
      subtotal: "Subtotal",
      discount: "Discount",
      grandTotal: "Grand Total",
      saveDiscount: "Save",
      issue: "Issue",
      markPaid: "Mark Paid",
      cancel: "Cancel",
      cancelConfirm: "Cancel this invoice?",
      print: "Print",
      noItems: "No charge items yet.",
      paidAt: "Paid at",
      invoiceLabel: "INVOICE",
      billTo: "Bill to",
      statuses: {
        DRAFT: "Draft",
        UNPAID: "Unpaid",
        PAID: "Paid",
        CANCELLED: "Cancelled",
      },
      categories: {
        CONSULTATION: "Consultation",
        DRUG: "Drug",
        PROCEDURE: "Procedure",
        LAB: "Laboratory",
        OTHER: "Other",
      },
    },
    appointments: {
      title: "Schedule & Appointments",
      subtitle: "Manage doctor schedules & patient appointments.",
      newAppt: "New Appointment",
      book: "Book",
      selectPatient: "Select patient…",
      selectDoctor: "Select doctor…",
      dateTime: "Date & time",
      duration: "Duration",
      minutes: "min",
      reason: "Reason",
      colTime: "Time",
      colPatient: "Patient",
      colDoctor: "Doctor",
      colReason: "Reason",
      colStatus: "Status",
      colAction: "Action",
      empty: "No appointments yet.",
      confirm: "Confirm",
      cancel: "Cancel",
      noShow: "No-show",
      startVisit: "Start Visit",
      cancelConfirm: "Cancel this appointment?",
      filterToday: "Today",
      filterUpcoming: "Upcoming",
      filterAll: "All",
      statuses: {
        SCHEDULED: "Scheduled",
        CONFIRMED: "Confirmed",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
        NO_SHOW: "No-show",
      },
    },
    sharedApi: {
      title: "Shared API",
      subtitle: "Per-facility public API for third-party integration.",
      keysTitle: "API Keys",
      newKeyTitle: "Create API Key",
      fName: "Name",
      fMode: "Mode",
      fScopes: "Scopes (permissions)",
      createBtn: "Create key",
      modeLive: "Live",
      modeTest: "Test",
      tokenOnceTitle: "Copy your token now — shown only once!",
      tokenOnceHint:
        "Store this token securely. For security it cannot be viewed again after you leave this page.",
      colName: "Name",
      colPrefix: "Prefix",
      colScopes: "Scopes",
      colStatus: "Status",
      colLastUsed: "Last used",
      colAction: "Action",
      active: "Active",
      revoked: "Revoked",
      never: "Never",
      revoke: "Revoke",
      revokeConfirm: "Revoke this API key? Apps using it will stop working.",
      noKeys: "No API keys yet.",
      readOnly: "Only Owner/Admin can manage API keys.",
      usageTitle: "Recent Usage",
      totalRequests: "Total requests",
      colMethod: "Method",
      colPath: "Path",
      colCode: "Code",
      colTime: "Time",
      noRequests: "No requests yet.",
      endpointsTitle: "Public Endpoints",
      endpointsHint:
        "Auth: `Authorization: Bearer <token>` or `X-API-Key` header. Rate limit 60 req/min per key.",
      errRequired: "Name and at least one scope are required.",
    },
    diagnostics: {
      title: "Lab & Radiology",
      subtitle: "Order diagnostic tests & enter results.",
      newOrder: "New Order",
      selectPatient: "Select patient…",
      category: "Category",
      clinicalNote: "Clinical note",
      catLab: "Laboratory",
      catRad: "Radiology",
      colNo: "Order No.",
      colPatient: "Patient",
      colCategory: "Category",
      colDate: "Date",
      colStatus: "Status",
      empty: "No diagnostic orders yet.",
      back: "Back to Lab & Radiology",
      itemsTitle: "Tests & Results",
      addTest: "Add test",
      testName: "Test name",
      unit: "Unit",
      refRange: "Reference range",
      result: "Result",
      flag: "Flag",
      selectFlag: "—",
      save: "Save",
      remove: "Remove",
      noItems: "No tests yet.",
      start: "Process",
      complete: "Complete",
      cancel: "Cancel",
      cancelConfirm: "Cancel this order?",
      print: "Print",
      completedAt: "Completed at",
      statuses: {
        REQUESTED: "Requested",
        IN_PROGRESS: "In progress",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
      },
      flags: {
        NORMAL: "Normal",
        LOW: "Low",
        HIGH: "High",
        ABNORMAL: "Abnormal",
      },
    },
    soon: {
      badge: "Soon",
      plannedTitle: "What's coming",
      note: "This feature is under development and will be available soon.",
      features: {
        notifikasi: {
          title: "Notifications",
          desc: "Send automatic reminders & alerts to patients and staff via WhatsApp and email.",
          items: [
            "Appointment reminders via WhatsApp & email",
            "Lab/radiology result-ready notifications",
            "Inter-partner drug order status alerts",
            "Message templates & delivery history",
          ],
        },
        telemedicine: {
          title: "Telemedicine",
          desc: "Online consultation between doctors and patients via in-app video calls.",
          items: [
            "Scheduled doctor–patient video calls",
            "Chat & document sharing during consults",
            "Linked to medical records & e-prescriptions",
            "Teleconsultation session history",
          ],
        },
        integrasi: {
          title: "SATUSEHAT & BPJS Integration",
          desc: "Connect SmaraMedika to the national healthcare ecosystem.",
          items: [
            "Push visit & diagnosis data to SATUSEHAT",
            "BPJS membership & referral verification",
            "Code mapping (ICD-10, SNOMED, etc.)",
            "Automatic sync & integration logs",
          ],
        },
      },
    },
  },
};
