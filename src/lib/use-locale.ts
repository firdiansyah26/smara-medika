"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  dictionaries,
  LOCALE_STORAGE_KEY,
  LOCALES,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

// Store bahasa berbasis localStorage (pola useSyncExternalStore — bebas mismatch hydration).
let cachedLocale: Locale | null = null;
const listeners = new Set<() => void>();

function readStored(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const v = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  return v && LOCALES.includes(v) ? v : DEFAULT_LOCALE;
}

function getSnapshot(): Locale {
  if (cachedLocale === null) cachedLocale = readStored();
  return cachedLocale;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setLocale(l: Locale) {
  cachedLocale = l;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    document.documentElement.lang = l;
  }
  listeners.forEach((cb) => cb());
}

export function useLocale(): {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
} {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { locale, setLocale, t: dictionaries[locale] };
}
