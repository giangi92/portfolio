// Shapes of the JSON documents in public/files. Keep in sync with public/api/index.php.

export type Profile = {
  name: string;
  surname: string;
  jobtitle: string;
  image: string;
  imageVersion?: number;
};

export type AboutMeDoc = { aboutMe: string };
export type ContactsDoc = { contacts: string };
export type ExpertiseDoc = { expertise: string };

export type EducationItem = { timePeriod: string; description: string };
export type EducationDoc = { educationPaths: EducationItem[] };

export type ExperienceItem = {
  timePeriod: string;
  title: string;
  description: string;
  activities?: string;
  technologiesAndTools?: string;
};
// The key name is historical; kept for compatibility with existing data.
export type ExperienceDoc = { educationPaths: ExperienceItem[] };

export type DocumentName =
  | "profile.json"
  | "aboutMe.json"
  | "educationContent.json"
  | "experienceContent.json"
  | "expertise.json"
  | "contacts.json"
  | "theme.json"
  // Dashboard translations uploaded by the admin: { languages: { [code]: catalog } }
  | "translations.json";

export const fileUrl = (name: string) => `${import.meta.env.BASE_URL}files/${name}`;

export const profileImageUrl = (profile: Profile) =>
  fileUrl(`${profile.image}${profile.imageVersion ? `?v=${profile.imageVersion}` : ""}`);

const getJson = async (path: string): Promise<Response> =>
  // no-store: content is edited from the dashboard and must show up immediately.
  fetch(fileUrl(path), { cache: "no-store", headers: { Accept: "application/json" } });

export const fetchDocument = async <T,>(name: DocumentName): Promise<T> => {
  const res = await getJson(name);
  if (!res.ok) throw new Error(`Cannot load ${name}: ${res.status}`);
  return (await res.json()) as T;
};

/**
 * Documents with a version per language. The base files (files/*.json) are the English,
 * main-language version; translations live in files/i18n/<code>/<name>.
 * Keep in sync with LOCALIZABLE in public/api/index.php.
 */
export const LOCALIZABLE: DocumentName[] = [
  "profile.json",
  "aboutMe.json",
  "educationContent.json",
  "experienceContent.json",
  "expertise.json",
  "contacts.json",
];

/** Translated version only, or undefined if that language has none. */
export const fetchTranslation = async <T,>(name: DocumentName, lang: string): Promise<T | undefined> => {
  const res = await getJson(`i18n/${encodeURIComponent(lang)}/${name}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Cannot load ${lang}/${name}: ${res.status}`);
  try {
    return (await res.json()) as T;
  } catch {
    return undefined; // e.g. a dev server answering index.html for unknown paths
  }
};

/** A translation overrides the base document; for the profile only the translated fields. */
export const mergeTranslation = <T,>(name: DocumentName, base: T, translation: unknown): T =>
  name === "profile.json"
    ? ({ ...base, ...(translation as object) } as T)
    : (translation as T);

/** The document in `lang`, falling back to the base (English) version. */
export const fetchLocalizedDocument = async <T,>(
  name: DocumentName,
  lang: string,
  defaultLang: string
): Promise<T> => {
  if (lang === defaultLang || !LOCALIZABLE.includes(name)) return fetchDocument<T>(name);
  const [base, translation] = await Promise.all([
    fetchDocument<T>(name),
    fetchTranslation<T>(name, lang).catch(() => undefined),
  ]);
  return translation === undefined ? base : mergeTranslation(name, base, translation);
};
