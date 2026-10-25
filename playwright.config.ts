/**
 * playwright.config.ts
 *
 * Fungsi   : Konfigurasi Playwright untuk E2E di tests/e2e dengan server dev lokal dan satu worker.
 * Ekspor   : default defineConfig
 * Dipakai  : Dijalankan oleh `npx playwright test`
 * Catatan  : baseURL http://localhost:3000, locale id-ID, trace retain-on-failure, dan webServer
 *            `next dev --webpack` untuk menghindari EPERM manifest Turbopack di Windows.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "id-ID",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run dev -- --webpack",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
