"use client";

import { useLocale } from "@/lib/use-locale";
import type { Dictionary } from "@/lib/i18n";

type NavKey = keyof Dictionary["app"]["nav"];

export function PagePlaceholder({ navKey }: { navKey: NavKey }) {
  const { t } = useLocale();
  const title = t.app.nav[navKey];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>

      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-brand">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </span>
        <p className="mt-5 text-lg font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {t.common.comingSoon}
        </p>
      </div>
    </div>
  );
}
