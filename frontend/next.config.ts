import type { NextConfig } from "next";

// Internal URL of the ASP.NET Core API, reachable from the Next.js server (never exposed to browsers).
// Rewrites are compiled at build time, so this must be set when running `next build`.
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:5080";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // Because proxy.ts exists, Next.js buffers request bodies — including proxied photo uploads — up to this
    // size (default 10 MB) and forwards a truncated body beyond it. Keep it above Media:MaxUploadBytes (20 MB).
    proxyClientMaxBodySize: "25mb",
  },
  poweredByHeader: false,
  // Self-contained server bundle for the container image (see frontend/Dockerfile).
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Optimises the site's own static images (hero, showroom, logos) into screen-sized WebP.
    // Uploaded fabric photos are already resized by the API and are rendered with plain <img srcset>.
    localPatterns: [
      { pathname: "/assets/**", search: "" },
      { pathname: "/logo*", search: "" },
    ],
    remotePatterns: [],
    formats: ["image/webp"],
    qualities: [75],
    minimumCacheTTL: 2678400, // 31 days; the cache is rebuilt on every deployment anyway
  },
  // The browser only ever talks to this origin; Next.js proxies API calls and uploaded photos to the
  // backend. This keeps the session cookie first-party (SameSite=Strict) and avoids CORS entirely.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_INTERNAL_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_INTERNAL_URL}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      // Next.js serves public/ files with max-age=0 (revalidated on every page view). Fonts never change in place
      // (new versions get new file names), so cache them for a year; logos and placeholders for a day.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      {
        source: "/:file(logo.*|logo-.*|favicon.ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/:dir(assets|demo)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
