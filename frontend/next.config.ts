import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  reactCompiler: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow these form pages to be embedded on urbancruise.in
  async headers() {
    return [
      {
        source: "/gac-form",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://urbancruise.in https://www.urbancruise.in;",
          },
        ],
      },
      {
        source: "/rate-quotation-form",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://urbancruise.in https://www.urbancruise.in;",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
