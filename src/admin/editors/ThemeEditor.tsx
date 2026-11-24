import { useEffect, useId, useState, type CSSProperties } from "react";
import {
  COLOR_KEYS,
  FONTS,
  THEME_PRESETS,
  loadThemeFonts,
  normalizeTheme,
  paletteFor,
  themeVariables,
  type ImageShape,
  type Theme,
  type ThemeColors,
  type ThemeMode,
} from "../../shared/theme";
import { SaveBar } from "../fields";
import { useI18n } from "../i18n";
import { useEditableDocument } from "../useEditableDocument";
import { EditorShell } from "./EditorShell";

const SHAPES: ImageShape[] = ["square", "rounded", "circle"];

export const ThemeEditor = () => {
  const { t } = useI18n();
  const doc = useEditableDocument<Theme>("theme.json", normalizeTheme);
  const theme = doc.draft;
  /** Palette being edited; also the one shown in the preview. */
  const [palette, setPalette] = useState<ThemeMode>("light");

  useEffect(() => {
    if (theme) loadThemeFonts(theme);
  }, [theme]);

  if (!theme)
    return <EditorShell title={t.nav.theme} loadError={doc.loadError} loading />;

  const set = <K extends keyof Theme>(key: K, value: Theme[K]) => doc.update({ ...theme, [key]: value });
  const paletteKey = palette === "dark" ? "darkColors" : "colors";
  const colors = paletteFor(theme, palette);
  const setColor = (key: keyof ThemeColors, value: string) =>
    set(paletteKey, { ...colors, [key]: value });

  return (
    <EditorShell
      title={t.nav.theme}
      description={t.theme.description}
      footer={
        <SaveBar state={doc.state} dirty={doc.dirty} onSave={doc.save} onReset={doc.reset} />
      }
    >
      <div className="mb-4">
        <div className="form-label">{t.theme.presets}</div>
        <div className="d-flex flex-wrap gap-2">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.id}
              className="btn btn-outline-secondary admin-preset"
              onClick={() => doc.update(p.theme)}
            >
              <span
                className="admin-preset-swatch"
                style={{
                  background: `linear-gradient(90deg, ${paletteFor(p.theme, palette).sidebarBackground} 50%, ${paletteFor(p.theme, palette).background} 50%)`,
                }}
              />
              {t.theme.presetNames[p.id]}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <h2 className="h6 text-uppercase text-body-secondary">{t.theme.colors}</h2>
          <div className="mb-3">
            <div className="form-label">{t.theme.palette}</div>
            <ModeButtons value={palette} onChange={setPalette} />
            <div className="form-text">{t.theme.paletteHint}</div>
          </div>
          {COLOR_KEYS.map((key) => (
            <ColorRow
              key={key}
              label={t.theme.colorLabels[key]}
              value={colors[key]}
              onChange={(v) => setColor(key, v)}
            />
          ))}

          <h2 className="h6 text-uppercase text-body-secondary mt-4">{t.theme.style}</h2>
          <div className="mb-3">
            <div className="form-label">{t.theme.mode}</div>
            <ModeButtons value={theme.mode} onChange={(m) => set("mode", m)} />
            <div className="form-text">{t.theme.modeHint}</div>
          </div>
          <FontSelect
            label={t.theme.bodyFont}
            value={theme.fontFamily}
            onChange={(v) => set("fontFamily", v)}
          />
          <FontSelect
            label={t.theme.headingFont}
            value={theme.headingFontFamily}
            onChange={(v) => set("headingFontFamily", v)}
          />
          <div className="mb-3">
            <label className="form-label d-flex justify-content-between">
              {t.theme.fontSize} <span>{theme.fontSize}px</span>
            </label>
            <input
              type="range"
              className="form-range"
              min={12}
              max={22}
              value={theme.fontSize}
              onChange={(e) => set("fontSize", Number(e.target.value))}
            />
          </div>
          <div className="mb-3">
            <div className="form-label">{t.theme.imageShape}</div>
            <div className="btn-group" role="group">
              {SHAPES.map((shape) => (
                <button
                  key={shape}
                  className={`btn btn-outline-secondary ${theme.imageShape === shape ? "active" : ""}`}
                  onClick={() => set("imageShape", shape)}
                >
                  {t.theme.shapes[shape]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <h2 className="h6 text-uppercase text-body-secondary">{t.theme.preview}</h2>
          <ThemePreview theme={theme} mode={palette} />
        </div>
      </div>
    </EditorShell>
  );
};

const ModeButtons = ({ value, onChange }: { value: ThemeMode; onChange: (m: ThemeMode) => void }) => {
  const { t } = useI18n();
  return (
    <div className="btn-group" role="group">
      {(["light", "dark"] as const).map((m) => (
        <button
          key={m}
          className={`btn btn-outline-secondary ${value === m ? "active" : ""}`}
          aria-pressed={value === m}
          onClick={() => onChange(m)}
        >
          <i className={`bi ${m === "light" ? "bi-sun" : "bi-moon-stars"} me-1`} />
          {m === "light" ? t.theme.light : t.theme.dark}
        </button>
      ))}
    </div>
  );
};

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const id = useId();
  return (
    <div className="d-flex align-items-center gap-2 mb-2">
      <input
        id={id}
        type="color"
        className="form-control form-control-color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label htmlFor={id} className="flex-grow-1 mb-0">
        {label}
      </label>
      <code className="text-body-secondary">{value}</code>
    </div>
  );
};

const FontSelect = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const id = useId();
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select
        id={id}
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: FONTS[value]?.css }}
      >
        {Object.entries(FONTS).map(([key, f]) => (
          <option key={key} value={key} style={{ fontFamily: f.css }}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/** Miniature of the site using the same CSS variables the site uses. */
const ThemePreview = ({ theme, mode }: { theme: Theme; mode: ThemeMode }) => (
  <div className="admin-preview" style={themeVariables(theme, mode) as CSSProperties}>
    <div className="admin-preview-sidebar">
      <div className="admin-preview-avatar" />
      <div className="admin-preview-name">
        Lorem
        <br />
        Ipsum
      </div>
      <hr />
      <div className="small">Frontend Developer</div>
      <ul>
        <li>About Me</li>
        <li>Education</li>
        <li>Experience</li>
      </ul>
    </div>
    <div className="admin-preview-content">
      <div className="admin-preview-title">
        <i className="bi bi-person-circle me-2" />
        ABOUT ME
      </div>
      <hr />
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla commodo, odio vitae
        posuere lacinia, ante mi auctor dolor.
      </p>
      <div className="admin-preview-title">
        <i className="bi bi-book-half me-2" />
        EDUCATION
      </div>
      <hr />
      <p className="mb-0">2012 – 2015 · Lorem ipsum dolor sit amet.</p>
    </div>
  </div>
);
