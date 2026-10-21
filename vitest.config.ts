/**
 * vitest.config.ts
 *
 * Fungsi   : Konfigurasi Vitest untuk unit test React dengan environment jsdom, alias "@", dan setupTestingLibrary.
 * Ekspor   : default defineConfig
 * Dipakai  : Dijalankan oleh `npm test` / `npx vitest`
 * Catatan  : Hanya memuat test di folder tests/unit (termasuk subfolder) dengan globals aktif dan CSS dinonaktifkan.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    css: false,
  },
});
