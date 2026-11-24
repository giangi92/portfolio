import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";

/** Served files, keyed by path under files/. */
const files: Record<string, unknown> = {
  "profile.json": { name: "Ada", surname: "Lovelace", jobtitle: "Engineer", image: "profile.jpg" },
  "theme.json": { colors: { background: "#123456" } },
  "translations.json": { languages: {} },
  "aboutMe.json": { aboutMe: "Hello there" },
  "contacts.json": { contacts: "mail" },
  "expertise.json": { expertise: "skills" },
  "educationContent.json": { educationPaths: [] },
  "experienceContent.json": { educationPaths: [] },
  "i18n/it/aboutMe.json": { aboutMe: "Ciao a tutti" },
  "i18n/it/profile.json": { jobtitle: "Ingegnera" },
};

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const path = url.split("/files/").pop()!.split("?")[0];
      return path in files
        ? new Response(JSON.stringify(files[path]), { status: 200 })
        : new Response("not found", { status: 404 });
    })
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("renders profile, content and applies theme", async () => {
  render(<App />);
  expect(await screen.findByText("Hello there")).toBeInTheDocument();
  expect(await screen.findAllByText(/Engineer/)).not.toHaveLength(0);
  expect(document.documentElement.style.getPropertyValue("--pf-bg")).toBe("#123456");
  expect(document.documentElement.style.getPropertyValue("--pf-text")).toBe("#000000");
});

test("the visitor can switch language: UI and translated content change", async () => {
  render(<App />);
  expect(await screen.findByText("Hello there")).toBeInTheDocument();

  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Language" }), "it");

  expect(await screen.findByText("Ciao a tutti")).toBeInTheDocument();
  expect(await screen.findAllByText(/Ingegnera/)).not.toHaveLength(0);
  expect(screen.getByRole("link", { name: "Chi sono" })).toBeInTheDocument();
  expect(screen.getByText("CHI SONO")).toBeInTheDocument();
  // Not translated: English content is shown.
  expect(screen.getByText("skills")).toBeInTheDocument();
  expect(document.documentElement.lang).toBe("it");
  expect(window.localStorage.getItem("site-language")).toBe("it");
});

test("a ?lang= link opens the site in that language", async () => {
  window.history.replaceState(null, "", "/?lang=es");
  render(<App />);
  expect(await screen.findByRole("link", { name: "Sobre mí" })).toBeInTheDocument();
  expect(await screen.findByText("Hello there")).toBeInTheDocument();
});

test("the visitor can switch to dark mode", async () => {
  render(<App />);
  await screen.findByText("Hello there");
  expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");

  await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

  expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
  expect(document.documentElement.style.getPropertyValue("--pf-bg")).toBe("#121417");
  expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  expect(window.localStorage.getItem("site-appearance")).toBe("dark");
});
