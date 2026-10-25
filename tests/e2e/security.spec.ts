/**
 * tests/e2e/security.spec.ts
 *
 * Fungsi   : Memverifikasi header keamanan dasar dan ketiadaan open redirect pada URL legacy.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Playwright saat `npm run test:e2e`
 * Catatan  : Tidak membutuhkan backend karena hanya memeriksa respons HTTP dari Next.js.
 */
import { test, expect } from "@playwright/test";

test.describe("Security headers", () => {
  test("mengirim header keamanan dasar dan menyembunyikan X-Powered-By", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);

    const headers = res.headers();
    const csp = headers["content-security-policy"] ?? "";
    const directives = new Map(
      csp
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const [name, ...values] = part.split(/\s+/);
          return [name, values];
        }),
    );
    const scriptSrc = directives.get("script-src")?.join(" ") ?? "";
    const imgSrc = directives.get("img-src")?.join(" ") ?? "";
    const frameSrc = directives.get("frame-src")?.join(" ") ?? "";
    const connectSrc = directives.get("connect-src")?.join(" ") ?? "";

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("script-src-attr 'none'");
    expect(scriptSrc).toMatch(/'nonce-[^']+'/);
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(imgSrc).toContain("https://upload.wikimedia.org");
    expect(imgSrc).not.toMatch(/(^|\s)https?:(\s|$)/);
    expect(frameSrc).not.toContain("https://*.google.com");
    expect(connectSrc).not.toContain("https://*.googleapis.com");
    expect(headers["permissions-policy"]).toBe(
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
    expect(headers["x-permitted-cross-domain-policies"]).toBe("none");
    expect(headers["origin-agent-cluster"]).toBe("?1");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-powered-by"]).toBeUndefined();

    const html = await res.text();
    const nonce = html.match(/<script[^>]+nonce="([^"]+)"/)?.[1];
    expect(nonce).toBeTruthy();
    expect(csp).toContain(`'nonce-${nonce}'`);
  });

  test("halaman sensitif mengirim Cache-Control no-store", async ({ request }) => {
    for (const path of ["/profile", "/payment/pending", "/programs/manage"]) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()["cache-control"]).toContain("no-store");
    }
  });

  test("redirect legacy tetap berada di origin sendiri", async ({ request }) => {
    const res = await request.get("/DetailPage?slug=//evil.example", {
      maxRedirects: 0,
    });

    expect(res.status()).toBe(308);
    const location = res.headers()["location"] ?? "";
    const target = new URL(location, res.url());
    expect(target.origin).toBe(new URL(res.url()).origin);
    expect(target.pathname.startsWith("/programs/")).toBe(true);
  });
});
