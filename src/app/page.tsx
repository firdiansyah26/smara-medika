import { Logo } from "@/components/logo";

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Multi-Tenant",
    desc: "Banyak RS, Klinik, & Apotek dalam satu platform. Satu akun bisa tergabung di banyak fasilitas dengan peran berbeda.",
    icon: (
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M15 11h.01" />
    ),
  },
  {
    title: "Rekam Medis SOAP",
    desc: "Catatan kunjungan terstruktur (SOAP), diagnosa ICD-10, tanda vital, dan riwayat alergi dalam satu tempat.",
    icon: (
      <path d="M9 2h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2V3a1 1 0 0 1 1-1zM9 12l2 2 4-4" />
    ),
  },
  {
    title: "Transfer Obat Antar Rekanan",
    desc: "Pesan obat dari fasilitas rekanan saat stok kosong, lengkap dengan pelacakan status hingga obat diterima.",
    icon: (
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    ),
  },
  {
    title: "Berbagi Pasien Terkontrol",
    desc: "Cari pasien lintas fasilitas dengan info terbatas; detail hanya terbuka setelah disetujui fasilitas pemilik.",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
    ),
  },
  {
    title: "Shared API",
    desc: "API publik per tenant untuk integrasi pihak ketiga — API key, scope, rate limit, dan webhook.",
    icon: (
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    ),
  },
  {
    title: "Aman & Patuh Regulasi",
    desc: "Audit log, kontrol akses berbasis peran, dan isolasi data per tenant — selaras UU PDP & Permenkes RME.",
    icon: (
      <path d="M12 3l8 4v5c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V7l8-4zM9.5 12l1.8 1.8 3.5-3.6" />
    ),
  },
];

const tenantTypes = [
  { label: "Rumah Sakit", emoji: "🏥" },
  { label: "Klinik", emoji: "🩺" },
  { label: "Apotek", emoji: "💊" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white text-ink">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <a
              href="#fitur"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink sm:block"
            >
              Fitur
            </a>
            <a
              href="#masuk"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
            >
              Masuk
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-mint to-white" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-semibold text-brand-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Platform RME Multi-Tenant
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Catatan medis yang{" "}
              <span className="bg-gradient-to-r from-brand to-brand-cyan bg-clip-text text-transparent">
                terhubung & terpercaya
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              SmaraMedika menyatukan Rumah Sakit, Klinik, dan Apotek dalam satu
              platform — rekam medis digital, transfer obat antar rekanan dengan
              tracking, dan berbagi pasien yang terkontrol.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#masuk"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
              >
                Mulai Sekarang
              </a>
              <a
                href="#fitur"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand-deep"
              >
                Pelajari Fitur
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {tenantTypes.map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-medium text-brand-deep"
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="mx-auto max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-brand/5">
              <div className="flex items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-cyan shadow-lg shadow-brand/30">
                  <Logo
                    variant="mark"
                    className="h-16 w-16 [&_path:first-of-type]:fill-white [&_path:last-of-type]:stroke-brand"
                  />
                </div>
              </div>
              <p className="mt-6 text-center text-lg font-bold tracking-tight">
                <span className="text-ink">Smara</span>
                <span className="text-brand">Medika</span>
              </p>
              <p className="mt-1 text-center text-sm text-muted">
                Smara (ingatan/catatan) + Medika (medis)
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  "Rekam medis SOAP + ICD-10",
                  "Transfer obat + tracking",
                  "Akses pasien terkontrol",
                ].map((line) => (
                  <div
                    key={line}
                    className="flex items-center gap-3 rounded-xl bg-mint/60 px-4 py-2.5 text-sm font-medium text-brand-deep"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Semua kebutuhan fasilitas kesehatan
          </h2>
          <p className="mt-4 text-lg text-muted">
            Dari pencatatan harian hingga jaringan antar-fasilitas, dalam satu
            platform yang aman.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="masuk" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-cyan px-8 py-14 text-center shadow-xl shadow-brand/20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Siap mendigitalkan layanan kesehatan Anda?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            SmaraMedika masih dalam pengembangan. Halaman masuk & pendaftaran
            akan tersedia pada rilis berikutnya.
          </p>
          <div className="mt-8">
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/95 px-6 py-3 text-sm font-semibold text-brand-deep">
              Masuk · segera hadir
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} SmaraMedika — Platform Rekam Medis
            Elektronik
          </p>
        </div>
      </footer>
    </div>
  );
}
