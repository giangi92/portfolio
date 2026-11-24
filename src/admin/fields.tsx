import { useId, useState } from "react";
import { useI18n } from "./i18n";

export const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const id = useId();
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        className="form-control"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export const TextArea = ({
  label,
  value,
  onChange,
  rows = 6,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) => {
  const id = useId();
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <textarea
        id={id}
        className="form-control"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <div className="form-text">{hint}</div>}
    </div>
  );
};

export const PasswordInput = ({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
}) => {
  const id = useId();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="input-group">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className="form-control"
          value={value}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t.common.hidePassword : t.common.showPassword}
        >
          <i className={visible ? "bi bi-eye-slash" : "bi bi-eye"} />
        </button>
      </div>
    </div>
  );
};

export type SaveState = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

export const SaveBar = ({
  state,
  dirty,
  onSave,
  onReset,
}: {
  state: SaveState;
  dirty: boolean;
  onSave: () => void;
  onReset?: () => void;
}) => {
  const { t } = useI18n();
  return (
    <div className="admin-savebar">
      {state.kind === "error" && <span className="text-danger me-auto">{state.message}</span>}
      {state.kind === "saved" && !dirty && (
        <span className="text-success me-auto">
          <i className="bi bi-check-circle me-1" />
          {t.common.saved}
        </span>
      )}
      {dirty && state.kind !== "error" && (
        <span className="text-body-secondary me-auto">{t.common.unsavedChanges}</span>
      )}
      {onReset && (
        <button className="btn btn-outline-secondary" disabled={!dirty} onClick={onReset}>
          {t.common.cancel}
        </button>
      )}
      <button
        className="btn btn-primary"
        disabled={!dirty || state.kind === "saving"}
        onClick={onSave}
      >
        {state.kind === "saving" ? t.common.saving : t.common.save}
      </button>
    </div>
  );
};
