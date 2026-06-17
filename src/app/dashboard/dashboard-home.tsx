"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";

export type Period = "today" | "week" | "month" | "all";

type Stats = {
  patientsToday: number;
  activeVisits: number;
  pendingOrders: number;
  partners: number;
};
type RecentVisit = { name: string; mrNumber: string; visitDate: string };
type TopDiagnosis = { code: string; name: string; count: number };

const statIcons: Record<keyof Stats, React.ReactNode> = {
  patientsToday: (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  ),
  activeVisits: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  pendingOrders: (
    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  ),
  partners: (
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  ),
};

const PERIOD_KEYS: Period[] = ["today", "week", "month", "all"];

export function DashboardHome({
  greetingName,
  period,
  stats,
  recent,
  topDiagnoses,
  visitsInPeriod,
}: {
  greetingName: string;
  period: Period;
  stats: Stats;
  recent: RecentVisit[];
  topDiagnoses: TopDiagnosis[];
  visitsInPeriod: number;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const statList = [
    { key: "patientsToday" as const, value: stats.patientsToday },
    { key: "activeVisits" as const, value: stats.activeVisits },
    { key: "pendingOrders" as const, value: stats.pendingOrders },
    { key: "partners" as const, value: stats.partners },
  ];

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
  });

  const maxCount = Math.max(1, ...topDiagnoses.map((d) => d.count));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.dashboardHome.greeting}, {greetingName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">{t.dashboardHome.subtitle}</p>
        </div>

        {/* Filter periode */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
          {PERIOD_KEYS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => router.push(`/dashboard?period=${p}`)}
              aria-pressed={period === p}
              className={
                "rounded-md px-2.5 py-1 transition-colors " +
                (period === p ? "bg-brand text-white" : "text-muted hover:text-ink")
              }
            >
              {t.dashboardHome.period[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statList.map((s) => (
          <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                {statIcons[s.key]}
              </svg>
            </span>
            <p className="mt-4 text-3xl font-bold tracking-tight text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{t.dashboardHome.stats[s.key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Diagnosa terbanyak */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              {t.dashboardHome.topDiagnoses}
            </h2>
            <span className="text-xs text-muted">
              {t.dashboardHome.visitsInPeriod}: <b className="text-ink">{visitsInPeriod}</b>
            </span>
          </div>
          {topDiagnoses.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              {t.dashboardHome.noDiagnoses}
            </p>
          ) : (
            <ul className="space-y-3 px-5 py-4">
              {topDiagnoses.map((d) => (
                <li key={d.code}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-ink">
                      <span className="mr-1.5 font-mono text-xs text-muted">{d.code}</span>
                      {d.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-muted">
                      {d.count} {t.dashboardHome.cases}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-brand-cyan"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent visits */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              {t.dashboardHome.recentTitle}
            </h2>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              {t.dashboardHome.recentEmpty}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((v) => (
                <li key={v.mrNumber + v.visitDate} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {v.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{v.name}</p>
                    <p className="text-xs text-muted">{v.mrNumber}</p>
                  </div>
                  <span className="text-xs text-muted">
                    {dateFmt.format(new Date(v.visitDate))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
