"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/use-locale";

type QState = {
  last: { id: string; code: string; counter: string | null } | null;
  counters: { counter: string; code: string | null }[];
  waiting: number;
};

export function DisplayBoard({
  tenantCode,
  tenantName,
}: {
  tenantCode: string;
  tenantName: string;
}) {
  const { t, locale } = useLocale();
  const [state, setState] = useState<QState | null>(null);
  const [audioOn, setAudioOn] = useState(false);

  const lastSpokenId = useRef<string | null>(null);
  const tplRef = useRef(t.queue.display.announceTemplate);
  const localeRef = useRef(locale);
  const audioRef = useRef(audioOn);

  // Sinkronkan ref tanpa memengaruhi langganan polling.
  useEffect(() => {
    tplRef.current = t.queue.display.announceTemplate;
    localeRef.current = locale;
    audioRef.current = audioOn;
  });

  function speak(code: string, counter: string | null) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const text = tplRef.current
      .replace("{code}", code.split("").join(" "))
      .replace("{counter}", counter ?? "");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = localeRef.current === "id" ? "id-ID" : "en-US";
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/antrian/${tenantCode}/state`, {
          cache: "no-store",
        });
        if (!res.ok || !active) return;
        const data: QState = await res.json();
        if (!active) return;
        setState(data);
        if (data.last && data.last.id !== lastSpokenId.current) {
          if (lastSpokenId.current !== null && audioRef.current) {
            speak(data.last.code, data.last.counter);
          }
          lastSpokenId.current = data.last.id;
        }
      } catch {
        /* abaikan */
      }
    }
    poll();
    const id = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [tenantCode]);

  function enableAudio() {
    if (window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
    setAudioOn(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-white">Smara</span>
            <span className="text-brand-cyan">Medika</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="text-lg text-white/70">{tenantName}</span>
        </div>
        <div className="flex items-center gap-3">
          {!audioOn && (
            <button
              type="button"
              onClick={enableAudio}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              🔊 {locale === "id" ? "Aktifkan suara" : "Enable sound"}
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 p-8">
        {/* Now serving */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <p className="text-xl font-semibold uppercase tracking-widest text-white/50">
            {t.queue.display.nowServing}
          </p>
          {state?.last ? (
            <>
              <p className="mt-4 text-[10rem] font-black leading-none tracking-tight text-brand-cyan">
                {state.last.code}
              </p>
              <p className="mt-4 text-3xl font-bold text-white/90">
                {t.queue.display.counter} {state.last.counter}
              </p>
            </>
          ) : (
            <p className="mt-6 text-2xl text-white/40">{t.queue.display.idle}</p>
          )}
        </div>

        {/* Counters grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(state?.counters ?? []).map((c) => (
            <div
              key={c.counter}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
                {t.queue.display.counter} {c.counter}
              </p>
              <p className="mt-2 text-4xl font-black text-white">
                {c.code ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 px-8 py-3 text-center text-sm text-white/50">
        {t.queue.display.waiting}: {state?.waiting ?? 0}
      </footer>
    </div>
  );
}
