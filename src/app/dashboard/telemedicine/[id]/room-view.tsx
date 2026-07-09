"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TeleconsultStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { canStart, canEnd, canCancel, canJoin } from "@/lib/teleconsult-flow";
import { startSession, endSession, cancelSession } from "../actions";

type Session = {
  id: string;
  roomCode: string;
  status: TeleconsultStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  note: string | null;
  patient: string;
  mrNumber: string;
  doctor: string;
  joinUrl: string | null;
};

const STATUS_LABEL: Record<TeleconsultStatus, string> = {
  SCHEDULED: "Terjadwal",
  ONGOING: "Berlangsung",
  ENDED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_BADGE: Record<TeleconsultStatus, string> = {
  SCHEDULED: "bg-slate-100 text-slate-600",
  ONGOING: "bg-emerald-50 text-emerald-700",
  ENDED: "bg-sky-50 text-sky-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export function RoomView({
  session,
  canManage,
}: {
  session: Session;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const dtFmt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const run = (fn: () => Promise<void>) => () => startTransition(() => fn());

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard/telemedicine")}
        className="text-sm text-brand hover:underline"
      >
        ← Kembali ke daftar sesi
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Ruang {session.roomCode}
        </h1>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[session.status]}`}
        >
          {STATUS_LABEL[session.status]}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Area video (placeholder — integrasi penyedia menyusul) */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/80">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-white/90">
              {canJoin(session.status)
                ? "Ruang video siap"
                : "Ruang video tidak aktif"}
            </p>
            <p className="max-w-xs text-xs text-white/50">
              Integrasi penyedia video (WebRTC/pihak ketiga) akan tersambung di
              sini. Kode ruang & alur sesi sudah aktif.
            </p>
            {session.joinUrl && canJoin(session.status) && (
              <a
                href={session.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white/90"
              >
                Buka tautan video
              </a>
            )}
          </div>
        </div>

        {/* Panel info + aksi */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Detail Sesi
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Pasien</dt>
                <dd className="font-medium text-ink">
                  {session.patient}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({session.mrNumber})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Dokter</dt>
                <dd className="font-medium text-ink">{session.doctor}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Jadwal</dt>
                <dd className="text-ink">
                  {dtFmt.format(new Date(session.scheduledAt))}
                </dd>
              </div>
              {session.startedAt && (
                <div>
                  <dt className="text-xs text-muted-foreground">Dimulai</dt>
                  <dd className="text-ink">
                    {dtFmt.format(new Date(session.startedAt))}
                  </dd>
                </div>
              )}
              {session.endedAt && (
                <div>
                  <dt className="text-xs text-muted-foreground">Selesai</dt>
                  <dd className="text-ink">
                    {dtFmt.format(new Date(session.endedAt))}
                  </dd>
                </div>
              )}
              {session.note && (
                <div>
                  <dt className="text-xs text-muted-foreground">Catatan</dt>
                  <dd className="text-ink">{session.note}</dd>
                </div>
              )}
            </dl>
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2">
              {canStart(session.status) && (
                <Button onClick={run(() => startSession(session.id))} disabled={pending}>
                  Mulai sesi
                </Button>
              )}
              {canEnd(session.status) && (
                <Button onClick={run(() => endSession(session.id))} disabled={pending}>
                  Akhiri sesi
                </Button>
              )}
              {canCancel(session.status) && (
                <Button
                  variant="outline"
                  onClick={run(() => cancelSession(session.id))}
                  disabled={pending}
                >
                  Batalkan
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
