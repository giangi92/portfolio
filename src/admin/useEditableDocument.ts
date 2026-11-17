import { useEffect, useMemo, useState } from "react";
import { fetchDocument, type DocumentName } from "../shared/content";
import { api } from "./api";
import type { SaveState } from "./fields";

/** Loads a JSON document, keeps an editable draft and saves it through the API. */
export const useEditableDocument = <T,>(name: DocumentName, normalize: (raw: any) => T) => {
  const [saved, setSaved] = useState<T | undefined>();
  const [draft, setDraft] = useState<T | undefined>();
  const [loadError, setLoadError] = useState("");
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  useEffect(() => {
    fetchDocument(name)
      .then((raw) => {
        const doc = normalize(raw);
        setSaved(doc);
        setDraft(doc);
      })
      .catch((e: Error) => setLoadError(e.message));
    // normalize is a static function per editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  const update = (next: T) => {
    setDraft(next);
    if (state.kind !== "saving") setState({ kind: "idle" });
  };

  const save = async () => {
    if (draft === undefined) return;
    setState({ kind: "saving" });
    try {
      const res = await api.save(name, draft);
      const doc = normalize(res.content);
      setSaved(doc);
      setDraft(doc);
      setState({ kind: "saved" });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
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
    dirty,
    state,
    loadError,
    replaceSaved,
  };
};
