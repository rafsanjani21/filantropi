/**
 * tests/unit/setup.ts
 *
 * Fungsi   : Mendaftarkan matcher jest-dom (toBeInTheDocument, toBeDisabled, dll.) untuk Vitest.
 * Ekspor   : -
 * Dipakai  : vitest.config.ts melalui setupFiles
 * Catatan  : Dijalankan otomatis sebelum seluruh unit test.
 */
import "@testing-library/jest-dom/vitest";
