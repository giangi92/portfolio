import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./admin.css";
import { AdminApp } from "./AdminApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
