"use client";

import type { NotificationType, NotificationStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type NotifRow = {
  id: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  status: NotificationStatus;
  createdAt: string;
};

const STATUS_BADGE: Record<NotificationStatus, string> = {
  SENT: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-600",
  SKIPPED: "bg-slate-100 text-slate-500",
};

export function NotificationsView({ rows }: { rows: NotifRow[] }) {
  const { t, locale } = useLocale();
  const dtFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.notifications.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.notifications.subtitle}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.notifications.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.notifications.colTime}</TableHead>
                <TableHead>{t.notifications.colType}</TableHead>
                <TableHead>{t.notifications.colRecipient}</TableHead>
                <TableHead>{t.notifications.colStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dtFmt.format(new Date(n.createdAt))}
                  </TableCell>
                  <TableCell>
                    <span className="text-ink">{t.notifications.types[n.type]}</span>
                    <span className="block text-xs text-muted-foreground">
                      {n.subject}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {n.recipient}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                        STATUS_BADGE[n.status]
                      }
                    >
                      {t.notifications.statuses[n.status]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
