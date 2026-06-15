"use client";

import { useSyncExternalStore } from "react";
import { Logo } from "@/components/logo";
import {
  DEFAULT_LOCALE,
  dictionaries,
  LOCALE_STORAGE_KEY,
  LOCALES,
  type Locale,
} from "@/lib/i18n";

// --- Store bahasa berbasis localStorage (pola useSyncExternalStore) ---
let cachedLocale: Locale | null = null;
const localeListeners = new Set<() => void>();

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const v = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  return v && LOCALES.includes(v) ? v : DEFAULT_LOCALE;
}

function getLocaleSnapshot(): Locale {
  if (cachedLocale === null) cachedLocale = readStoredLocale();
  return cachedLocale;
}

function getLocaleServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribeLocale(callback: () => void) {
  localeListeners.add(callback);
  return () => localeListeners.delete(callback);
}

function setStoredLocale(l: Locale) {
  cachedLocale = l;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    document.documentElement.lang = l;
  }
  localeListeners.forEach((cb) => cb());
}

const tenantEmojis = ["🏥", "🩺", "💊"];

// Ikon fitur (urutan selaras dengan dictionary.features.items)
const featureIcons: React.ReactNode[] = [
  <path key="i" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M15 11h.01" />,
  <path
    key="i"
    d="M9 2h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2V3a1 1 0 0 1 1-1zM9 12l2 2 4-4"
  />,
  <path
    key="i"
    d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
  />,
  <path
    key="i"
    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6"
  />,
  <path
    key="i"
    d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"
  />,
  <path
    key="i"
    d="M12 3l8 4v5c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V7l8-4zM9.5 12l1.8 1.8 3.5-3.6"
  />,
];

function LanguageSwitcher({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={locale === l}
          className={
            "rounded-md px-2.5 py-1 uppercase transition-colors " +
            (locale === l
              ? "bg-brand text-white"
              : "text-muted hover:text-ink")
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function Landing() {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );

  const t = dictionaries[locale];

  return (
    <div className="flex min-h-full flex-col bg-white text-ink">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="#fitur"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink sm:block"
            >
              {t.nav.features}
            </a>
            <LanguageSwitcher locale={locale} onChange={setStoredLocale} />
            <a
              href="#masuk"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
            >
              {t.nav.signIn}
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
              {t.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t.hero.headingLead}{" "}
              <span className="bg-gradient-to-r from-brand to-brand-cyan bg-clip-text text-transparent">
                {t.hero.headingHighlight}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              {t.hero.paragraph}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#masuk"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
              >
                {t.hero.ctaPrimary}
              </a>
              <a
                href="#fitur"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand-deep"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {t.tenantTypes.map((label, i) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-medium text-brand-deep"
                >
                  <span>{tenantEmojis[i]}</span>
                  {label}
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
                {t.brandCard.meaning}
              </p>
              <div className="mt-6 space-y-2.5">
                {t.brandCard.points.map((line) => (
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
            {t.features.heading}
          </h2>
          <p className="mt-4 text-lg text-muted">{t.features.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => (
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
                  {featureIcons[i]}
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
            {t.cta.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            {t.cta.paragraph}
          </p>
          <div className="mt-8">
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/95 px-6 py-3 text-sm font-semibold text-brand-deep">
              {t.cta.button}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} SmaraMedika — {t.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
