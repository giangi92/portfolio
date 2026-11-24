import { useState } from "react";
import type { DocumentName } from "../../shared/content";
import { SaveBar, TextArea } from "../fields";
import { DEFAULT_LANGUAGE, useI18n } from "../i18n";
import { useEditableDocument } from "../useEditableDocument";
import { ContentLanguageBar } from "./ContentLanguageBar";
import { EditorShell } from "./EditorShell";

/** Editor for documents made of a single text field, e.g. { "aboutMe": "..." }. */
export const TextDocumentEditor = ({
  document,
  field,
  title,
  rows = 14,
}: {
  document: DocumentName;
  field: string;
  title: string;
  rows?: number;
}) => {
  const { t } = useI18n();
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);
  const doc = useEditableDocument<Record<string, string>>(
    document,
    (raw) => ({ [field]: typeof raw?.[field] === "string" ? raw[field] : "" }),
    lang
  );

  return (
    <EditorShell
      title={title}
      toolbar={<ContentLanguageBar lang={lang} onChange={setLang} doc={doc} />}
      loadError={doc.loadError}
      loading={!doc.draft}
      footer={
        <SaveBar state={doc.state} dirty={doc.dirty} onSave={doc.save} onReset={doc.reset} />
      }
    >
      {doc.draft && (
        <TextArea
          label={t.text.label}
          rows={rows}
          value={doc.draft[field]}
          onChange={(v) => doc.update({ [field]: v })}
          hint={t.text.hint}
        />
      )}
    </EditorShell>
  );
};
