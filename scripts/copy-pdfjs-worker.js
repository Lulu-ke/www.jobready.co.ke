#!/usr/bin/env node
/**
 * Post-build script: copy pdfjs-dist worker files into the standalone output.
 *
 * pdfjs-dist v5's fake worker dynamically imports "./pdf.worker.mjs", which
 * Next.js standalone can't trace. This script copies the worker file into
 * the standalone node_modules so it's available at runtime.
 *
 * Usage: node scripts/copy-pdfjs-worker.js
 */
const path = require('path');
const fs = require('fs');

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('[copy-pdfjs-worker] No standalone output found, skipping.');
  process.exit(0);
}

// Source: node_modules/pdfjs-dist/legacy/build/
const sourceDir = path.join(root, 'node_modules', 'pdfjs-dist', 'legacy', 'build');
// Target: .next/standalone/node_modules/pdfjs-dist/legacy/build/
const targetDir = path.join(standaloneDir, 'node_modules', 'pdfjs-dist', 'legacy', 'build');

const filesToCopy = ['pdf.worker.mjs', 'pdf.worker.min.mjs'];

let copied = 0;
for (const file of filesToCopy) {
  const src = path.join(sourceDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(src, dest);
    copied++;
    console.log(`[copy-pdfjs-worker] Copied ${file}`);
  } else {
    console.warn(`[copy-pdfjs-worker] Source not found: ${src}`);
  }
}

// Also copy standard_fonts directory (needed by pdfjs for font rendering)
const fontsSrc = path.join(root, 'node_modules', 'pdfjs-dist', 'standard_fonts');
const fontsDest = path.join(standaloneDir, 'node_modules', 'pdfjs-dist', 'standard_fonts');
if (fs.existsSync(fontsSrc)) {
  fs.mkdirSync(fontsDest, { recursive: true });
  fs.cpSync(fontsSrc, fontsDest, { recursive: true });
  console.log('[copy-pdfjs-worker] Copied standard_fonts/');
}

console.log(`[copy-pdfjs-worker] Done. Copied ${copied} worker file(s).`);
