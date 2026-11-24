import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, setUnauthorizedHandler, type Status } from "./api";
import { Dashboard } from "./Dashboard";
import { PasswordInput } from "./fields";
import { format, LanguageSelect, RichText, useI18n } from "./i18n";

export const AdminApp = () => {
  const { t, errorText } = useI18n();
  const [status, setStatus] = useState<Status | undefined>();
  const [loadError, setLoadError] = useState<unknown>();

  const refresh = useCallback(() => {
    setLoadError(undefined);
    api.status().then(setStatus).catch(setLoadError);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(refresh);
    refresh();
  }, [refresh]);

  if (loadError)
    return (
      <Centered>
        <div className="alert alert-danger">
          {errorText(loadError)}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={refresh}>
            {t.common.retry}
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
  <div className="admin-center">
    {children}
    <LanguageSelect className="admin-auth-language mt-3" />
  </div>
);

const SetupForm = ({ minLength, onDone }: { minLength: number; onDone: () => void }) => {
  const { t, errorText } = useI18n();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < minLength) return setError(format(t.auth.minLength, { min: minLength }));
    if (password !== confirm) return setError(t.common.passwordsDontMatch);
    setBusy(true);
    setError("");
    try {
      await api.setup(password);
      onDone();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <Centered>
      <form className="card admin-auth-card shadow-sm" onSubmit={submit}>
        <div className="card-body">
          <h1 className="h4 mb-1">
            <i className="bi bi-shield-lock me-2" />
            {t.auth.setupTitle}
          </h1>
          <p className="text-body-secondary small">
            <RichText text={t.auth.setupIntro} />
          </p>
          <PasswordInput
            label={t.auth.newPassword}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            autoFocus
          />
          <PasswordInput
            label={t.auth.confirmPassword}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          <div className="form-text mb-3">{format(t.auth.minLengthHint, { min: minLength })}</div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-primary w-100" disabled={busy}>
            {t.auth.setPassword}
          </button>
        </div>
      </form>
    </Centered>
  );
};

const LoginForm = ({ onDone }: { onDone: () => void }) => {
  const { t, errorText } = useI18n();
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
      setError(errorText(err));
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
            {t.auth.loginTitle}
          </h1>
          <PasswordInput
            label={t.auth.password}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            autoFocus
          />
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-primary w-100" disabled={busy || !password}>
            {t.auth.login}
          </button>
          <a className="d-block text-center small mt-3" href={import.meta.env.BASE_URL}>
            {t.auth.backToPortfolio}
          </a>
        </div>
      </form>
    </Centered>
  );
};
