import { useEffect } from "react";
import ScrollToTop from "react-scroll-to-top";
import "./App.css";
import { Content } from "./components/Content";
import { Sidebar } from "./components/Sidebar";
import { MobileTopbar } from "./components/MobileTopbar";
import { useDocument } from "./shared/useDocument";
import type { Profile } from "./shared/content";
import { applyTheme, normalizeTheme, type Theme } from "./shared/theme";

const sideBarMinWidth = 150;
const sideBarMaxWidth = 180;

function App() {
  const { data: profile } = useDocument<Profile>("profile.json");
  const { data: theme } = useDocument<Partial<Theme>>("theme.json");

  useEffect(() => {
    applyTheme(normalizeTheme(theme));
  }, [theme]);

  return (
    <div className="App">
      <div
        className="d-sm-none mobile-topbar"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebar"
      >
        <button type="button" className="btn d-sm-none mobile-topbar-button">
          <i className="bi bi-list"></i>
        </button>{" "}
        <MobileTopbar profile={profile} />
      </div>
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
}

export default App;
