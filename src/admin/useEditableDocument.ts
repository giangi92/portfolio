import { useEffect, useMemo, useState } from "react";
import {
  fetchDocument,
  fetchTranslation,
  mergeTranslation,
  type DocumentName,
} from "../shared/content";
import { DEFAULT_LANGUAGE } from "../shared/i18n/languages";
import { api } from "./api";
import type { SaveState } from "./fields";
import { useI18n } from "./i18n";

/**
 * Loads a JSON document, keeps an editable draft and saves it through the API.
 * With a `lang` other than English it edits that language's version of the document; when the
 * translation does not exist yet, the English version is loaded as a starting point.
 */
export const useEditableDocument = <T,>(
  name: DocumentName,
  normalize: (raw: any) => T,
  lang: string = DEFAULT_LANGUAGE
) => {
  const localized = lang !== DEFAULT_LANGUAGE;
  const [base, setBase] = useState<unknown>();
  const [exists, setExists] = useState(true);
  const [saved, setSaved] = useState<T | undefined>();
  const [draft, setDraft] = useState<T | undefined>();
  const [loadError, setLoadError] = useState("");
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const { errorText } = useI18n();

  useEffect(() => {
    let active = true;
    setSaved(undefined);
    setDraft(undefined);
    setLoadError("");
    setState({ kind: "idle" });
    (async () => {
      const baseRaw = await fetchDocument(name);
      const translation = localized ? await fetchTranslation(name, lang) : undefined;
      if (!active) return;
      const doc = normalize(
        translation === undefined ? baseRaw : mergeTranslation(name, baseRaw, translation)
      );
      setBase(baseRaw);
      setExists(!localized || translation !== undefined);
      setSaved(doc);
      setDraft(doc);
    })().catch((e: unknown) => active && setLoadError(errorText(e)));
    return () => {
      active = false;
    };
    // normalize is a static function per editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, lang]);

  /** The draft differs from what is saved. */
  const changed = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  const update = (next: T) => {
    setDraft(next);
    if (state.kind !== "saving") setState({ kind: "idle" });
  };

  const save = async () => {
    if (draft === undefined) return;
    setState({ kind: "saving" });
    try {
      const res = await api.save(name, draft, localized ? lang : undefined);
      const doc = normalize(localized ? mergeTranslation(name, base, res.content) : res.content);
      if (!localized) setBase(res.content);
      setSaved(doc);
      setDraft(doc);
      setExists(true);
      setState({ kind: "saved" });
    } catch (e) {
      setState({ kind: "error", message: errorText(e) });
    }
  };

  /** Deletes this language's version; the English one is shown again as a starting point. */
  const removeTranslation = async () => {
    if (!localized) return;
    setState({ kind: "saving" });
    try {
      await api.deleteTranslation(name, lang);
      const doc = normalize(base);
      setSaved(doc);
      setDraft(doc);
      setExists(false);
      setState({ kind: "idle" });
    } catch (e) {
      setState({ kind: "error", message: errorText(e) });
    }
  };

  /** For changes made by other endpoints (e.g. image upload). */
  const replaceSaved = (doc: T) => {
    setSaved(doc);
    setDraft((d) => (d === undefined ? doc : d));
  };

  return {
    draft,
    update,
    save,
    reset: () => setDraft(saved),
    changed,
    /** Something to save: edits, or a translation that does not exist yet. */
    dirty: changed || !exists,
    /** False while editing a language that has no version of its own yet. */
    exists,
    removeTranslation,
    state,
    loadError,
    replaceSaved,
  };
};
