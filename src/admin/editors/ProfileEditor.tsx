import { useRef, useState, type ChangeEvent } from "react";
import { profileImageUrl, type Profile } from "../../shared/content";
import { api } from "../api";
import { SaveBar, TextInput } from "../fields";
import { useEditableDocument } from "../useEditableDocument";
import { EditorShell } from "./EditorShell";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const normalize = (raw: any): Profile => ({
  name: raw?.name ?? "",
  surname: raw?.surname ?? "",
  jobtitle: raw?.jobtitle ?? "",
  image: raw?.image ?? "profile.jpg",
  imageVersion: raw?.imageVersion ?? 1,
});

export const ProfileEditor = () => {
  const doc = useEditableDocument<Profile>("profile.json", normalize);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | undefined>();

  const set = (key: keyof Profile, value: string) =>
    doc.draft && doc.update({ ...doc.draft, [key]: value });

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED.includes(file.type))
      return setUploadMsg({ ok: false, text: "Formato non supportato: usa JPG, PNG o WEBP" });
    if (file.size > MAX_BYTES)
      return setUploadMsg({ ok: false, text: "Immagine troppo grande (max 5 MB)" });

    setUploading(true);
    setUploadMsg(undefined);
    try {
      const res = await api.uploadImage(file);
      const updated = normalize(res.content);
      doc.replaceSaved(updated);
      if (doc.draft)
        doc.update({ ...doc.draft, image: updated.image, imageVersion: updated.imageVersion });
      setUploadMsg({ ok: true, text: "Immagine aggiornata" });
    } catch (err) {
      setUploadMsg({ ok: false, text: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <EditorShell
      title="Profilo"
      description="Nome, ruolo e foto mostrati nella barra laterale."
      loadError={doc.loadError}
      loading={!doc.draft}
      footer={
        <SaveBar state={doc.state} dirty={doc.dirty} onSave={doc.save} onReset={doc.reset} />
      }
    >
      {doc.draft && (
        <div className="row g-4">
          <div className="col-md-4 text-center">
            <img
              src={profileImageUrl(doc.draft)}
              alt="Foto profilo"
              className="admin-avatar mb-3"
            />
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED.join(",")}
              hidden
              onChange={onFile}
            />
            <button
              className="btn btn-outline-primary w-100"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              <i className="bi bi-upload me-1" />
              {uploading ? "Caricamento…" : "Carica nuova foto"}
            </button>
            <div className="form-text">JPG, PNG o WEBP, max 5 MB. Si consiglia un formato quadrato.</div>
            {uploadMsg && (
              <div className={`small mt-2 ${uploadMsg.ok ? "text-success" : "text-danger"}`}>
                {uploadMsg.text}
              </div>
            )}
          </div>
          <div className="col-md-8">
            <TextInput label="Nome" value={doc.draft.name} onChange={(v) => set("name", v)} />
            <TextInput
              label="Cognome"
              value={doc.draft.surname}
              onChange={(v) => set("surname", v)}
            />
            <TextInput
              label="Ruolo"
              value={doc.draft.jobtitle}
              onChange={(v) => set("jobtitle", v)}
            />
          </div>
        </div>
      )}
    </EditorShell>
  );
};
