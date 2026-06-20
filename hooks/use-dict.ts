"use client";

import { useCallback } from "react";
import { getDict, resolveLocale } from "@/lib/i18n";
import type { Dict, Locale } from "@/lib/i18n";

/** Read locale from <html lang> attribute — set by the layout. */
function useLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const lang = document.documentElement.lang;
  return resolveLocale(lang);
}

/**
 * Returns the current locale's dictionary.
 * Usage: const t = useDict(); t.nav.liveOperations
 */
export function useDict(): Dict {
  const locale = useLocale();
  return getDict(locale);
}

/**
 * Returns a translation function for dot-path access.
 * Usage: const t = useDictFn(); t("nav.liveOperations")
 */
export function useDictFn() {
  const dict = useDict();
  return useCallback(
    (path: string): string => {
      const keys = path.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = dict;
      for (const k of keys) val = val?.[k];
      return typeof val === "string" ? val : path;
    },
    [dict],
  );
}
