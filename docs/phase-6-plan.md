# Phase 6: Missing Pages & Filtered Views

**Project**: JobReady Kenya — www.jobready.co.ke
**Date**: 2026-04-23
**Status**: IN PROGRESS

---

## Context

Phases 1–5 delivered: foundation, schema, 18 routes, hybrid modal+SEO architecture, UI redesign, Phase 5 features (updates, sitemap, feed, robots, employer marquee). This phase fills in all the missing pages users encounter when clicking header/footer links.

---

## Audit: Dead Links Currently in Navigation

### Header Nav
| Link | Current href | Status |
|------|-------------|--------|
| CV Services | `/cv-services` | **404** — needs page |
| Sign In | `#` | placeholder (Phase 8) |
| Create Account | `#` | placeholder (Phase 8) |

### Footer Links
| Link | Current href | Status |
|------|-------------|--------|
| About Us | `#` | **404** — needs page |
| Contact Us | `#` | **404** — needs page |
| Privacy Policy | `/privacy` | **404** — needs page |
| Terms of Service | `/terms` | **404** — needs page |
| Cookies | `#` | **404** — needs page |
| Disclaimer | `#` | **404** — needs page |
| Refunds | `#` | **404** — needs page |

### Footer Legal Bar
| Link | Current href | Status |
|------|-------------|--------|
| Privacy Policy | `/privacy` | **404** |
| Terms of Service | `/terms` | **404** |
| Cookies | `#` | **404** |
| Disclaimer | `#` | **404** |
| Refunds | `#` | **404** |

**Total dead links: 10 pages to build**

---

## Phase 6 Scope

### 6A: Shared Layout Components

#### InfoPageLayout
- Shared layout for About, Contact, CV Services
- Blue gradient hero section (consistent with live site `#1a56db` → `#1e3a8a`)
- Breadcrumb navigation (Home > Page Name)
- Max-width container, proper spacing
- Usage: `<InfoPageLayout title="..." subtitle="..." breadcrumbs={[...]}>`

#### LegalPageLayout
- Shared layout for all 6 legal pages
- Breadcrumb + "On This Page" sticky sidebar with table of contents
- Auto-generated from h2 headings
- Last updated date header
- Proper typography for legal text (larger text, relaxed line-height)
- Usage: `<LegalPageLayout title="..." lastUpdated="April 2026" sections={[...]}>`

### 6B: About Us Page (`/about`)

**Route**: `src/app/about/page.tsx`

Content sections (from live site reference):
1. **Hero**: "About JobReady.co.ke" + subtitle
2. **Our Mission**: 1 paragraph
3. **Who We Are**: 2-column (text + "Why JobReady?" card with 6 checkmarks)
4. **What We Do**: 3-column grid (Job Board, CV Writing, Career Resources)
5. **Our Impact**: 4 stats (10K+ jobs, 5K+ companies, 50K+ seekers, 92% success)
6. **Our Values**: 4-column (Trust, Accessibility, Speed, Quality)
7. **CTA**: "Ready to Find Your Next Opportunity?" + Browse Jobs + Get CV buttons

### 6C: Contact Us Page (`/contact`)

**Route**: `src/app/contact/page.tsx`

Content sections:
1. **Hero**: "Get in Touch" + subtitle
2. **Main Content** (2-column):
   - **Left**: Contact form (Name, Email, Subject dropdown, Message textarea, Submit)
   - **Right**: Contact info cards (Email, Phone, WhatsApp, Office, Office Hours)
3. Form submission: POST to `/api/contact` (new API route, just stores/logs for now)

### 6D: CV Services Page (`/cv-services`)

**Route**: `src/app/cv-services/page.tsx`

Content sections:
1. **Hero**: Badge "25,000+ Job Seekers Served", title, subtitle, WhatsApp + Get Started buttons, 3 stats
2. **Trust Badges**: 6 items (ATS-Optimized, Kenyan Experts, Fast Turnaround, Affordable, Free Revisions, WhatsApp)
3. **Services Grid**: 3 service cards with pricing:
   - Basic CV — KSh 500 (48hr, 1 revision)
   - Professional CV + Cover Letter — KSh 1,500 (24hr, 2 revisions)
   - Premium CV + Cover Letter + LinkedIn — KSh 3,000 (12hr, unlimited revisions)
