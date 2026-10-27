import type { NextConfig } from "next";

const coreServiceUrl = process.env.CORE_SERVICE_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${coreServiceUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
