import { en, type Messages } from "./en";

/** A catalog as stored in JSON: nested objects whose leaves are strings. */
export type CatalogTree = { [key: string]: string | CatalogTree };

export const MAX_CATALOG_BYTES = 256 * 1024;

/** Same rule as the API: "fr", "pt-BR", "zh-Hant"… */
export const LANGUAGE_CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;

const isTree = (v: unknown): v is CatalogTree =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Replaces `{name}` placeholders; unknown placeholders are left as they are. */
export const format = (template: string, params: Record<string, unknown> = {}): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

/** Every leaf path of a tree, e.g. "auth.login"; anything that is not an object is a leaf. */
const leafPaths = (tree: object, prefix = ""): string[] =>
  Object.entries(tree).flatMap(([k, v]) =>
    isTree(v) ? leafPaths(v, `${prefix}${k}.`) : [prefix + k]
  );

const get = (tree: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => (isTree(node) ? node[key] : undefined), tree);

const set = (tree: CatalogTree, path: string, value: string) => {
  const keys = path.split(".");
  let node = tree;
  for (const key of keys.slice(0, -1)) {
    if (!isTree(node[key])) node[key] = {};
    node = node[key] as CatalogTree;
  }
  node[keys[keys.length - 1]] = value;
};

const REFERENCE_PATHS = leafPaths(en);
const REFERENCE_SET = new Set(REFERENCE_PATHS);

export type CatalogReport = {
  /** Only the valid strings, in the reference structure. */
  cleaned: CatalogTree;
  translated: number;
  total: number;
  missing: string[];
  unknown: string[];
  nonString: string[];
  placeholderIssues: string[];
  languageName?: string;
};

/** Checks an uploaded catalog against the English reference. */
export const analyzeCatalog = (raw: unknown): CatalogReport => {
  const report: CatalogReport = {
    cleaned: {},
    translated: 0,
    total: REFERENCE_PATHS.length,
    missing: [],
    unknown: [],
    nonString: [],
    placeholderIssues: [],
  };
  for (const path of REFERENCE_PATHS) {
    const value = get(raw, path);
    if (value === undefined || value === "") report.missing.push(path);
    else if (typeof value !== "string") report.nonString.push(path);
    else {
      if (placeholders(value) !== placeholders(get(en, path) as string))
        report.placeholderIssues.push(path);
      set(report.cleaned, path, value);
      report.translated++;
    }
  }
  if (isTree(raw)) report.unknown = leafPaths(raw).filter((p) => !REFERENCE_SET.has(p));
  const name = get(raw, "languageName");
  if (typeof name === "string" && name.trim()) report.languageName = name.trim();
  return report;
};

/** Share of the reference texts present in a stored catalog, 0–1. */
export const completeness = (tree: CatalogTree) =>
  REFERENCE_PATHS.filter((p) => typeof get(tree, p) === "string").length / REFERENCE_PATHS.length;

/** Overlays the string leaves of `override` that exist in the reference onto `base`. */
export const mergeCatalog = (base: Messages, override: CatalogTree | undefined): Messages => {
  if (!override) return base;
  const result = structuredClone(base) as unknown as CatalogTree;
  for (const path of REFERENCE_PATHS) {
    const value = get(override, path);
    if (typeof value === "string" && value !== "") set(result, path, value);
  }
  return result as unknown as Messages;
};

/** Normalizes translations.json: `{ languages: { [code]: CatalogTree } }`. */
export const normalizeTranslations = (raw: unknown): Record<string, CatalogTree> => {
  const languages = isTree(raw) ? (raw as Record<string, unknown>).languages : undefined;
  if (!isTree(languages)) return {};
  return Object.fromEntries(
    Object.entries(languages).filter(([code, tree]) => LANGUAGE_CODE.test(code) && isTree(tree))
  ) as Record<string, CatalogTree>;
};
