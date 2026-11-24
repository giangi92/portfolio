import { useState, type FormEvent } from "react";
import { api } from "../api";
import { PasswordInput } from "../fields";
import { format, useI18n } from "../i18n";
import { EditorShell } from "./EditorShell";

export const SecurityPanel = ({ minPasswordLength }: { minPasswordLength: number }) => {
  const { t, errorText } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | undefined>();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < minPasswordLength)
      return setMsg({ ok: false, text: format(t.security.tooShort, { min: minPasswordLength }) });
    if (next !== confirm) return setMsg({ ok: false, text: t.common.passwordsDontMatch });
    setBusy(true);
    setMsg(undefined);
    try {
      await api.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setMsg({ ok: true, text: t.security.updated });
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditorShell title={t.nav.security} description={t.security.description}>
      <form className="admin-narrow" onSubmit={submit}>
        <PasswordInput
          label={t.security.current}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordInput
          label={t.security.new}
          value={next}
          onChange={setNext}
          autoComplete="new-password"
        />
        <PasswordInput
          label={t.security.confirm}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {msg && (
          <div className={`alert py-2 ${msg.ok ? "alert-success" : "alert-danger"}`}>{msg.text}</div>
        )}
        <button className="btn btn-primary" disabled={busy || !current || !next}>
          {t.security.submit}
        </button>
      </form>
    </EditorShell>
  );
};
