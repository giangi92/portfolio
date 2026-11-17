import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, setUnauthorizedHandler, type Status } from "./api";
import { Dashboard } from "./Dashboard";
import { PasswordInput } from "./fields";

export const AdminApp = () => {
  const [status, setStatus] = useState<Status | undefined>();
  const [loadError, setLoadError] = useState("");

  const refresh = useCallback(() => {
    setLoadError("");
    api
      .status()
      .then(setStatus)
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(refresh);
    refresh();
  }, [refresh]);

  if (loadError)
    return (
      <Centered>
        <div className="alert alert-danger">
          {loadError}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={refresh}>
            Riprova
          </button>
        </div>
      </Centered>
    );
  if (!status)
    return (
      <Centered>
        <div className="spinner-border" role="status" />
      </Centered>
    );
  if (!status.configured)
    return <SetupForm minLength={status.minPasswordLength} onDone={refresh} />;
  if (!status.authenticated) return <LoginForm onDone={refresh} />;
  return (
    <Dashboard
      minPasswordLength={status.minPasswordLength}
      onLogout={() => api.logout().finally(refresh)}
    />
  );
};

const Centered = ({ children }: { children: ReactNode }) => (
  <div className="admin-center">{children}</div>
);

const SetupForm = ({ minLength, onDone }: { minLength: number; onDone: () => void }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < minLength) return setError(`Almeno ${minLength} caratteri`);
    if (password !== confirm) return setError("Le password non coincidono");
    setBusy(true);
    setError("");
    try {
      await api.setup(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <Centered>
      <form className="card admin-auth-card shadow-sm" onSubmit={submit}>
        <div className="card-body">
          <h1 className="h4 mb-1">
            <i className="bi bi-shield-lock me-2" />
            Primo accesso
          </h1>
          <p className="text-body-secondary small">
            Scegli la password del pannello. Può essere impostata <b>una sola volta</b>: viene
            salvata solo come hash Argon2id/bcrypt, mai in chiaro.
          </p>
          <PasswordInput
            label="Nuova password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            autoFocus
          />
          <PasswordInput
            label="Conferma password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          <div className="form-text mb-3">Minimo {minLength} caratteri. Usa una passphrase.</div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-primary w-100" disabled={busy}>
            Imposta password
          </button>
        </div>
      </form>
    </Centered>
  );
};

const LoginForm = ({ onDone }: { onDone: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.login(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <Centered>
      <form className="card admin-auth-card shadow-sm" onSubmit={submit}>
        <div className="card-body">
          <h1 className="h4 mb-3">
            <i className="bi bi-person-lock me-2" />
            Accesso amministratore
          </h1>
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            autoFocus
          />
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-primary w-100" disabled={busy || !password}>
            Entra
          </button>
          <a className="d-block text-center small mt-3" href={import.meta.env.BASE_URL}>
            Torna al portfolio
          </a>
        </div>
      </form>
    </Centered>
  );
};
