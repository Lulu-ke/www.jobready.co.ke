# Phase 5: Features, UX Polish & SEO Infrastructure

**Project**: JobReady Kenya — www.jobready.co.ke
**Date**: 2026-04-23
**Status**: IN PROGRESS

---

## Context

Phases 1-4 delivered: foundation, MySQL migration, 18 routes, hybrid modal+SEO architecture, UI redesign matching the live site. This phase focuses on feature additions, UX refinements, and SEO infrastructure based on user feedback and live site reference audit.

---

## Phase 5 Scope

### A. Homepage Enhancements

#### A1. Add Employer Marquee After Hero
- **Component**: `EmployerMarquee` already exists in `/src/components/employer-marquee.tsx`
- **Action**: Import and render it on the homepage between `Hero` and `DeadlineStrip`
- **Position**: Right after the Hero section, before the Deadline Strip
- **Expected**: Scrolling carousel of employer logos (Safaricom, Equity Bank, KCB, KRA, UNDP, Kenya Power, NCBA)

#### A2. Add Job Updates Section (NEW)
- **What**: A new content type — recruitment announcements (shortlisted candidates, interview schedules, verification notices, public participation calls)
- **Homepage section**: Vertical card list of latest updates (4-5 items)
- **Position**: Below DeadlineStrip, above Featured Jobs
- **Styling**: Distinct cards with source badge (e.g., "ODPP", "National Research Fund"), date, title, excerpt, "Read More" link

#### A3. Restore Side-Sheet Modals on Homepage
- **Problem**: Homepage currently links job/opportunity/article cards directly to full detail pages
- **Fix**: Add `useSearchParams` + sheet open/close logic to homepage, same pattern as `/jobs`, `/opportunities`, `/articles`
- **Job cards**: Open `JobDetailSheet` with `?view=JOB_ID` URL state
- **Opportunity cards**: Open `OpportunityDetailSheet` with `?view=OPP_ID` URL state
- **Article cards**: Open `ArticleDetailSheet` with `?view=ARTICLE_ID` URL state
- **Each sheet**: Include "View Full Page" link to `/jobs/[id]`, `/opportunities/[id]`, `/articles/[id]`
- **Also applies to**: All homepage sub-sections (Featured Jobs, Latest Jobs, Trending, Gov Vacancies, Entry Level, Internships, Opportunities, Uni/CV/Bursaries, Career Blog)

