import { useEffect, useState } from "react";
import { fetchDocument } from "../content";
import { completeness, mergeCatalog, normalizeTranslations, type CatalogTree } from "./catalog";
import { en, type Messages } from "./en";
import { es } from "./es";
import { it } from "./it";

/**
 * English is the main language: UI fallback for missing texts, and the language of the base
 * content documents (files/*.json). Other languages have content in files/i18n/<code>/.
 */
export const DEFAULT_LANGUAGE = "en";

/** Catalogs shipped with the code. Uploaded translations (translations.json) add to or override them. */
export const BUILT_IN: Record<string, Messages> = { en, it, es };

export type LanguageInfo = {
  code: string;
  name: string;
  source: "builtIn" | "uploaded" | "customized";
  /** Share of the English texts the language provides, 0–1. */
  completeness: number;
};

/** Full catalog of a language: uploaded texts over the built-in ones, English for the gaps. */
export const catalogFor = (code: string, uploaded: Record<string, CatalogTree>): Messages =>
  mergeCatalog(BUILT_IN[code] ?? en, uploaded[code]);

export const listLanguages = (uploaded: Record<string, CatalogTree>): LanguageInfo[] =>
  [...new Set([...Object.keys(BUILT_IN), ...Object.keys(uploaded)])].map((code) => ({
    code,
    name: catalogFor(code, uploaded).languageName,
    source: !BUILT_IN[code] ? "uploaded" : uploaded[code] ? "customized" : "builtIn",
    completeness: BUILT_IN[code] ? 1 : completeness(uploaded[code]),
  }));

/** Loads files/translations.json; a missing file just means no uploaded languages. */
export const useUploadedTranslations = () => {
  const [uploaded, setUploaded] = useState<Record<string, CatalogTree>>({});
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    let active = true;
    fetchDocument("translations.json")
      .then((raw) => active && setUploaded(normalizeTranslations(raw)))
      .catch((e: unknown) => {
        if (active && !(e instanceof Error && / 404$/.test(e.message))) setError(e);
      });
    return () => {
      active = false;
    };
  }, []);

  return { uploaded, setUploaded, error, setError };
};

export const readStored = (key: string): string | undefined => {
  try {
    return window.localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined; // storage unavailable (private mode, blocked cookies…)
  }
};

export const writeStored = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore: the choice just won't be remembered
  }
};
