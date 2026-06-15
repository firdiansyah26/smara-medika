"use client";

import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={
            "rounded-md px-2.5 py-1 uppercase transition-colors " +
            (locale === l ? "bg-brand text-white" : "text-muted hover:text-ink")
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
