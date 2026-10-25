/**
 * tests/unit/authTokens.test.ts
 *
 * Fungsi   : Menguji penyimpanan access token di memori, refresh token di sessionStorage,
 *            migrasi token lama, dan pembersihan token admin.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test`
 * Catatan  : Tidak ada request jaringan; hanya menguji modul token.
 */
import { beforeEach, describe, expect, it } from "vitest";
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

  it("menyimpan access token hanya di memori dan refresh token di sessionStorage", () => {
    setTokens("access-baru", "refresh-baru");

    expect(getAccessToken()).toBe("access-baru");
    expect(getRefreshToken()).toBe("refresh-baru");
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBe("refresh-baru");
  });

  it("memigrasikan token lama lalu menghapus salinan dari localStorage", () => {
    localStorage.setItem("access_token", "access-lama");
    localStorage.setItem("refresh_token", "refresh-lama");

    expect(getAccessToken()).toBe("access-lama");
    expect(getRefreshToken()).toBe("refresh-lama");
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
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
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
  });

  it("clearTokens menghapus access token memori dan refresh token sesi", () => {
    setTokens("access-baru", "refresh-baru");
    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
  });
});
