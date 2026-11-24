import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError } from "../api";
import { format, normalizeTranslations, type CatalogTree } from "../../shared/i18n/catalog";
import type { Messages } from "../../shared/i18n/en";
import {
  catalogFor as resolveCatalog,
  DEFAULT_LANGUAGE,
  listLanguages,
  readStored,
  useUploadedTranslations,
  writeStored,
  type LanguageInfo,
} from "../../shared/i18n/languages";

export { format } from "../../shared/i18n/catalog";
export { BUILT_IN, DEFAULT_LANGUAGE, type LanguageInfo } from "../../shared/i18n/languages";

const STORAGE_KEY = "admin-language";

/** Turns any thrown value into a message in the current language, using the API error code if any. */
const translateError = (t: Messages, err: unknown): string => {
  if (err instanceof ApiError && err.code) {
    const template = (t.errors as Record<string, string>)[err.code];
    if (typeof template === "string")
      return format(template, err.code === "unreachable" ? { status: err.status } : err.params);
  }
  return err instanceof Error ? err.message : String(err);
};

type I18n = {
  lang: string;
  setLang: (lang: string) => void;
  t: Messages;
  errorText: (err: unknown) => string;
  languages: LanguageInfo[];
  /** Full catalog of a language (uploaded texts over the built-in ones, English for the gaps). */
  catalogFor: (code: string) => Messages;
  /** Uploaded translations as stored on the server, keyed by language code. */
  uploaded: Record<string, CatalogTree>;
  uploadedError?: unknown;
  saveUploaded: (next: Record<string, CatalogTree>) => Promise<void>;
};

const I18nContext = createContext<I18n | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [preferred, setPreferred] = useState(() => readStored(STORAGE_KEY) ?? DEFAULT_LANGUAGE);
  const { uploaded, setUploaded, error: uploadedError, setError } = useUploadedTranslations();

  const catalogFor = useCallback((code: string) => resolveCatalog(code, uploaded), [uploaded]);
  const languages = useMemo(() => listLanguages(uploaded), [uploaded]);

  // A remembered language that no longer exists (e.g. removed upload) falls back to English.
  const lang = languages.some((l) => l.code === preferred) ? preferred : DEFAULT_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const saveUploaded = useCallback(
    async (next: Record<string, CatalogTree>) => {
      const res = await api.save("translations.json", { languages: next });
      setUploaded(normalizeTranslations(res.content));
      setError(undefined);
    },
    [setUploaded, setError]
  );

  const value = useMemo<I18n>(() => {
    const t = catalogFor(lang);
    return {
      lang,
      t,
      setLang: (next) => {
        setPreferred(next);
        writeStored(STORAGE_KEY, next);
      },
      errorText: (err) => translateError(t, err),
      languages,
      catalogFor,
      uploaded,
      uploadedError,
      saveUploaded,
    };
  }, [lang, languages, catalogFor, uploaded, uploadedError, saveUploaded]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18n => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
};

/** Renders a translated text, turning `**text**` into bold. Never interprets HTML. */
export const RichText = ({ text }: { text: string }) => (
  <>
    {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))}
  </>
);

export const LanguageSelect = ({ className = "" }: { className?: string }) => {
  const { lang, setLang, t, languages } = useI18n();
  return (
    <div className={`input-group input-group-sm ${className}`}>
      <span className="input-group-text" title={t.language}>
        <i className="bi bi-translate" aria-hidden="true" />
      </span>
      <select
        className="form-select form-select-sm"
        aria-label={t.language}
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
};
