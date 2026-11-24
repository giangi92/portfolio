import { describe, expect, it } from "vitest";
import { analyzeCatalog, completeness, format, mergeCatalog, normalizeTranslations } from "./catalog";
import { en } from "./en";
import { es } from "./es";
import { it as italian } from "./it";

describe("format", () => {
  it("fills placeholders and keeps unknown ones", () => {
    expect(format("At least {min} chars, {other}", { min: 12 })).toBe("At least 12 chars, {other}");
  });
});

describe("analyzeCatalog", () => {
  it("accepts the English template as complete", () => {
    const r = analyzeCatalog(JSON.parse(JSON.stringify(en)));
    expect(r.translated).toBe(r.total);
    expect(r.missing).toEqual([]);
    expect(r.unknown).toEqual([]);
    expect(r.nonString).toEqual([]);
    expect(r.placeholderIssues).toEqual([]);
    expect(r.languageName).toBe("English");
  });

  it("built-in translations keep every placeholder", () => {
    for (const catalog of [italian, es]) expect(analyzeCatalog(catalog).placeholderIssues).toEqual([]);
  });

  it("reports missing, unknown, non-string keys and placeholder mismatches", () => {
    const r = analyzeCatalog({
      languageName: "Français",
      auth: { login: "Se connecter", minLength: "Au moins {max} caractères", extra: "x" },
      nav: { brand: 42 },
      bogus: { deep: "y" },
    });
    expect(r.translated).toBe(3);
    expect(r.missing).toContain("common.save");
    expect(r.unknown.sort()).toEqual(["auth.extra", "bogus.deep"]);
    expect(r.nonString).toEqual(["nav.brand"]);
    expect(r.placeholderIssues).toEqual(["auth.minLength"]);
    expect(r.cleaned).toEqual({
      languageName: "Français",
      auth: { login: "Se connecter", minLength: "Au moins {max} caractères" },
    });
  });
});

describe("mergeCatalog / completeness", () => {
  it("falls back to the base for missing texts", () => {
    const merged = mergeCatalog(en, { languageName: "Français", auth: { login: "Se connecter" } });
    expect(merged.languageName).toBe("Français");
    expect(merged.auth.login).toBe("Se connecter");
    expect(merged.auth.password).toBe(en.auth.password);
    expect(completeness({ languageName: "Français" })).toBeGreaterThan(0);
    expect(completeness({ languageName: "Français" })).toBeLessThan(1);
  });
});

describe("normalizeTheme", () => {
  it("keeps old single-palette dark themes looking the same", async () => {
    const { normalizeTheme, DEFAULT_THEME } = await import("../theme");
    const night = { mode: "dark" as const, colors: { ...DEFAULT_THEME.colors, background: "#1b1e26" } };
    const theme = normalizeTheme(night);
    expect(theme.darkColors.background).toBe("#1b1e26");
    expect(theme.colors).toEqual(DEFAULT_THEME.colors);
  });
});

describe("normalizeTranslations", () => {
  it("drops invalid codes and non-object catalogs", () => {
    expect(
      normalizeTranslations({ languages: { fr: { languageName: "Français" }, "../x": {}, de: "nope" } })
    ).toEqual({ fr: { languageName: "Français" } });
    expect(normalizeTranslations({ languages: [] })).toEqual({});
  });
});
