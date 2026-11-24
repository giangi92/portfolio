import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Messages } from "../shared/i18n/en";
import {
  catalogFor,
  DEFAULT_LANGUAGE,
  listLanguages,
  readStored,
  useUploadedTranslations,
  writeStored,
  type LanguageInfo,
} from "../shared/i18n/languages";

const STORAGE_KEY = "site-language";
const URL_PARAM = "lang";

type SiteI18n = {
  lang: string;
  setLang: (lang: string) => void;
  t: Messages;
  languages: LanguageInfo[];
};

const SiteI18nContext = createContext<SiteI18n | undefined>(undefined);

const urlLanguage = () => new URLSearchParams(window.location.search).get(URL_PARAM) ?? undefined;

/** Browser languages, most preferred first, with their base language too ("it-IT" → "it-IT", "it"). */
const browserLanguages = () =>
  (navigator.languages?.length ? navigator.languages : [navigator.language])
    .filter(Boolean)
    .flatMap((l) => [l, l.split("-")[0]]);

/**
 * Language of the public site. Picked from, in order: a `?lang=` link (handy to send a recruiter
 * a link in their language), the visitor's previous choice, the browser languages, English.
 */
export const SiteI18nProvider = ({ children }: { children: ReactNode }) => {
  const { uploaded } = useUploadedTranslations();
  const [chosen, setChosen] = useState(() => urlLanguage() ?? readStored(STORAGE_KEY));

  const languages = useMemo(() => listLanguages(uploaded), [uploaded]);
  const lang = useMemo(() => {
    const available = new Set(languages.map((l) => l.code));
    const candidates = [chosen, ...browserLanguages()];
    return candidates.find((c): c is string => !!c && available.has(c)) ?? DEFAULT_LANGUAGE;
  }, [languages, chosen]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<SiteI18n>(
    () => ({
      lang,
      t: catalogFor(lang, uploaded),
      languages,
      setLang: (next) => {
        setChosen(next);
        writeStored(STORAGE_KEY, next);
        // Keep a shared ?lang= link in sync, so a reload does not switch back.
        const url = new URL(window.location.href);
        if (url.searchParams.has(URL_PARAM)) {
          url.searchParams.set(URL_PARAM, next);
          window.history.replaceState(window.history.state, "", url);
        }
      },
    }),
    [lang, uploaded, languages]
  );

  return <SiteI18nContext.Provider value={value}>{children}</SiteI18nContext.Provider>;
};

export const useSiteI18n = (): SiteI18n => {
  const ctx = useContext(SiteI18nContext);
  if (!ctx) throw new Error("useSiteI18n must be used inside <SiteI18nProvider>");
  return ctx;
};
