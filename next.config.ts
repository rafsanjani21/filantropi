/**
 * next.config.ts
 *
 * Fungsi   : Konfigurasi Next.js untuk allowedDevOrigins, images, redirect legacy, dan rewrite proxy API lokal.
 * Ekspor   : default nextConfig
 * Dipakai  : Dijalankan otomatis oleh Next.js saat dev/build/start
 * Catatan  : env API/gambar wajib diisi; remotePatterns dari NEXT_PUBLIC_IMAGE_BASE_URL; rewrite /api-proxy opsional via API_PROXY_TARGET.
 */
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} wajib diisi (lihat .env.example).`);
  }
  return value;
}

function isPrivateHostname(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

requireEnv("NEXT_PUBLIC_API_BASE_URL");

const imageBaseUrlValue = requireEnv("NEXT_PUBLIC_IMAGE_BASE_URL");
let imageBaseUrl: URL;
try {
  imageBaseUrl = new URL(imageBaseUrlValue);
} catch {
  throw new Error("NEXT_PUBLIC_IMAGE_BASE_URL bukan URL yang valid.");
}

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const devAllowedOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(isDev && devAllowedOrigins.length > 0
    ? { allowedDevOrigins: devAllowedOrigins }
    : {}),

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/profile/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/payment/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/programs/manage/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },

  images: {
    dangerouslyAllowLocalIP: isPrivateHostname(imageBaseUrl.hostname),
    remotePatterns: [
      {
        protocol: imageBaseUrl.protocol === "https:" ? "https" : "http",
        hostname: imageBaseUrl.hostname,
        port: imageBaseUrl.port || undefined,
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
  },

  async redirects() {
    return [
      // Legacy query-based routes (sebelumnya ditangani app/(legacy)/QueryRedirect).
      // Aturan dengan `has` didahulukan agar nilai query dipetakan ke path baru.
      {
        source: '/DetailPage',
        has: [{ type: 'query', key: 'slug', value: '(?<slug>.+)' }],
        destination: '/programs/:slug',
        permanent: true,
      },
      { source: '/DetailPage', destination: '/programs', permanent: true },
      {
        source: '/DetailPage/FormDonasiPage',
        has: [{ type: 'query', key: 'slug', value: '(?<slug>.+)' }],
        destination: '/programs/:slug/donate',
        permanent: true,
      },
      { source: '/DetailPage/FormDonasiPage', destination: '/programs', permanent: true },
      {
        source: '/WakafDetailPage',
        has: [{ type: 'query', key: 'slug', value: '(?<slug>.+)' }],
        destination: '/wakaf/:slug',
        permanent: true,
      },
      { source: '/WakafDetailPage', destination: '/programs?type=wakaf', permanent: true },
      {
        source: '/WakafDetailPage/FormWakafPage',
        has: [{ type: 'query', key: 'slug', value: '(?<slug>.+)' }],
        destination: '/wakaf/:slug/donate',
        permanent: true,
      },
      { source: '/WakafDetailPage/FormWakafPage', destination: '/programs?type=wakaf', permanent: true },
      {
        source: '/ProgressPage',
        has: [{ type: 'query', key: 'id', value: '(?<id>.+)' }],
        destination: '/progress/:id',
        permanent: true,
      },
      { source: '/ProgressPage', destination: '/programs/manage', permanent: true },
      {
        source: '/ProgramPage/EditProgram',
        has: [{ type: 'query', key: 'id', value: '(?<id>.+)' }],
        destination: '/programs/manage/:id/edit',
        permanent: true,
      },
      { source: '/ProgramPage/EditProgram', destination: '/programs/manage', permanent: true },

      { source: '/HomePage', destination: '/', permanent: true },
      { source: '/AllProgramsPage', destination: '/programs', permanent: true },
      { source: '/BeritaPage', destination: '/berita', permanent: true },
      { source: '/GalangPage', destination: '/programs/new', permanent: true },
      { source: '/ProgramPage', destination: '/programs/manage', permanent: true },
      { source: '/LoginPage', destination: '/login', permanent: true },
      { source: '/ProfilePage', destination: '/profile', permanent: true },
      { source: '/ProfilePage/UserPage', destination: '/profile/user', permanent: true },
      { source: '/ProfilePage/PagePenerima', destination: '/profile/beneficiary', permanent: true },
      { source: '/ProfilePage/PagePenerima/Tipe', destination: '/profile/beneficiary/type', permanent: true },
      { source: '/ProfilePage/HistoryWakafPage', destination: '/profile/history', permanent: true },
      { source: '/ProfilePage/PusatBantuan', destination: '/profile/help', permanent: true },
      { source: '/ProfilePage/SyaratKetentuan', destination: '/profile/terms', permanent: true },
      { source: '/CreatorProfile/:id', destination: '/creator/:id', permanent: true },
    ];
  },

  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;