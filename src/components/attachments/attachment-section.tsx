"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AttachmentEntity } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { isImageMime, formatBytes } from "@/lib/attachments";
import { Button } from "@/components/ui/button";
import { uploadAttachment, deleteAttachment } from "./actions";

export type AttachmentItem = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export function AttachmentSection({
  entityType,
  entityId,
  items,
  revalidate,
  canManage = true,
}: {
  entityType: AttachmentEntity;
  entityId: string;
  items: AttachmentItem[];
  revalidate: string;
  canManage?: boolean;
}) {
  const { t } = useLocale();
  const [state, action, pending] = useActionState(uploadAttachment, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const errMsg = state?.error
    ? state.error === "noFile"
      ? t.attachments.errNoFile
      : state.error === "tooLarge"
        ? t.attachments.errTooLarge
        : state.error === "badType"
          ? t.attachments.errBadType
          : t.attachments.errNotAllowed
    : null;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t.attachments.title}
        </h3>
      </div>

      <div className="p-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.attachments.empty}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((a) => (
              <li
                key={a.id}
                className="group relative overflow-hidden rounded-lg border border-slate-200"
              >
                <a
                  href={`/api/attachments/${a.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                  title={a.fileName}
                >
                  {isImageMime(a.mimeType) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/attachments/${a.id}`}
                      alt={a.fileName}
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-full flex-col items-center justify-center bg-slate-50 text-slate-400">
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />
                      </svg>
                      <span className="mt-1 text-[10px] font-semibold uppercase">
                        {a.mimeType.split("/").pop()}
                      </span>
                    </div>
                  )}
                  <div className="truncate bg-white px-2 py-1 text-[11px] text-ink">
                    {a.fileName}
                    <span className="ml-1 text-muted-foreground">
                      ({formatBytes(a.size)})
                    </span>
                  </div>
                </a>
                {canManage && (
                  <form
                    action={deleteAttachment}
                    onSubmit={(e) => {
                      if (!window.confirm(t.attachments.removeConfirm))
                        e.preventDefault();
                    }}
                    className="absolute right-1 top-1"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="revalidate" value={revalidate} />
                    <button
                      type="submit"
                      title={t.attachments.remove}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        {canManage && (
          <form
            ref={formRef}
            action={action}
            className="mt-3 space-y-2 border-t border-slate-100 pt-3"
          >
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input type="hidden" name="revalidate" value={revalidate} />
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              required
              className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-mint file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-deep hover:file:bg-mint/70"
            />
            <p className="text-[11px] text-muted-foreground">
              {t.attachments.maxNote}
            </p>
            {errMsg && (
              <p className="text-xs font-medium text-red-600">{errMsg}</p>
            )}
            <Button type="submit" size="sm" disabled={pending} className="w-full">
              {pending ? t.attachments.uploading : t.attachments.upload}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
