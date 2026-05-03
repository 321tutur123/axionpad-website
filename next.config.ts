import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.125"],
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  },
  turbopack: {},
  async headers() {
    const base = [...securityHeaders];
    if (process.env.NODE_ENV === "production") {
      base.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: base }];
  },
  async rewrites() {
    // fallback: Next.js API routes are checked first; only unmatched paths are proxied
    return {
      fallback: [
        { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      ],
    };
  },
};

export default nextConfig;
