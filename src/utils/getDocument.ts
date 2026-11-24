import { fetchLocalizedDocument, type DocumentName } from "../shared/content";
import { DEFAULT_LANGUAGE } from "../shared/i18n/languages";

/** Loads a content document in `lang`, falling back to the English version. */
export const getDocument = (
  documentName: DocumentName,
  lang: string,
  setLoading: (v: boolean) => void,
  setError: (v: boolean) => void,
  setContent: (v: any) => void
) => {
  setLoading(true);
  setError(false);
  fetchLocalizedDocument(documentName, lang, DEFAULT_LANGUAGE)
    .then(setContent)
    .catch((error) => {
      console.error(error);
      setError(true);
    })
    .finally(() => setLoading(false));
};
