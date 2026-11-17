import { useEffect, useState, type ReactNode } from "react";
import { ProfileEditor } from "./editors/ProfileEditor";
import { TextDocumentEditor } from "./editors/TextDocumentEditor";
import { ListEditor } from "./editors/ListEditor";
import { ThemeEditor } from "./editors/ThemeEditor";
import { SecurityPanel } from "./editors/SecurityPanel";

type Section = { key: string; label: string; icon: string; render: () => ReactNode };

export const Dashboard = ({
  minPasswordLength,
  onLogout,
}: {
  minPasswordLength: number;
  onLogout: () => void;
}) => {
  const sections: Section[] = [
    { key: "profile", label: "Profilo", icon: "bi-person-badge", render: () => <ProfileEditor /> },
    {
      key: "about",
      label: "About Me",
      icon: "bi-person-circle",
      render: () => <TextDocumentEditor document="aboutMe.json" field="aboutMe" title="About Me" />,
    },
    {
      key: "education",
      label: "Education",
      icon: "bi-book-half",
      render: () => (
        <ListEditor
          document="educationContent.json"
          title="Education"
          itemLabel="percorso"
          fields={[
            { key: "timePeriod", label: "Periodo", required: true },
            { key: "description", label: "Descrizione", multiline: true, required: true },
          ]}
        />
      ),
    },
    {
      key: "experience",
      label: "Experience",
      icon: "bi-briefcase-fill",
      render: () => (
        <ListEditor
          document="experienceContent.json"
          title="Experience"
          itemLabel="esperienza"
          fields={[
            { key: "timePeriod", label: "Periodo", required: true },
            { key: "title", label: "Ruolo / Azienda", required: true },
            { key: "description", label: "Descrizione", multiline: true, required: true },
            { key: "activities", label: "Attività (opzionale)", multiline: true },
            { key: "technologiesAndTools", label: "Tecnologie e strumenti (opzionale)", multiline: true },
          ]}
        />
      ),
    },
    {
      key: "expertise",
      label: "Expertise",
      icon: "bi-mortarboard-fill",
      render: () => (
        <TextDocumentEditor document="expertise.json" field="expertise" title="Expertise" />
      ),
    },
    {
      key: "contacts",
      label: "Contacts",
      icon: "bi-telephone-fill",
      render: () => (
        <TextDocumentEditor document="contacts.json" field="contacts" title="Contacts" rows={4} />
      ),
    },
    { key: "theme", label: "Tema e stile", icon: "bi-palette", render: () => <ThemeEditor /> },
    {
      key: "security",
      label: "Sicurezza",
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
          Pannello
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
          <a
            className="btn btn-sm btn-outline-light w-100 mb-2"
            href={import.meta.env.BASE_URL}
            target="_blank"
            rel="noopener"
          >
            <i className="bi bi-box-arrow-up-right me-1" />
            Vedi sito
          </a>
          <button className="btn btn-sm btn-outline-warning w-100" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-1" />
            Esci
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
