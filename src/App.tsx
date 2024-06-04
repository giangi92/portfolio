import ScrollToTop from "react-scroll-to-top";
import "./App.css";
import { Content } from "./components/Content";
import { Sidebar } from "./components/Sidebar";

const sideBarMinWidth = 150;
const sideBarMaxWidth = 180;

function App() {
  return (
    <div className="App">
      <button
        type="button"
        className="btn d-sm-none"
        style={{ position: "fixed", left: 15, top: 15, fontSize: "2rem" }}
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebar"
      >
        <i className="bi bi-list"></i>
      </button>
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
                <Sidebar />
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
