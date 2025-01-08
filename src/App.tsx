import ScrollToTop from "react-scroll-to-top";
import "./App.css";
import { Content } from "./components/Content";
import { Sidebar } from "./components/Sidebar";
import { MobileTopbar } from "./components/MobileTopbar";

const sideBarMinWidth = 150;
const sideBarMaxWidth = 180;

function App() {
  return (
    <div className="App">
      <div
        className="d-sm-none"
        style={{
          minHeight: 60,
          width: "100%",
          backgroundColor: "#292c34",
          position: "fixed",
          top: 0,
          left: 0,
          fontSize: "2rem",
          zIndex: 666,
          color: "whitesmoke",
        }}
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebar"
      >
        <button
          type="button"
          className="btn d-sm-none"
          style={{ position: "fixed", fontSize: "2rem", color: "whitesmoke" }}
        >
          <i className="bi bi-list"></i>
        </button>{" "}
        <MobileTopbar />
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
