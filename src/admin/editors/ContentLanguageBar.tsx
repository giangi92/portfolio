import { useId } from "react";
import { DEFAULT_LANGUAGE, format, useI18n } from "../i18n";

type LocalizedDoc = {
  changed: boolean;
  exists: boolean;
  draft: unknown;
  removeTranslation: () => Promise<void>;
};

/** Picks which language version of a content section is being edited. */
export const ContentLanguageBar = ({
  lang,
  onChange,
  doc,
}: {
  lang: string;
  onChange: (lang: string) => void;
  doc: LocalizedDoc;
}) => {
  const { t, languages } = useI18n();
  const id = useId();
  const name = languages.find((l) => l.code === lang)?.name ?? lang;

  const pick = (next: string) => {
    if (next === lang) return;
    if (doc.changed && !window.confirm(t.content.discardChanges)) return;
    onChange(next);
  };

  const remove = () => {
    if (window.confirm(format(t.content.confirmDeleteTranslation, { language: name })))
      void doc.removeTranslation();
  };

  return (
    <div className="admin-content-language mb-4">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <label htmlFor={id} className="form-label mb-0">
          <i className="bi bi-translate me-1" aria-hidden="true" />
          {t.content.language}
        </label>
        <select
          id={id}
          className="form-select form-select-sm w-auto"
          value={lang}
          onChange={(e) => pick(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code} lang={l.code}>
              {l.name}
              {l.code === DEFAULT_LANGUAGE ? " ★" : ""}
            </option>
          ))}
        </select>
        {lang !== DEFAULT_LANGUAGE && doc.exists && doc.draft !== undefined && (
          <button className="btn btn-sm btn-outline-danger ms-auto" onClick={remove}>
            <i className="bi bi-trash me-1" />
            {format(t.content.deleteTranslation, { language: name })}
          </button>
        )}
      </div>
      {lang !== DEFAULT_LANGUAGE && doc.draft !== undefined && (
        <div className={`alert py-2 mt-2 mb-0 small ${doc.exists ? "alert-info" : "alert-warning"}`}>
          {format(doc.exists ? t.content.editing : t.content.notTranslated, { language: name })}
        </div>
      )}
    </div>
  );
};
