import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://localhost:3000", "192.168.52.211"],

  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://192.168.110.29:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;