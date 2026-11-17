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
  | "theme.json";

export const fileUrl = (name: string) => `${import.meta.env.BASE_URL}files/${name}`;

export const profileImageUrl = (profile: Profile) =>
  fileUrl(`${profile.image}${profile.imageVersion ? `?v=${profile.imageVersion}` : ""}`);

export const fetchDocument = async <T,>(name: DocumentName): Promise<T> => {
  // no-store: content is edited from the dashboard and must show up immediately.
  const res = await fetch(fileUrl(name), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Cannot load ${name}: ${res.status}`);
  return (await res.json()) as T;
};
