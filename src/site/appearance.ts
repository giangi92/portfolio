import { useState } from "react";
import { readStored, writeStored } from "../shared/i18n/languages";
import type { ThemeMode } from "../shared/theme";

const STORAGE_KEY = "site-appearance";

const isMode = (v: unknown): v is ThemeMode => v === "light" || v === "dark";

/** Light/dark appearance: the visitor's choice if any, otherwise the theme default set in the dashboard. */
export const useAppearance = (defaultMode: ThemeMode) => {
  const [choice, setChoice] = useState<ThemeMode | undefined>(() => {
    const stored = readStored(STORAGE_KEY);
    return isMode(stored) ? stored : undefined;
  });
  const mode = choice ?? defaultMode;

  const toggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setChoice(next);
    writeStored(STORAGE_KEY, next);
  };

  return { mode, toggle };
};
