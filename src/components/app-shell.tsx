"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/use-locale";
import { mockTenants, mockUser, type MockTenant } from "@/lib/mock-data";
import type { Dictionary } from "@/lib/i18n";

type NavKey = keyof Dictionary["app"]["nav"];
type NavItem = { key: NavKey; href: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: <path d="M3 12l9-9 9 9M5 10v10h14V10" /> },
  {
    key: "patients",
    href: "/dashboard/pasien",
    icon: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  },
  {
    key: "records",
    href: "/dashboard/rekam-medis",
    icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h4" />,
  },
  {
    key: "drugTransfer",
    href: "/dashboard/transfer-obat",
    icon: <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  },
  {
    key: "partners",
    href: "/dashboard/rekanan",
    icon: <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />,
  },
  { key: "sharedApi", href: "/dashboard/shared-api", icon: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /> },
  {
    key: "settings",
    href: "/dashboard/pengaturan",
    icon: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  },
];

function tenantTypeLabel(type: MockTenant["type"], t: Dictionary): string {
  const idx = type === "RUMAH_SAKIT" ? 0 : type === "KLINIK" ? 1 : 2;
  return t.tenantTypes[idx];
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

function SidebarNav({
  t,
  pathname,
  onNavigate,
}: {
  t: Dictionary;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-brand text-white shadow-sm"
                : "text-slate-600 hover:bg-mint hover:text-brand-deep")
            }
          >
            <NavIcon>{item.icon}</NavIcon>
            {t.app.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [activeTenant, setActiveTenant] = useState<MockTenant>(mockTenants[0]);
  const [openMenu, setOpenMenu] = useState<"tenant" | "user" | "mobile" | null>(
    null,
  );
  const shellRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = mockUser.name
    .replace(/^dr\.?\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={shellRef} className="flex min-h-full bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <div className="mt-8 flex-1">
          <SidebarNav t={t} pathname={pathname} />
        </div>
      </aside>

      {/* Kolom utama */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === "mobile" ? null : "mobile")
              }
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Menu"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>

            {/* Tenant switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu(openMenu === "tenant" ? null : "tenant")
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-brand/40"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-sm">
                  {activeTenant.type === "RUMAH_SAKIT"
                    ? "🏥"
                    : activeTenant.type === "KLINIK"
                      ? "🩺"
                      : "💊"}
                </span>
                <span className="hidden sm:block">
                  <span className="block text-sm font-semibold leading-tight text-ink">
                    {activeTenant.name}
                  </span>
                  <span className="block text-xs leading-tight text-muted">
                    {tenantTypeLabel(activeTenant.type, t)}
                  </span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {openMenu === "tenant" && (
                <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    {t.app.topbar.switchTenant}
                  </p>
                  {mockTenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      type="button"
                      onClick={() => {
                        setActiveTenant(tenant);
                        setOpenMenu(null);
                      }}
                      className={
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-mint " +
                        (tenant.id === activeTenant.id
                          ? "bg-mint/60 font-semibold text-brand-deep"
                          : "text-slate-700")
                      }
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-sm">
                        {tenant.type === "RUMAH_SAKIT"
                          ? "🏥"
                          : tenant.type === "KLINIK"
                            ? "🩺"
                            : "💊"}
                      </span>
                      <span>
                        <span className="block leading-tight">{tenant.name}</span>
                        <span className="block text-xs leading-tight text-muted">
                          {tenantTypeLabel(tenant.type, t)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search (desktop) */}
            <div className="ml-2 hidden flex-1 md:block">
              <div className="relative max-w-md">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  placeholder={t.app.topbar.searchPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu(openMenu === "user" ? null : "user")
                  }
                  className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-slate-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-cyan text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-medium text-ink sm:block">
                    {mockUser.name}
                  </span>
                </button>

                {openMenu === "user" && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-ink">
                        {mockUser.name}
                      </p>
                      <p className="text-xs text-muted">{mockUser.email}</p>
                    </div>
                    <div className="my-1 h-px bg-slate-100" />
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-mint"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      {t.app.topbar.signOut}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          {openMenu === "mobile" && (
            <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
              <SidebarNav
                t={t}
                pathname={pathname}
                onNavigate={() => setOpenMenu(null)}
              />
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
