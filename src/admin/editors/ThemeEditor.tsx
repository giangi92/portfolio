import { useEffect, useId, type CSSProperties } from "react";
import {
  COLOR_LABELS,
  FONTS,
  THEME_PRESETS,
  loadThemeFonts,
  normalizeTheme,
  themeVariables,
  type ImageShape,
  type Theme,
  type ThemeColors,
} from "../../shared/theme";
import { SaveBar } from "../fields";
import { useEditableDocument } from "../useEditableDocument";
import { EditorShell } from "./EditorShell";

const SHAPES: { value: ImageShape; label: string }[] = [
  { value: "square", label: "Quadrata" },
  { value: "rounded", label: "Arrotondata" },
  { value: "circle", label: "Cerchio" },
];

export const ThemeEditor = () => {
  const doc = useEditableDocument<Theme>("theme.json", normalizeTheme);
  const theme = doc.draft;

  useEffect(() => {
    if (theme) loadThemeFonts(theme);
  }, [theme]);

  if (!theme)
    return <EditorShell title="Tema e stile" loadError={doc.loadError} loading />;

  const set = <K extends keyof Theme>(key: K, value: Theme[K]) => doc.update({ ...theme, [key]: value });
  const setColor = (key: keyof ThemeColors, value: string) =>
    set("colors", { ...theme.colors, [key]: value });

  return (
    <EditorShell
      title="Tema e stile"
      description="Colori, caratteri e forma della foto. L'anteprima si aggiorna mentre modifichi."
      footer={
        <SaveBar state={doc.state} dirty={doc.dirty} onSave={doc.save} onReset={doc.reset} />
      }
    >
      <div className="mb-4">
        <div className="form-label">Temi pronti</div>
        <div className="d-flex flex-wrap gap-2">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.name}
              className="btn btn-outline-secondary admin-preset"
              onClick={() => doc.update(p.theme)}
            >
              <span
                className="admin-preset-swatch"
                style={{
                  background: `linear-gradient(90deg, ${p.theme.colors.sidebarBackground} 50%, ${p.theme.colors.background} 50%)`,
                }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <h2 className="h6 text-uppercase text-body-secondary">Colori</h2>
          {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
            <ColorRow
              key={key}
              label={COLOR_LABELS[key]}
              value={theme.colors[key]}
              onChange={(v) => setColor(key, v)}
            />
          ))}

          <h2 className="h6 text-uppercase text-body-secondary mt-4">Stile</h2>
          <div className="mb-3">
            <div className="form-label">Modalità componenti</div>
            <div className="btn-group" role="group">
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  className={`btn btn-outline-secondary ${theme.mode === m ? "active" : ""}`}
                  onClick={() => set("mode", m)}
                >
                  <i className={`bi ${m === "light" ? "bi-sun" : "bi-moon-stars"} me-1`} />
                  {m === "light" ? "Chiara" : "Scura"}
                </button>
              ))}
            </div>
          </div>
          <FontSelect
            label="Carattere testo"
            value={theme.fontFamily}
            onChange={(v) => set("fontFamily", v)}
          />
          <FontSelect
            label="Carattere titoli"
            value={theme.headingFontFamily}
            onChange={(v) => set("headingFontFamily", v)}
          />
          <div className="mb-3">
            <label className="form-label d-flex justify-content-between">
              Dimensione testo <span>{theme.fontSize}px</span>
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
            <div className="form-label">Forma della foto</div>
            <div className="btn-group" role="group">
              {SHAPES.map((s) => (
                <button
                  key={s.value}
                  className={`btn btn-outline-secondary ${theme.imageShape === s.value ? "active" : ""}`}
                  onClick={() => set("imageShape", s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <h2 className="h6 text-uppercase text-body-secondary">Anteprima</h2>
          <ThemePreview theme={theme} />
        </div>
      </div>
    </EditorShell>
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
const ThemePreview = ({ theme }: { theme: Theme }) => (
  <div className="admin-preview" style={themeVariables(theme) as CSSProperties}>
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
