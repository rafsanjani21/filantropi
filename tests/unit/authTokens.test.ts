/**
 * tests/unit/authTokens.test.ts
 *
 * Fungsi   : Menguji penyimpanan access + refresh token di localStorage, sinkronisasi antar tab,
 *            pemulihan setelah reload, migrasi token lama, dan pembersihan.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test`
 * Catatan  : Tidak ada request jaringan; hanya menguji modul token.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/authTokens";

describe("authTokens", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearTokens();
  });

  it("menyimpan access token dan refresh token di localStorage", () => {
    setTokens("access-baru", "refresh-baru");

    expect(getAccessToken()).toBe("access-baru");
    expect(getRefreshToken()).toBe("refresh-baru");
    expect(localStorage.getItem("access_token")).toBe("access-baru");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-baru");
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
  });

  it("memulihkan token dari storage setelah reload", async () => {
    setTokens("access-sesi", "refresh-sesi");

    vi.resetModules();
    const reloaded = await import("@/lib/authTokens");

    expect(reloaded.getAccessToken()).toBe("access-sesi");
    expect(reloaded.getRefreshToken()).toBe("refresh-sesi");
  });

  it("tab baru langsung mendapat sesi yang sama dari localStorage", async () => {
    setTokens("access-tab-lama", "refresh-bersama");

    sessionStorage.clear();
    vi.resetModules();
    const newTab = await import("@/lib/authTokens");

    expect(newTab.getAccessToken()).toBe("access-tab-lama");
    expect(newTab.getRefreshToken()).toBe("refresh-bersama");
  });

  it("memigrasikan access token lama dari sessionStorage ke localStorage", () => {
    sessionStorage.setItem("access_token", "access-sesi-lama");

    expect(getAccessToken()).toBe("access-sesi-lama");
    expect(localStorage.getItem("access_token")).toBe("access-sesi-lama");
    expect(sessionStorage.getItem("access_token")).toBeNull();
  });

  it("memigrasikan refresh token lama dari sessionStorage ke localStorage", () => {
    sessionStorage.setItem("refresh_token", "refresh-sesi-lama");

    expect(getRefreshToken()).toBe("refresh-sesi-lama");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-sesi-lama");
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
  });

  it("menghapus token admin lama tanpa memigrasikannya", () => {
    localStorage.setItem("admin_token", "admin-lama");
    localStorage.setItem("admin_refresh_token", "admin-refresh-lama");

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem("admin_token")).toBeNull();
    expect(localStorage.getItem("admin_refresh_token")).toBeNull();
  });

  it("setTokens tanpa refresh baru tidak menyisakan refresh milik sesi lama", () => {
    setTokens("access-lama", "refresh-lama");
    setTokens("access-baru");

    expect(getAccessToken()).toBe("access-baru");
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
  });

  it("clearTokens menghapus access token dan refresh token", () => {
    setTokens("access-baru", "refresh-baru");
    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
  });
});
