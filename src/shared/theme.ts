// Theme stored in public/files/theme.json and applied at runtime as CSS variables.
// Allowed values must match the validation in public/api/index.php.

export type ImageShape = "square" | "rounded" | "circle";
export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  sidebarBackground: string;
  sidebarText: string;
  accent: string;
  background: string;
  text: string;
  title: string;
};

export type Theme = {
  /** Appearance shown to visitors who have not picked one with the light/dark button. */
  mode: ThemeMode;
  /** Light palette. */
  colors: ThemeColors;
  /** Dark palette. */
  darkColors: ThemeColors;
  fontFamily: string;
  headingFontFamily: string;
  fontSize: number;
  imageShape: ImageShape;
};

export const FONTS: Record<string, { label: string; css: string; google?: string }> = {
  system: {
    label: "System",
    css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  inter: { label: "Inter", css: "'Inter', sans-serif", google: "Inter" },
  roboto: { label: "Roboto", css: "'Roboto', sans-serif", google: "Roboto" },
  lato: { label: "Lato", css: "'Lato', sans-serif", google: "Lato" },
  poppins: { label: "Poppins", css: "'Poppins', sans-serif", google: "Poppins" },
  montserrat: { label: "Montserrat", css: "'Montserrat', sans-serif", google: "Montserrat" },
  merriweather: { label: "Merriweather", css: "'Merriweather', serif", google: "Merriweather" },
  playfair: {
    label: "Playfair Display",
    css: "'Playfair Display', serif",
    google: "Playfair Display",
  },
  sourcecode: {
    label: "Source Code Pro",
    css: "'Source Code Pro', monospace",
    google: "Source Code Pro",
  },
};

/** Editable colors, in the order the admin shows them. */
export const COLOR_KEYS: (keyof ThemeColors)[] = [
  "sidebarBackground",
  "sidebarText",
  "accent",
  "background",
  "text",
  "title",
];

export const DEFAULT_DARK_COLORS: ThemeColors = {
  sidebarBackground: "#1b1e24",
  sidebarText: "#f0ffff",
  accent: "#3dd5f3",
  background: "#121417",
  text: "#e3e6ea",
  title: "#ffffff",
};

export const DEFAULT_THEME: Theme = {
  mode: "light",
  colors: {
    sidebarBackground: "#282c34",
    sidebarText: "#f0ffff",
    accent: "#3dd5f3",
    background: "#ffffff",
    text: "#000000",
    title: "#000000",
  },
  darkColors: DEFAULT_DARK_COLORS,
  fontFamily: "system",
  headingFontFamily: "system",
  fontSize: 16,
  imageShape: "rounded",
};

export type ThemePresetId = "classic" | "night" | "ocean" | "elegant";

/** Display names are translated (see i18n `theme.presetNames`). */
export const THEME_PRESETS: { id: ThemePresetId; theme: Theme }[] = [
  { id: "classic", theme: DEFAULT_THEME },
  {
    id: "night",
    theme: {
      ...DEFAULT_THEME,
      mode: "dark",
      colors: {
        sidebarBackground: "#1f2937",
        sidebarText: "#f3f4f6",
        accent: "#8ab4f8",
        background: "#f7f8fa",
        text: "#1f2328",
        title: "#111827",
      },
      darkColors: {
        sidebarBackground: "#0f1117",
        sidebarText: "#e6e6e6",
        accent: "#8ab4f8",
        background: "#1b1e26",
        text: "#d9dde3",
        title: "#ffffff",
      },
      fontFamily: "inter",
      headingFontFamily: "inter",
    },
  },
  {
    id: "ocean",
    theme: {
      ...DEFAULT_THEME,
      colors: {
        sidebarBackground: "#0b3d5c",
        sidebarText: "#eaf6ff",
        accent: "#7fd3ff",
        background: "#f5fafd",
        text: "#13293d",
        title: "#0b3d5c",
      },
      darkColors: {
        sidebarBackground: "#06263a",
        sidebarText: "#eaf6ff",
        accent: "#7fd3ff",
        background: "#0d1b26",
        text: "#d6e6f2",
        title: "#7fd3ff",
      },
      fontFamily: "lato",
      headingFontFamily: "montserrat",
      imageShape: "circle",
    },
  },
  {
    id: "elegant",
    theme: {
      ...DEFAULT_THEME,
      colors: {
        sidebarBackground: "#2b2424",
        sidebarText: "#f6efe6",
        accent: "#d9b77e",
        background: "#fbf8f3",
        text: "#2b2424",
        title: "#7a5c2e",
      },
      darkColors: {
        sidebarBackground: "#1c1717",
        sidebarText: "#f6efe6",
        accent: "#d9b77e",
        background: "#221d1b",
        text: "#ece3d6",
        title: "#d9b77e",
      },
      fontFamily: "merriweather",
      headingFontFamily: "playfair",
      imageShape: "square",
    },
  },
];

const IMAGE_RADIUS: Record<ImageShape, string> = {
  square: "0",
  rounded: "0.5rem",
  circle: "50%",
};

const fontCss = (key: string) => (FONTS[key] ?? FONTS.system).css;

const loadedFonts = new Set<string>();
const loadGoogleFont = (key: string) => {
  const family = FONTS[key]?.google;
  if (!family || loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@400;700&display=swap`;
  document.head.appendChild(link);
};

/**
 * Merge a possibly partial/old theme document with defaults.
 * Themes saved before the dark palette existed had a single palette, used as-is in "dark" mode:
 * that palette becomes the dark one, so those sites keep looking the same.
 */
export const normalizeTheme = (raw: Partial<Theme> | undefined): Theme => {
  const legacyDark = !raw?.darkColors && raw?.mode === "dark";
  return {
    ...DEFAULT_THEME,
    ...raw,
    colors: { ...DEFAULT_THEME.colors, ...(legacyDark ? undefined : raw?.colors) },
    darkColors: { ...DEFAULT_DARK_COLORS, ...(legacyDark ? raw?.colors : raw?.darkColors) },
  };
};

export const paletteFor = (theme: Theme, mode: ThemeMode): ThemeColors =>
  mode === "dark" ? theme.darkColors : theme.colors;

/** CSS variables for a theme; used on :root by the site and on the preview in the dashboard. */
export const themeVariables = (
  theme: Theme,
  mode: ThemeMode = theme.mode
): Record<string, string> => {
  const colors = paletteFor(theme, mode);
  return {
    "--pf-sidebar-bg": colors.sidebarBackground,
    "--pf-sidebar-text": colors.sidebarText,
    "--pf-accent": colors.accent,
    "--pf-bg": colors.background,
    "--pf-text": colors.text,
    "--pf-title": colors.title,
    "--pf-font": fontCss(theme.fontFamily),
    "--pf-heading-font": fontCss(theme.headingFontFamily),
    "--pf-font-size": `${theme.fontSize}px`,
    "--pf-image-radius": IMAGE_RADIUS[theme.imageShape] ?? IMAGE_RADIUS.rounded,
    // Bootstrap reads these for body, placeholders, alerts...
    "--bs-body-bg": colors.background,
    "--bs-body-color": colors.text,
    "--bs-body-font-family": fontCss(theme.fontFamily),
    "--bs-body-font-size": `${theme.fontSize}px`,
  };
};

export const loadThemeFonts = (theme: Theme) => {
  loadGoogleFont(theme.fontFamily);
  loadGoogleFont(theme.headingFontFamily);
};

/** `mode` is the appearance to show: the visitor's choice, or the theme default. */
export const applyTheme = (
  theme: Theme,
  mode: ThemeMode = theme.mode,
  root: HTMLElement = document.documentElement
) => {
  loadThemeFonts(theme);
  root.setAttribute("data-bs-theme", mode);
  for (const [name, value] of Object.entries(themeVariables(theme, mode))) {
    root.style.setProperty(name, value);
  }
};
