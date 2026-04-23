---
Task ID: 3-2
Agent: Main Agent
Task: Batch 3 — Website Polish & Route Renames for JobReady Kenya

Work Log:
- Renamed `/employers` → `/companies` directory (src/app/employers → src/app/companies)
- Renamed `/articles` → `/career-advice` directory (src/app/articles → src/app/career-advice)
- Updated all `/articles` → `/career-advice` references in 12 files:
  1. src/app/career-advice/layout.tsx — canonical + OG URLs
  2. src/app/career-advice/[slug]/page.tsx — canonical + breadcrumb JSON-LD URLs
  3. src/app/career-advice/[slug]/article-detail-client.tsx — breadcrumbs, back links, related links, author links, category links, newsletter links
  4. src/app/not-found.tsx — Career Advice link
  5. src/app/error.tsx — Career Advice link
  6. src/app/search/page.tsx — article result links (4 occurrences)
  7. src/app/feed.xml/route.ts — RSS feed article URLs
  8. src/app/sitemap.xml/route.ts — static + article page URLs
  9. src/components/header.tsx — navLinks, topBarLinks, top bar link (3 occurrences)
  10. src/components/footer.tsx — Career Advice + Employers footer links
  11. src/components/career-blog-newsletter.tsx — article links + "View all" link
  12. src/components/article-detail-sheet.tsx — View Full Page link
  13. src/app/jobs/[slug]/job-detail-client.tsx — Career Advice sidebar links (4 occurrences)
- Updated all `/employers` → `/companies` references in 8 files:
  1. src/app/companies/layout.tsx — canonical + OG URLs
  2. src/app/companies/[slug]/page.tsx — canonical, OG, breadcrumb JSON-LD, Organization JSON-LD URLs
  3. src/app/companies/[slug]/employer-detail-client.tsx — breadcrumb + "View All Companies" link
  4. src/app/opportunities/[slug]/opportunity-detail-client.tsx — provider link
  5. src/app/search/page.tsx — company result links (2 occurrences)
  6. src/app/sitemap.xml/route.ts — static + employer page URLs
  7. src/components/header.tsx — navLinks
  8. src/components/footer.tsx — Companies footer link
  9. src/app/jobs/[slug]/job-detail-client.tsx — employer sidebar link
- Updated middleware.ts:
  - Added 301 redirects for old `/articles` → `/career-advice` and `/employers` → `/companies` routes
  - Updated ROUTE_MODELS basePath for articles and employers
  - Updated CUID redirect regex and matcher config for new route paths
- Created Cookie Consent Banner component (src/components/cookie-consent.tsx):
  - Delayed banner appearance (1s timeout)
  - Accept All / Reject Non-Essential / Customize options
  - Expandable settings panel with Analytics and Advertising toggles
  - localStorage persistence via jobready_cookie_consent key
  - Positioned above mobile nav (bottom-16 on mobile, bottom-0 on desktop)
- Created Back to Top Button component (src/components/back-to-top.tsx):
  - Appears after 400px scroll with smooth animation
  - Smooth scroll to top on click
  - Fixed positioning above mobile nav on mobile
  - Teal-600 themed with hover effects
- Updated src/app/layout.tsx:
  - Added CookieConsent and BackToTop imports
  - Added both components before Toaster in body
- Updated employer label changes (TASK 6):
  - "View All Employers" → "View All Companies"
  - Breadcrumb text "Employers" → "Companies"
- API routes (`/api/articles`, `/api/employers`) were NOT modified per requirements
- Build verified: ✓ Compiled successfully with zero errors, all 223+ pages generated

Stage Summary:
- Complete route rename: `/employers` → `/companies`, `/articles` → `/career-advice`
- All internal links updated across 15+ files (no old URLs remain in frontend)
- 301 redirects in middleware for backward compatibility
- SEO metadata (canonical, OG, JSON-LD) updated on all affected pages
- Sitemap and RSS feed updated with new URLs
- Cookie Consent Banner with customize/save preferences
- Back to Top button with scroll-triggered visibility
- Build passes with zero errors
