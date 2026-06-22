import en from "./en";
import ar from "./ar";
import type { Dict } from "./en";

export type Locale = "en" | "ar";
export type { Dict };

const dictionaries = { en, ar } as const;

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "ar";
export const RTL_LOCALES: Locale[] = ["ar"];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function resolveLocale(raw: string | undefined): Locale {
  if (raw === "en" || raw === "ar") return raw;
  return DEFAULT_LOCALE;
}
