import { useEffect, useState } from "react";
import { fetchDocument, fetchLocalizedDocument, type DocumentName } from "./content";
import { DEFAULT_LANGUAGE } from "./i18n/languages";

/** Loads a document; with `lang`, its version in that language (English if not translated). */
export const useDocument = <T,>(name: DocumentName, lang?: string) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    (lang ? fetchLocalizedDocument<T>(name, lang, DEFAULT_LANGUAGE) : fetchDocument<T>(name))
      .then((doc) => active && setData(doc))
      .catch((e) => {
        console.error(e);
        if (active) setError(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [name, lang]);

  return { data, setData, loading, error };
};
