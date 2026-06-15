"use client";

import { useLocale } from "@/lib/use-locale";
import { mockPatients, mockStats, mockUser } from "@/lib/mock-data";

const statIcons: Record<string, React.ReactNode> = {
  patientsToday: (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  ),
  activeVisits: (
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  ),
  pendingOrders: (
    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  ),
  partners: (
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  ),
};

export default function DashboardPage() {
  const { t, locale } = useLocale();

  const stats = [
    { key: "patientsToday", value: mockStats.patientsToday },
    { key: "activeVisits", value: mockStats.activeVisits },
    { key: "pendingOrders", value: mockStats.pendingOrders },
    { key: "partners", value: mockStats.partners },
  ] as const;

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
  });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.dashboardHome.greeting}, {mockUser.name} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">{t.dashboardHome.subtitle}</p>
      </div>

      {/* Demo notice */}
      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
        <span>{t.common.demoNotice}</span>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {statIcons[s.key]}
                </svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-ink">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t.dashboardHome.stats[s.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Recent visits */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">
            {t.dashboardHome.recentTitle}
          </h2>
          <span className="text-sm font-medium text-brand">
            {t.common.viewAll}
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {mockPatients.slice(0, 4).map((p) => (
            <li
              key={p.mrNumber}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {p.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                <p className="text-xs text-muted">{p.mrNumber}</p>
              </div>
              <span className="text-xs text-muted">
                {dateFmt.format(new Date(p.lastVisit))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
