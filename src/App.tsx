import { useEffect } from "react";
import ScrollToTop from "react-scroll-to-top";
import "./App.css";
import { Content } from "./components/Content";
import { Sidebar } from "./components/Sidebar";
import { MobileTopbar } from "./components/MobileTopbar";
import { SiteControls } from "./components/SiteControls";
import { useDocument } from "./shared/useDocument";
import type { Profile } from "./shared/content";
import { applyTheme, normalizeTheme, type Theme } from "./shared/theme";
import { useAppearance } from "./site/appearance";
import { SiteI18nProvider, useSiteI18n } from "./site/i18n";

const sideBarMinWidth = 150;
const sideBarMaxWidth = 180;

function App() {
  return (
    <SiteI18nProvider>
      <Portfolio />
    </SiteI18nProvider>
  );
}

const Portfolio = () => {
  const { lang, t } = useSiteI18n();
  const { data: profile } = useDocument<Profile>("profile.json", lang);
  const { data: rawTheme } = useDocument<Partial<Theme>>("theme.json");
  const theme = normalizeTheme(rawTheme);
  const { mode, toggle } = useAppearance(theme.mode);

  useEffect(() => {
    applyTheme(normalizeTheme(rawTheme), mode);
  }, [rawTheme, mode]);

  return (
    <div className="App">
      <div
        className="d-sm-none mobile-topbar"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebar"
      >
        <button
          type="button"
          className="btn d-sm-none mobile-topbar-button"
          aria-label={t.site.openMenu}
        >
          <i className="bi bi-list"></i>
        </button>{" "}
        <MobileTopbar profile={profile} />
      </div>
      <SiteControls mode={mode} onToggleMode={toggle} />
      <div className="container-fluid">
        <div className="row">
          <div className="col-2 p-0 sidebar">
            <div
              className="offcanvas-sm offcanvas-start"
              tabIndex={-1}
              style={{
                height: "100%",
                width: `${sideBarMaxWidth}px`,
                minWidth: `${sideBarMinWidth}px`,
                backgroundColor: "unset",
                borderRight: "unset",
              }}
              id="sidebar"
            >
              <div
                className="offcanvas-body"
                style={{
                  height: "100%",
                  width: "100%",
                  padding: 0,
                  backgroundColor: "unset",
                }}
              >
                <Sidebar profile={profile} />
              </div>
            </div>
          </div>
          <div className="col-8 content">
            <Content />
          </div>
        </div>
      </div>
      <ScrollToTop smooth style={{ left: 40 }} />
    </div>
  );
};

export default App;
