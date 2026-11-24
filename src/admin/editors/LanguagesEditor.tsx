import { useId, useRef, useState, type ChangeEvent } from "react";
import {
  analyzeCatalog,
  LANGUAGE_CODE,
  MAX_CATALOG_BYTES,
  type CatalogReport,
} from "../../shared/i18n/catalog";
import { en } from "../../shared/i18n/en";
import { BUILT_IN, format, RichText, useI18n, type LanguageInfo } from "../i18n";
import { EditorShell } from "./EditorShell";

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** Shows at most a few keys, so warnings stay readable. */
const keyList = (keys: string[], max = 5) =>
  keys.slice(0, max).join(", ") + (keys.length > max ? `, … (+${keys.length - max})` : "");

type Pending = { report: CatalogReport; fileName: string };

export const LanguagesEditor = () => {
  const { t, languages, catalogFor, uploaded, uploadedError, saveUploaded, errorText } = useI18n();
  const fileId = useId();
  const codeId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | undefined>();
  const [code, setCode] = useState("");
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | undefined>();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPending(undefined);
    setFileError("");
    setMsg(undefined);
    if (!file) return;
    if (file.size > MAX_CATALOG_BYTES)
      return setFileError(format(t.languages.tooLarge, { max: MAX_CATALOG_BYTES / 1024 }));
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      return setFileError(t.languages.invalidJson);
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw))
      return setFileError(t.languages.notAnObject);
    setPending({ report: analyzeCatalog(raw), fileName: file.name });
    // Suggest the code from names like "fr.json"; the template itself ("en.json") is not a hint.
    const guess = file.name.replace(/\.json$/i, "");
    if (LANGUAGE_CODE.test(guess) && guess !== "en") setCode(guess);
  };

  const resetUpload = () => {
    setPending(undefined);
    setCode("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const codeValid = LANGUAGE_CODE.test(code);
  const report = pending?.report;
  const blocking = !report || !codeValid || !report.languageName || report.nonString.length > 0;
  const replaces = codeValid && (uploaded[code] !== undefined || BUILT_IN[code] !== undefined);

  const save = async () => {
    if (!report || blocking) return;
    setBusy(true);
    setMsg(undefined);
    try {
      await saveUploaded({ ...uploaded, [code]: report.cleaned });
      setMsg({ ok: true, text: t.languages.saved });
      resetUpload();
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (lang: LanguageInfo) => {
    if (!window.confirm(format(t.languages.confirmRemove, { name: lang.name }))) return;
    const next = { ...uploaded };
    delete next[lang.code];
    setMsg(undefined);
    try {
      await saveUploaded(next);
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  const sourceLabel = {
    builtIn: t.languages.sourceBuiltIn,
    uploaded: t.languages.sourceUploaded,
    customized: t.languages.sourceCustomized,
  };

  return (
    <EditorShell title={t.nav.languages}>
      <p className="text-body-secondary">
        <RichText text={t.languages.description} />
      </p>
      <button className="btn btn-outline-primary mb-4" onClick={() => downloadJson("en.json", en)}>
        <i className="bi bi-download me-1" />
        {t.languages.downloadTemplate}
      </button>

      {uploadedError !== undefined && (
        <div className="alert alert-warning py-2">
          {format(t.languages.loadFailed, { error: errorText(uploadedError) })}
        </div>
      )}

      <h2 className="h6 text-uppercase text-body-secondary">{t.languages.installed}</h2>
      <div className="table-responsive mb-4">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>{t.languages.colLanguage}</th>
              <th>{t.languages.colCode}</th>
              <th>{t.languages.colCompleteness}</th>
              <th>{t.languages.colSource}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.code}>
                <td lang={l.code}>{l.name}</td>
                <td>
                  <code>{l.code}</code>
                </td>
                <td>{Math.round(l.completeness * 100)}%</td>
                <td>{sourceLabel[l.source]}</td>
                <td className="text-end text-nowrap">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => downloadJson(`${l.code}.json`, catalogFor(l.code))}
                    title={t.languages.download}
                    aria-label={`${t.languages.download} ${l.name}`}
                  >
                    <i className="bi bi-download" />
                  </button>
                  {l.source !== "builtIn" && (
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => remove(l)}
                      title={t.languages.remove}
                      aria-label={`${t.languages.remove} ${l.name}`}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="h6 text-uppercase text-body-secondary">{t.languages.uploadTitle}</h2>
      <div className="admin-narrow">
        <div className="mb-3">
          <label htmlFor={fileId} className="form-label">
            {t.languages.file}
          </label>
          <input
            id={fileId}
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="form-control"
            onChange={onFile}
          />
        </div>
        {fileError && <div className="alert alert-danger py-2">{fileError}</div>}

        {report && (
          <>
            <div className="mb-3">
              <label htmlFor={codeId} className="form-label">
                {t.languages.code}
              </label>
              <input
                id={codeId}
                className={`form-control ${code && !codeValid ? "is-invalid" : ""}`}
                value={code}
                placeholder="fr"
                onChange={(e) => setCode(e.target.value.trim())}
              />
              {code && !codeValid && <div className="invalid-feedback">{t.languages.invalidCode}</div>}
              <div className="form-text">{t.languages.codeHint}</div>
            </div>

            <ul className="small mb-3">
              <li>
                {report.languageName ? <b>{report.languageName}</b> : null}
                {report.languageName ? " · " : null}
                {format(t.languages.summary, { translated: report.translated, total: report.total })}
              </li>
              {!report.languageName && <li className="text-danger">{t.languages.missingName}</li>}
              {report.nonString.length > 0 && (
                <li className="text-danger">
                  {format(t.languages.nonString, { keys: keyList(report.nonString) })}
                </li>
              )}
              {report.missing.length > 0 && (
                <li className="text-warning-emphasis">
                  {format(t.languages.missingKeys, { count: report.missing.length })}
                </li>
              )}
              {report.placeholderIssues.length > 0 && (
                <li className="text-warning-emphasis">
                  {format(t.languages.placeholderMismatch, { keys: keyList(report.placeholderIssues) })}
                </li>
              )}
              {report.unknown.length > 0 && (
                <li className="text-body-secondary">
                  {format(t.languages.unknownKeys, {
                    count: report.unknown.length,
                    keys: keyList(report.unknown),
                  })}
                </li>
              )}
            </ul>

            {replaces && (
              <div className="alert alert-warning py-2">
                {format(t.languages.replaceWarning, { code })}
              </div>
            )}
          </>
        )}

        {msg && (
          <div className={`alert py-2 ${msg.ok ? "alert-success" : "alert-danger"}`}>{msg.text}</div>
        )}

        {report && (
          <div className="d-flex gap-2">
            <button className="btn btn-primary" disabled={blocking || busy} onClick={save}>
              {busy ? t.common.saving : t.languages.submit}
            </button>
            <button className="btn btn-outline-secondary" disabled={busy} onClick={resetUpload}>
              {t.common.cancel}
            </button>
          </div>
        )}
      </div>
    </EditorShell>
  );
};
