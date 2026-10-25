/**
 * proxy.ts
 *
 * Fungsi   : Membuat nonce per request dan memasang header Content-Security-Policy untuk dokumen HTML.
 * Ekspor   : proxy, config
 * Dipakai  : Dijalankan otomatis oleh Next.js sebelum route dirender
 * Catatan  : Halaman wajib dynamic rendering agar Next.js dapat menyisipkan nonce (lihat app/layout.tsx).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDev = process.env.NODE_ENV === "development";

function toOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function toHttpsOrigin(host: string | undefined) {
  if (!host) return null;
  return toOrigin(host.includes("://") ? host : `https://${host}`);
}

const apiOrigin = toOrigin(process.env.NEXT_PUBLIC_API_BASE_URL);
const imageOrigin = toOrigin(process.env.NEXT_PUBLIC_IMAGE_BASE_URL);
const firebaseAuthOrigin = toHttpsOrigin(
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
);

const imageSources = [
  "'self'",
  "data:",
  "blob:",
  imageOrigin,
  "https://upload.wikimedia.org",
  "https://lh3.googleusercontent.com",
].filter((source): source is string => Boolean(source));

const connectSources = [
  "'self'",
  apiOrigin,
  firebaseAuthOrigin,
  "https://www.emsifa.com",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
].filter((source): source is string => Boolean(source));

const frameSources = [
  "'self'",
  firebaseAuthOrigin,
  "https://accounts.google.com",
].filter((source): source is string => Boolean(source));

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}${isDev ? " http: ws:" : ""}`,
    `frame-src ${frameSources.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
