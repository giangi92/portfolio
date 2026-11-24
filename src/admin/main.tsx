import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./admin.css";
import { AdminApp } from "./AdminApp";
import { I18nProvider } from "./i18n";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <I18nProvider>
      <AdminApp />
    </I18nProvider>
  </StrictMode>
);
