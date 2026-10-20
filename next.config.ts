import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? "http://192.168.110.29:8080/api";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://localhost:3000", "192.168.111.184"],

  async redirects() {
    return [
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
      { source: '/Payment/Success', destination: '/payment/success', permanent: true },
      { source: '/Payment/Failed', destination: '/payment/failed', permanent: true },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${apiProxyTarget.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;