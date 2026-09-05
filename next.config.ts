import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/admin/submissions": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/waivers": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
