import type { DocumentName } from "../../shared/content";
import { SaveBar, TextArea, TextInput } from "../fields";
import { useState } from "react";
import { DEFAULT_LANGUAGE, useI18n } from "../i18n";
import { useEditableDocument } from "../useEditableDocument";
import { ContentLanguageBar } from "./ContentLanguageBar";
import { EditorShell } from "./EditorShell";

type Field = { key: string; label: string; multiline?: boolean; required?: boolean };
/** Per-list wording, so each language can use the right noun and grammatical gender. */
type ItemLabels = { add: string; newItem: string; confirmDelete: string };
type Item = Record<string, string>;
type ListDoc = { educationPaths: Item[] };

/** Editor for { educationPaths: [...] } documents (education and experience). */
export const ListEditor = ({
  document,
  title,
  labels,
  fields,
}: {
  document: DocumentName;
  title: string;
  labels: ItemLabels;
  fields: Field[];
}) => {
  const { t } = useI18n();
  const normalize = (raw: any): ListDoc => ({
    educationPaths: (Array.isArray(raw?.educationPaths) ? raw.educationPaths : []).map(
      (item: any) =>
        Object.fromEntries(
          fields.map((f) => [f.key, typeof item?.[f.key] === "string" ? item[f.key] : ""])
        )
    ),
  });
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);
  const doc = useEditableDocument<ListDoc>(document, normalize, lang);
  const items = doc.draft?.educationPaths ?? [];

  const setItems = (next: Item[]) => doc.update({ educationPaths: next });
  const setField = (index: number, key: string, value: string) =>
    setItems(items.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [it] = next.splice(index, 1);
    next.splice(index + delta, 0, it);
    setItems(next);
  };
  const remove = (index: number) => {
    if (window.confirm(labels.confirmDelete))
      setItems(items.filter((_, i) => i !== index));
  };
  const add = () =>
    setItems([Object.fromEntries(fields.map((f) => [f.key, ""])), ...items]);

  const missing = items.some((it) => fields.some((f) => f.required && !it[f.key].trim()));

  return (
    <EditorShell
      title={title}
      description={t.list.intro}
      toolbar={<ContentLanguageBar lang={lang} onChange={setLang} doc={doc} />}
      loadError={doc.loadError}
      loading={!doc.draft}
      footer={
        <>
          {missing && (
            <div className="alert alert-warning py-2 mt-3">{t.list.requiredMissing}</div>
          )}
          <SaveBar
            state={doc.state}
            dirty={doc.dirty && !missing}
            onSave={doc.save}
            onReset={doc.reset}
          />
        </>
      }
    >
      <button className="btn btn-outline-primary mb-3" onClick={add}>
        <i className="bi bi-plus-lg me-1" />
        {labels.add}
      </button>
      {items.length === 0 && <p className="text-body-secondary">{t.list.empty}</p>}
      {items.map((item, index) => (
        <div className="card mb-3" key={index}>
          <div className="card-header d-flex align-items-center gap-2">
            <span className="fw-semibold me-auto text-truncate">
              {item.timePeriod || labels.newItem}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              aria-label={t.list.moveUp}
            >
              <i className="bi bi-arrow-up" />
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
              aria-label={t.list.moveDown}
            >
              <i className="bi bi-arrow-down" />
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => remove(index)}
              aria-label={t.list.remove}
            >
              <i className="bi bi-trash" />
            </button>
          </div>
          <div className="card-body">
            {fields.map((f) =>
              f.multiline ? (
                <TextArea
                  key={f.key}
                  label={f.label}
                  rows={f.key === "description" ? 4 : 3}
                  value={item[f.key]}
                  onChange={(v) => setField(index, f.key, v)}
                />
              ) : (
                <TextInput
                  key={f.key}
                  label={f.label}
                  value={item[f.key]}
                  onChange={(v) => setField(index, f.key, v)}
                />
              )
            )}
          </div>
        </div>
      ))}
    </EditorShell>
  );
};
