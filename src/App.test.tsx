import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";

const docs: Record<string, unknown> = {
  "profile.json": { name: "Ada", surname: "Lovelace", jobtitle: "Engineer", image: "profile.jpg" },
  "theme.json": { colors: { background: "#123456" } },
  "aboutMe.json": { aboutMe: "Hello there" },
  "contacts.json": { contacts: "mail" },
  "expertise.json": { expertise: "skills" },
  "educationContent.json": { educationPaths: [] },
  "experienceContent.json": { educationPaths: [] },
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const name = url.split("/").pop()!.split("?")[0];
      return new Response(JSON.stringify(docs[name]), { status: 200 });
    })
  );
});
afterEach(() => vi.unstubAllGlobals());

test("renders profile, content and applies theme", async () => {
  render(<App />);
  expect(await screen.findByText("Hello there")).toBeInTheDocument();
  expect(await screen.findAllByText(/Engineer/)).not.toHaveLength(0);
  expect(document.documentElement.style.getPropertyValue("--pf-bg")).toBe("#123456");
  expect(document.documentElement.style.getPropertyValue("--pf-text")).toBe("#000000");
});
