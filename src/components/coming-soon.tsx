"use client";

import { useLocale } from "@/lib/use-locale";

type FeatureKey = "notifikasi" | "telemedicine" | "integrasi";

const ICONS: Record<FeatureKey, React.ReactNode> = {
  notifikasi: (
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
  ),
  telemedicine: (
    <path d="M23 7l-7 5 7 5V7zM1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1z" />
  ),
  integrasi: (
    <path d="M9 12h6M12 9v6M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  ),
};

export function ComingSoon({ feature }: { feature: FeatureKey }) {
  const { t } = useLocale();
  const f = t.soon.features[feature];

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{f.title}</h1>
        <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          {t.soon.badge}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center justify-center border-b border-slate-100 bg-gradient-to-b from-mint/50 to-white px-6 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[feature]}
            </svg>
          </span>
          <p className="mt-4 text-lg font-bold text-ink">{f.title}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {t.soon.note}
          </p>
        </div>

        <div className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.soon.plannedTitle}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {f.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
