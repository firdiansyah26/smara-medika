"use client";

import Link from "next/link";
import { useLocale } from "@/lib/use-locale";

/** Kontrol paginasi sederhana (Sebelumnya / Berikutnya + info halaman). */
export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (p: number) => string;
}) {
  const { t } = useLocale();
  if (pageCount <= 1) return null;

  const cls =
    "inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-ink transition-colors hover:bg-slate-50";
  const disabled = "pointer-events-none opacity-40";

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t.common.page} <b className="text-ink">{page}</b> / {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(page - 1)}
          className={cls + (page <= 1 ? " " + disabled : "")}
          aria-disabled={page <= 1}
        >
          {t.common.prev}
        </Link>
        <Link
          href={hrefFor(page + 1)}
          className={cls + (page >= pageCount ? " " + disabled : "")}
          aria-disabled={page >= pageCount}
        >
          {t.common.next}
        </Link>
      </div>
    </div>
  );
}
