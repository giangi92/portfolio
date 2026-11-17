import { useState, type FormEvent } from "react";
import { api } from "../api";
import { PasswordInput } from "../fields";
import { EditorShell } from "./EditorShell";

export const SecurityPanel = ({ minPasswordLength }: { minPasswordLength: number }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | undefined>();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < minPasswordLength)
      return setMsg({ ok: false, text: `La nuova password deve avere almeno ${minPasswordLength} caratteri` });
    if (next !== confirm) return setMsg({ ok: false, text: "Le password non coincidono" });
    setBusy(true);
    setMsg(undefined);
    try {
      await api.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setMsg({ ok: true, text: "Password aggiornata" });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditorShell
      title="Sicurezza"
      description="La password è salvata solo come hash (Argon2id, o bcrypt se il server non lo supporta). Per cambiarla serve quella attuale."
    >
      <form className="admin-narrow" onSubmit={submit}>
        <PasswordInput
          label="Password attuale"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordInput
          label="Nuova password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Conferma nuova password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {msg && (
          <div className={`alert py-2 ${msg.ok ? "alert-success" : "alert-danger"}`}>{msg.text}</div>
        )}
        <button className="btn btn-primary" disabled={busy || !current || !next}>
          Cambia password
        </button>
      </form>
    </EditorShell>
  );
};
