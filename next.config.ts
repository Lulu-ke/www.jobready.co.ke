import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Ensure pdfjs-dist stays external in both webpack and Turbopack builds
  serverExternalPackages: ["pdfjs-dist"],

  // Force Next.js to include pdfjs-dist worker files in standalone output
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
    ],
  },
};

export default nextConfig;
