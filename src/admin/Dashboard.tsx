import { useEffect, useState, type ReactNode } from "react";
import { ProfileEditor } from "./editors/ProfileEditor";
import { TextDocumentEditor } from "./editors/TextDocumentEditor";
import { ListEditor } from "./editors/ListEditor";
import { ThemeEditor } from "./editors/ThemeEditor";
import { LanguagesEditor } from "./editors/LanguagesEditor";
import { SecurityPanel } from "./editors/SecurityPanel";
import { LanguageSelect, useI18n } from "./i18n";

type Section = { key: string; label: string; icon: string; render: () => ReactNode };

export const Dashboard = ({
  minPasswordLength,
  onLogout,
}: {
  minPasswordLength: number;
  onLogout: () => void;
}) => {
  const { t } = useI18n();

  const sections: Section[] = [
    { key: "profile", label: t.nav.profile, icon: "bi-person-badge", render: () => <ProfileEditor /> },
    {
      key: "about",
      label: t.nav.about,
      icon: "bi-person-circle",
      render: () => <TextDocumentEditor document="aboutMe.json" field="aboutMe" title={t.nav.about} />,
    },
    {
      key: "education",
      label: t.nav.education,
      icon: "bi-book-half",
      render: () => (
        <ListEditor
          document="educationContent.json"
          title={t.nav.education}
          labels={t.education}
          fields={[
            { key: "timePeriod", label: t.list.timePeriod, required: true },
            { key: "description", label: t.list.itemDescription, multiline: true, required: true },
          ]}
        />
      ),
    },
    {
      key: "experience",
      label: t.nav.experience,
      icon: "bi-briefcase-fill",
      render: () => (
        <ListEditor
          document="experienceContent.json"
          title={t.nav.experience}
          labels={t.experience}
          fields={[
            { key: "timePeriod", label: t.list.timePeriod, required: true },
            { key: "title", label: t.experience.title, required: true },
            { key: "description", label: t.list.itemDescription, multiline: true, required: true },
            { key: "activities", label: t.experience.activities, multiline: true },
            { key: "technologiesAndTools", label: t.experience.technologies, multiline: true },
          ]}
        />
      ),
    },
    {
      key: "expertise",
      label: t.nav.expertise,
      icon: "bi-mortarboard-fill",
      render: () => (
        <TextDocumentEditor document="expertise.json" field="expertise" title={t.nav.expertise} />
      ),
    },
    {
      key: "contacts",
      label: t.nav.contacts,
      icon: "bi-telephone-fill",
      render: () => (
        <TextDocumentEditor document="contacts.json" field="contacts" title={t.nav.contacts} rows={4} />
      ),
    },
    { key: "theme", label: t.nav.theme, icon: "bi-palette", render: () => <ThemeEditor /> },
    { key: "languages", label: t.nav.languages, icon: "bi-translate", render: () => <LanguagesEditor /> },
    {
      key: "security",
      label: t.nav.security,
      icon: "bi-shield-lock",
      render: () => <SecurityPanel minPasswordLength={minPasswordLength} />,
    },
  ];

  const initial = () => {
    const hash = window.location.hash.slice(1);
    return sections.some((s) => s.key === hash) ? hash : "profile";
  };
  const [active, setActive] = useState(initial);

  const [visited, setVisited] = useState(() => new Set([active]));

  useEffect(() => {
    window.history.replaceState(null, "", `#${active}`);
    setVisited((v) => (v.has(active) ? v : new Set(v).add(active)));
  }, [active]);

  const current = sections.find((s) => s.key === active) ?? sections[0];

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <div className="admin-brand">
          <i className="bi bi-sliders me-2" />
          {t.nav.brand}
        </div>
        <ul className="nav nav-pills flex-column">
          {sections.map((s) => (
            <li className="nav-item" key={s.key}>
              <button
                className={`nav-link w-100 text-start ${s.key === active ? "active" : ""}`}
                onClick={() => setActive(s.key)}
              >
                <i className={`bi ${s.icon} me-2`} />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="admin-nav-footer">
          <LanguageSelect className="mb-2" />
          <a
            className="btn btn-sm btn-outline-light w-100 mb-2"
            href={import.meta.env.BASE_URL}
            target="_blank"
            rel="noopener"
          >
            <i className="bi bi-box-arrow-up-right me-1" />
            {t.nav.viewSite}
          </a>
          <button className="btn btn-sm btn-outline-warning w-100" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-1" />
            {t.nav.logout}
          </button>
        </div>
      </nav>
      <main className="admin-main">
        {/* Visited sections stay mounted, so unsaved drafts survive switching section. */}
        {sections
          .filter((s) => s.key === current.key || visited.has(s.key))
          .map((s) => (
            <div key={s.key} hidden={s.key !== current.key}>
              {s.render()}
            </div>
          ))}
      </main>
    </div>
  );
};
