/**
 * tests/unit/safeUrl.test.ts
 *
 * Fungsi   : Menguji sanitasi URL dinamis agar hanya http/https/path internal yang lolos.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test`
 * Catatan  : Fokus pada skema berbahaya yang umum dipakai untuk XSS.
 */
import { describe, expect, it } from "vitest";
import { safeHref, safeImageUrl } from "@/lib/safeUrl";

describe("safeHref", () => {
  it("mengizinkan path internal dan URL http/https", () => {
    expect(safeHref("/programs/aktif")).toBe("/programs/aktif");
    expect(safeHref("https://contoh.com/donasi")).toBe(
      "https://contoh.com/donasi",
    );
    expect(safeHref("http://localhost:8080/gambar.png")).toBe(
      "http://localhost:8080/gambar.png",
    );
  });

  it("menolak skema berbahaya dan protocol-relative URL", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHref("//evil.example/login")).toBeNull();
    expect(safeHref("/\\evil.example/login")).toBeNull();
    expect(safeHref("ftp://contoh.com/file")).toBeNull();
  });

  it("menolak nilai kosong atau bukan string", () => {
    expect(safeHref("")).toBeNull();
    expect(safeHref("   ")).toBeNull();
    expect(safeHref(null)).toBeNull();
    expect(safeHref(123)).toBeNull();
  });
});

describe("safeImageUrl", () => {
  it("mengembalikan URL aman atau fallback lokal", () => {
    expect(safeImageUrl("https://contoh.com/a.png", "/fallback.png")).toBe(
      "https://contoh.com/a.png",
    );
    expect(safeImageUrl("javascript:alert(1)", "/fallback.png")).toBe(
      "/fallback.png",
    );
    expect(safeImageUrl("data:image/svg+xml,<svg />", "/fallback.png")).toBe(
      "/fallback.png",
    );
    expect(safeImageUrl("", "/fallback.png")).toBe("/fallback.png");
  });
});
