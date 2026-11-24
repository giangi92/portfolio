import { useRef, useState, type ChangeEvent } from "react";
import { profileImageUrl, type Profile } from "../../shared/content";
import { api } from "../api";
import { SaveBar, TextInput } from "../fields";
import { DEFAULT_LANGUAGE, useI18n } from "../i18n";
import { useEditableDocument } from "../useEditableDocument";
import { ContentLanguageBar } from "./ContentLanguageBar";
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
  const { t, errorText } = useI18n();
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);
  // Only the job title changes per language: name, surname and photo are edited in English.
  const shared = lang === DEFAULT_LANGUAGE;
  const doc = useEditableDocument<Profile>("profile.json", normalize, lang);
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
      return setUploadMsg({ ok: false, text: t.errors.imageFormat });
    if (file.size > MAX_BYTES)
      return setUploadMsg({ ok: false, text: t.errors.imageTooLarge });

    setUploading(true);
    setUploadMsg(undefined);
    try {
      const res = await api.uploadImage(file);
      const updated = normalize(res.content);
      doc.replaceSaved(updated);
      if (doc.draft)
        doc.update({ ...doc.draft, image: updated.image, imageVersion: updated.imageVersion });
      setUploadMsg({ ok: true, text: t.profile.uploaded });
    } catch (err) {
      setUploadMsg({ ok: false, text: errorText(err) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <EditorShell
      title={t.nav.profile}
      description={t.profile.description}
      toolbar={<ContentLanguageBar lang={lang} onChange={setLang} doc={doc} />}
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
              alt={t.profile.photoAlt}
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
              disabled={uploading || !shared}
              onClick={() => fileInput.current?.click()}
            >
              <i className="bi bi-upload me-1" />
              {uploading ? t.profile.uploading : t.profile.upload}
            </button>
            <div className="form-text">{t.profile.uploadHint}</div>
            {uploadMsg && (
              <div className={`small mt-2 ${uploadMsg.ok ? "text-success" : "text-danger"}`}>
                {uploadMsg.text}
              </div>
            )}
          </div>
          <div className="col-md-8">
            {!shared && <p className="form-text mt-0">{t.content.sharedFields}</p>}
            <TextInput
              label={t.profile.name}
              value={doc.draft.name}
              onChange={(v) => set("name", v)}
              disabled={!shared}
            />
            <TextInput
              label={t.profile.surname}
              value={doc.draft.surname}
              onChange={(v) => set("surname", v)}
              disabled={!shared}
            />
            <TextInput
              label={t.profile.jobtitle}
              value={doc.draft.jobtitle}
              onChange={(v) => set("jobtitle", v)}
            />
          </div>
        </div>
      )}
    </EditorShell>
  );
};
