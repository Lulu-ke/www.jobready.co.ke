import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Don't bundle pdfjs-dist — let it resolve from node_modules at runtime.
  // This preserves the internal relative imports (e.g., fake worker's
  // import("./pdf.worker.mjs")) that would break if bundled by Turbopack.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