4. **How It Works**: 4 steps
5. **Testimonials**: 3 cards
6. **FAQ**: 6 accordion items
7. **Bottom CTA**: "Ready to Land Your Dream Job?"

### 6E: Legal Pages (6 pages)

All use `LegalPageLayout` component.

| Page | Route | Sections |
|------|-------|----------|
| Privacy Policy | `/privacy` | 10 sections (Introduction, Info Collected, How Used, Sharing, Cookies, Data Retention, Rights, Security, Children, Changes, Contact) |
| Terms of Service | `/terms` | 14 sections (Acceptance, Description, Accounts, Content, Listings, CV Services, Payment, IP, Liability, Indemnification, Law, Dispute, Changes, Contact) |
| Cookie Policy | `/cookies` | 8 sections (What Are Cookies, Types, How Used, Managing, Third Party, Updates, Contact) |
| Disclaimer | `/disclaimer` | 6 sections (General, No Guarantee, Third Party, Professional Advice, Limitation, Changes) |
| Refund Policy | `/refunds` | 8 sections (Overview, CV Service Refunds, Eligibility, Process, Timeline, Exceptions, Partial Refunds, Contact) |
| Data Protection | `/data-protection` | 8 sections (ODPC Registration, Data Controller, Legal Basis, Rights, Retention, Breach, Contact) |

### 6F: Global Search Page (`/search`)

**Route**: `src/app/search/page.tsx`

Client-side page with tabbed search:
- **Search bar** at top (reads `?q=` from URL)
- **Tabs**: All, Jobs, Opportunities, Companies, Articles
- **Results**: Calls respective API endpoints with `search` param
- **Empty state**: "Try searching for 'software engineer' or 'scholarship'"
- **No results state**: Appropriate message per tab

### 6G: Custom 404 & Error Pages

- `src/app/not-found.tsx` — Custom 404 with search bar + popular links
- `src/app/error.tsx` — Custom error boundary with retry button

### 6H: Update Navigation Links

After all pages are built:
- **Footer**: Update About Us `#` → `/about`, Contact `#` → `/contact`, all legal `#` → real routes
- **Footer legal bar**: Update Cookies, Disclaimer, Refunds to real routes
- **Sitemap**: Add all new pages to dynamic sitemap

---

## New Files Summary

| File | Type |
|------|------|
| `src/components/info-page-layout.tsx` | Shared layout |
| `src/components/legal-page-layout.tsx` | Shared layout |
| `src/app/about/page.tsx` | Page |
| `src/app/contact/page.tsx` | Page |
| `src/app/contact/api/route.ts` | API |
| `src/app/cv-services/page.tsx` | Page |
| `src/app/privacy/page.tsx` | Page |
| `src/app/terms/page.tsx` | Page |
| `src/app/cookies/page.tsx` | Page |
| `src/app/disclaimer/page.tsx` | Page |
| `src/app/refunds/page.tsx` | Page |
| `src/app/data-protection/page.tsx` | Page |
| `src/app/search/page.tsx` | Page |
| `src/app/not-found.tsx` | 404 page |
| `src/app/error.tsx` | Error boundary |

## Modified Files

| File | Changes |
|------|---------|
| `src/components/footer.tsx` | Update all `#` links to real pages |
| `src/app/sitemap.xml/route.ts` | Add new static pages |

---

## Out of Scope (Future Phases)

- `/jobs/internships`, `/jobs/government`, `/jobs/remote` — clean URL filtered views (current `?type=` params work)
- `/opportunities/scholarships`, etc. — same reason
- Sign In / Create Account — Phase 8 (auth)
- Employer dashboard — Phase 9
- Jobseeker dashboard — Phase 10
