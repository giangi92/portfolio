import type { DocumentName } from "../../shared/content";
import { SaveBar, TextArea } from "../fields";
import { useEditableDocument } from "../useEditableDocument";
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
  const doc = useEditableDocument<Record<string, string>>(document, (raw) => ({
    [field]: typeof raw?.[field] === "string" ? raw[field] : "",
  }));

  return (
    <EditorShell
      title={title}
      loadError={doc.loadError}
      loading={!doc.draft}
      footer={
        <SaveBar state={doc.state} dirty={doc.dirty} onSave={doc.save} onReset={doc.reset} />
      }
    >
      {doc.draft && (
        <TextArea
          label="Testo"
          rows={rows}
          value={doc.draft[field]}
          onChange={(v) => doc.update({ [field]: v })}
          hint="Gli a capo vengono mantenuti nel sito."
        />
      )}
    </EditorShell>
  );
};