#### A4. Merge Job Requirements into Description
- **Problem**: Separate "Requirements" section is redundant — most job boards use a single description
- **Fix**: On the frontend job detail page, combine `description` + `requirements` into one seamless "Job Description" block
- **DB**: Keep `requirements` column (don't break existing data)
- **Display**: Concatenate with a natural transition, no hard "## Requirements" heading
- **Applies to**: `/jobs/[id]/job-detail-client.tsx` AND `job-detail-sheet.tsx`

---

### B. Side-Sheet Modal UX Improvements

#### B1. Fix Modal Close Fallback Behavior
- **Problem**: When a user navigates to `/jobs/[id]` (detail page), then opens a related job in the sheet modal, closing the modal should fall back to the original job detail page — not somewhere random
- **Fix**: Audit `router.back()` behavior in all sheets. When closing:
  - If arrived via `?view=` param change → pop URL param (stay on listing page)
  - If arrived from detail page → return to that detail page
  - Ensure browser back button also works correctly

#### B2. Add Side-Sheet to Employers Page
- **Problem**: `/employers` page has no clickable cards, no detail view
- **Fix**: Create `EmployerDetailSheet` component
- **Behavior**: Click employer card → open side sheet with employer profile (company info, logo, description, org type, listed jobs)
- **URL state**: `?view=EMPLOYER_ID`
- **Future**: Link to dedicated `/employers/[id]` page

---

### C. Dynamic SEO Infrastructure

#### C1. Dynamic sitemap.xml
- **Route**: `/app/sitemap.xml/route.ts`
- **Content**: Fetch ALL active entities from DB via Prisma (no cache)
  - All active jobs → `<url>` with `lastmod` = `updatedAt`, `priority` 0.8
  - All active opportunities → `priority` 0.7
  - All published articles → `priority` 0.6
  - Static pages (homepage, /jobs, /opportunities, /employers, /articles, /updates) → `priority` 0.9
- **Headers**: `Content-Type: application/xml`, proper XML declaration
- **Change frequency**: Jobs = daily, Opportunities = weekly, Articles = weekly, Static = monthly

#### C2. Dynamic feed.xml (RSS)
- **Route**: `/app/feed.xml/route.ts`
- **Content**: RSS 2.0 feed with latest 20 jobs + 10 articles from DB
- **Channel info**: Title = "JobReady Kenya", Description, Link, Language = "en-ke"
- **Job items**: Title, link (`/jobs/[id]`), description (excerpt), pubDate (`postedAt`), category
- **Article items**: Title, link (`/articles/[id]`), description (excerpt), pubDate (`createdAt`), category
- **Headers**: `Content-Type: application/rss+xml; charset=utf-8`

#### C3. Dynamic robots.txt
- **Route**: `/app/robots.txt/route.ts`
- **Content**: Allow all crawlers on public pages, disallow `/api/`, `/dashboard/`, `/admin/`
- **Sitemap**: Include link to `/sitemap.xml`

---

### D. Links & Routes Cleanup

#### D1. Fix Navigation Links
- **Header nav**: Ensure Jobs, Opportunities, Companies, Career Advice, CV Services all point to real pages
- **Top bar links**: Internships → `/jobs?type=Internship`, Govt Jobs → `/jobs?category=government`, Remote → `/jobs?isRemote=true`, Scholarships → `/opportunities?type=scholarship`
- **Footer links**: All legal pages, company pages, and resource links should point to real pages or proper `#` anchors
- **Hero search**: Connect to `/jobs?search=` query parameter

#### D2. Route Alignment Notes
- Keep `/employers` for now (rename to `/organizations` in a future phase — requires DB model changes)
- Keep `/articles` for now (rename to `/career-advice` in a future phase)
- Job detail uses `/jobs/[id]` (live site uses slug — slug migration is a future phase)

---

### E. New Page: /updates (Job Updates)

#### E1. Updates Listing Page
- **Route**: `/app/updates/page.tsx`
- **Layout**: Similar to articles listing — hero banner + vertical card grid
- **Filters**: Type tabs (All, Shortlisted, Interview Schedule, Closing Extended, Corrigendum, General)
- **Cards**: Title, source badge, date, excerpt, "Read More" / external link
- **Side-sheet**: Click card → open `JobUpdateDetailSheet`

#### E2. Update Detail Page (SEO)
- **Route**: `/app/updates/[id]/page.tsx`
- **Server component** with `generateMetadata()` for SEO
- **Content**: Full update title, source, date, full content, source URL link
- **JSON-LD**: Could use `Article` or `WebPage` schema

#### E3. Job Updates API
- **Route**: `/app/api/updates/route.ts`
- **GET**: List updates with filters (type, search, pagination)
- **POST**: Create update (admin only — future)
- **GET /api/updates/[id]**: Single update detail

---

### F. Database Changes

#### F1. New Model: JobUpdate
```prisma
model JobUpdate {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  content     String        @db.Text
  sourceUrl   String?       @db.Text
  sourceName  String        @default("Unknown")
  type        UpdateType    @default(GENERAL)
  isPublished Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum UpdateType {
  SHORTLISTED
  INTERVIEW_SCHEDULE
  CLOSING_EXTENDED
  CORRIGENDUM
  GENERAL
}
```

---

## Out of Scope (Next Phases)

The following are documented here for clarity but will be tackled in future phases:

### Phase 6: Missing Pages & Filtered Views
- `/search` — Global search page with tabs (All, Jobs, Opportunities, Companies, Articles)
- `/cv-services` — CV writing services page (pricing, how it works, testimonials, FAQ)
- `/about` — About Us page
- `/contact` — Contact page with form
- Legal pages: `/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/refunds`, `/data-protection`
- Job filtered views: `/jobs/internships`, `/jobs/government`, `/jobs/remote`, `/jobs/entry-level`, `/jobs/[category-slug]`
- Opportunity filtered views: `/opportunities/scholarships`, `/opportunities/bursaries`, `/opportunities/grants`, etc.
- Organization sub-routes: `/organizations/ngos`, `/organizations/startups`, etc.
- Custom 404 and error pages

### Phase 7: SEO & Performance Overhaul
- Convert homepage from `'use client'` to server component with `generateMetadata()`
- Add `generateMetadata()` to ALL pages
- Add JSON-LD structured data (JobPosting on job pages, Article on blog, Organization on employer pages, BreadcrumbList)
- ISR (Incremental Static Regeneration) on listing pages
- Loading skeletons for all pages
- Centralized `site-config.ts` (brand, WhatsApp number, social links, legal links)
- OG images (auto-generated per page)
- Canonical URLs

### Phase 8: Authentication & User Accounts
- NextAuth.js setup (email/password + Google OAuth)
- Login, Register, Forgot Password, Email/Phone Verification pages
- User profile management
- Saved jobs (persisted, not just localStorage)
- Job application tracking
- Job alerts (email notifications)

### Phase 9: Employer Dashboard
- Employer registration and company profile management
- Job posting form (with rich text editor)
- Application management (view, shortlist, reject)
- Sponsored job listings
- M-Pesa payment integration for premium features

### Phase 10: Jobseeker Dashboard
- Profile builder (skills, experience, education)
- CV upload and management
- Saved jobs across sessions
- Application history and tracking
- Job alert management
- Recommended jobs based on profile

### Phase 11: Data & Schema Migration
- Migrate from `Employer` to `Company` model (30 fields vs current 13)
- Add slug-based routing for jobs, opportunities, articles (replace ID-based routes)
- Add `BlogArticle` with Author/Category foreign keys
- Expand `OpportunityType` enum (from 6 to 23 types)
- Add `SitePage` model for CMS-driven legal/info pages
- Add `ServiceTier`, `Order`, `OrderItem` models for CV services
- Add `JobAlert`, `Notification`, `ArticleReaction` models
- Route rename: `/employers` → `/organizations`, `/articles` → `/career-advice`

### Phase 12: Monetization & Compliance
- M-Pesa STK Push integration (Daraja API)
- CV service orders and payments
- Sponsored job listing packages
- Google AdSense integration (consent-gated)
- Google Analytics (consent-gated)
- Cookie Consent banner (ODPC/GDPR compliant)
- Data Protection Act compliance features

---

## Phase 5 File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` (update) | Add `JobUpdate` model + `UpdateType` enum |
| `src/app/api/updates/route.ts` | Updates listing API |
| `src/app/api/updates/[id]/route.ts` | Update detail API |
| `src/app/updates/page.tsx` | Updates listing page |
| `src/app/updates/[id]/page.tsx` | Update detail SEO page |
| `src/app/updates/[id]/update-detail-client.tsx` | Update detail client component |
| `src/app/sitemap.xml/route.ts` | Dynamic XML sitemap |
| `src/app/feed.xml/route.ts` | Dynamic RSS feed |
| `src/app/robots.txt/route.ts` | Dynamic robots.txt |
| `src/components/job-updates-section.tsx` | Homepage updates vertical card section |
| `src/components/job-update-detail-sheet.tsx` | Side-sheet for update details |
| `src/components/employer-detail-sheet.tsx` | Side-sheet for employer details |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/page.tsx` | Add EmployerMarquee, JobUpdates section, restore side-sheets |
| `src/app/jobs/[id]/job-detail-client.tsx` | Merge requirements into description |
| `src/app/jobs/page.tsx` | Fix modal close fallback behavior |
| `src/app/opportunities/page.tsx` | Verify modal close behavior |
| `src/app/articles/page.tsx` | Verify modal close behavior |
| `src/app/employers/page.tsx` | Add side-sheet for employer details |
| `src/components/header.tsx` | Fix navigation links |
| `src/components/footer.tsx` | Fix footer links |
| `prisma/seed.ts` | Add job updates seed data |

---

## Execution Order

1. Add `JobUpdate` model to Prisma schema + push to DB
2. Create `/api/updates` routes (list + detail)
3. Create `job-updates-section.tsx` component
4. Create `job-update-detail-sheet.tsx` component
5. Create `/updates` listing page + detail page
6. Seed sample job updates
7. Update homepage: add EmployerMarquee + JobUpdates section + restore side-sheets
8. Merge requirements into description on job detail pages
9. Fix modal close fallback behavior across all sheets
10. Add EmployerDetailSheet to `/employers` page
11. Fix navigation links (header + footer)
12. Create `sitemap.xml/route.ts`, `feed.xml/route.ts`, `robots.txt/route.ts`
13. Test everything
14. Commit and push
