import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Keep pdfjs-dist as an external package in standalone mode.
  // This ensures node_modules/pdfjs-dist is included and the fake worker's
  // relative import("./pdf.worker.mjs") resolves correctly.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
