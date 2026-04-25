import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,

  // Keep pdfjs-dist external so Turbopack doesn't bundle it.
  // Bundling breaks the fake worker's dynamic import('./pdf.worker.mjs').
  serverExternalPackages: ["pdfjs-dist"],

  // Trace pdfjs worker files into standalone output for Vercel / Docker / VPS.
  // Without this, the fake worker's import('./pdf.worker.mjs') fails because
  // the file isn't included in the standalone node_modules.
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
    ],
  },

  // Security headers for all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://cdnjs.cloudflare.com https://bulksms.talksasa.com https://sandbox.safaricom.co.ke https://api.safaricom.co.ke;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
