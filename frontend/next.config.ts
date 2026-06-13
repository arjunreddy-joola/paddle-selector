import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In production (Vercel) BACKEND_URL is not set — Vercel's own routing
    // sends /api/* directly to the Python serverless function. The proxy is
    // only needed for local development; set BACKEND_URL=http://localhost:4000
    // in frontend/.env.local to enable it.
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
