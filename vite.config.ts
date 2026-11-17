/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// The site is served from /portfolio/ (see README).
const BASE = "/portfolio/";
// Local PHP API (see docker-compose.yml): `npm run api`
const API_TARGET = process.env.PORTFOLIO_API ?? "http://localhost:8787";

export default defineConfig({
  base: BASE,
  plugins: [react()],
  build: {
    outDir: "build",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        admin: resolve(import.meta.dirname, "admin/index.html"),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Must be proxied, never served statically: public/api contains PHP sources.
      [`${BASE}api`]: {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(BASE, "/"),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
