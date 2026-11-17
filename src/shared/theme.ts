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
  mode: ThemeMode;
  colors: ThemeColors;
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

export const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  sidebarBackground: "Sfondo barra laterale",
  sidebarText: "Testo barra laterale",
  accent: "Colore accento (link menu)",
  background: "Sfondo contenuto",
  text: "Testo contenuto",
  title: "Titoli e icone",
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
  fontFamily: "system",
  headingFontFamily: "system",
  fontSize: 16,
  imageShape: "rounded",
};

export const THEME_PRESETS: { name: string; theme: Theme }[] = [
  { name: "Classico", theme: DEFAULT_THEME },
  {
    name: "Notte",
    theme: {
      ...DEFAULT_THEME,
      mode: "dark",
      colors: {
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
    name: "Oceano",
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
      fontFamily: "lato",
      headingFontFamily: "montserrat",
      imageShape: "circle",
    },
  },
  {
    name: "Elegante",
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

/** Merge a possibly partial/old theme document with defaults. */
export const normalizeTheme = (raw: Partial<Theme> | undefined): Theme => ({
  ...DEFAULT_THEME,
  ...raw,
  colors: { ...DEFAULT_THEME.colors, ...raw?.colors },
});

/** CSS variables for a theme; used on :root by the site and on the preview in the dashboard. */
export const themeVariables = (theme: Theme): Record<string, string> => ({
  "--pf-sidebar-bg": theme.colors.sidebarBackground,
  "--pf-sidebar-text": theme.colors.sidebarText,
  "--pf-accent": theme.colors.accent,
  "--pf-bg": theme.colors.background,
  "--pf-text": theme.colors.text,
  "--pf-title": theme.colors.title,
  "--pf-font": fontCss(theme.fontFamily),
  "--pf-heading-font": fontCss(theme.headingFontFamily),
  "--pf-font-size": `${theme.fontSize}px`,
  "--pf-image-radius": IMAGE_RADIUS[theme.imageShape] ?? IMAGE_RADIUS.rounded,
  // Bootstrap reads these for body, placeholders, alerts...
  "--bs-body-bg": theme.colors.background,
  "--bs-body-color": theme.colors.text,
  "--bs-body-font-family": fontCss(theme.fontFamily),
  "--bs-body-font-size": `${theme.fontSize}px`,
});

export const loadThemeFonts = (theme: Theme) => {
  loadGoogleFont(theme.fontFamily);
  loadGoogleFont(theme.headingFontFamily);
};

export const applyTheme = (theme: Theme, root: HTMLElement = document.documentElement) => {
  loadThemeFonts(theme);
  root.setAttribute("data-bs-theme", theme.mode);
  for (const [name, value] of Object.entries(themeVariables(theme))) {
    root.style.setProperty(name, value);
  }
};
