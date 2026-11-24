import type { ThemeMode } from "../../shared/theme";
import { useSiteI18n } from "../../site/i18n";
import "./index.css";

/** Language picker and light/dark switch, fixed at the top right of the site. */
export const SiteControls = ({ mode, onToggleMode }: { mode: ThemeMode; onToggleMode: () => void }) => {
  const { lang, setLang, t, languages } = useSiteI18n();
  const toggleLabel = mode === "dark" ? t.site.switchToLight : t.site.switchToDark;

  return (
    <div className="site-controls">
      {languages.length > 1 && (
        <select
          className="form-select form-select-sm site-control"
          aria-label={t.language}
          title={t.language}
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code} lang={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        className="btn btn-sm site-control site-mode-toggle"
        onClick={onToggleMode}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        <i className={mode === "dark" ? "bi bi-sun" : "bi bi-moon-stars"} aria-hidden="true" />
      </button>
    </div>
  );
};
