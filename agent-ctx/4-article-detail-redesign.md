# Task 4 - Article Detail Page Redesign

## Summary
Redesigned the article detail page from a single-column narrow layout (max-w-3xl) to a professional blog-style layout with sidebar, related articles, and ad slots.

## Files Modified

### 1. `/home/z/my-project/src/app/articles/[slug]/page.tsx`
- Updated params from `{ id: string }` to `{ slug: string }` to match the slug migration
- Changed database query to use `slug` instead of `id`
- Added fetch for **related articles** (up to 4 from same category, excluding current article)
- Passed `relatedArticles` as a new prop to `ArticleDetailClient`
- Preserved existing JSON-LD structured data

### 2. `/home/z/my-project/src/app/articles/[slug]/article-detail-client.tsx`
Complete rewrite with the following sections:

**Left Column (md:col-span-2):**
- Breadcrumb navigation: Home > Articles > Category > Title
- Article header card: category badge, h1 title, author/date/read time, save/share buttons
- Excerpt highlight in teal-tinted box
- Article content paragraphs with **inline AdSlot** after the 3rd paragraph
- Article footer card: category tags, author bio (avatar with initials + "View all articles" link), share strip (WhatsApp + Copy Link)
- "Read Next" section with up to 3 related article cards (grid layout with hover effects)

**Right Sidebar (md:col-span-1, space-y-6):**
- `AdSlot slot="sidebar-1"` at the top
- Table of Contents (auto-generated from paragraphs, shown only when >3 paragraphs)
- Related Articles sidebar (3 articles with number indicators and category/date)
- `AdSlot slot="sidebar-2"`
- Newsletter CTA card (teal gradient with subscribe link)
- CV Writing CTA card (purple-to-teal gradient with WhatsApp button)

**Technical Details:**
- Layout: `grid md:grid-cols-3 gap-8` within `max-w-7xl mx-auto`
- White rounded-xl cards with shadow-sm for each section
- Teal accent for links, badges, and highlights
- Purple accent for CTA elements
- All article links use `.slug` for navigation
- Responsive design: stacks on mobile, 2/3 + 1/3 on desktop
- Share functionality uses Web Share API with clipboard fallback
- Author initials extracted for avatar circles

## Lint Results
All lint errors are pre-existing in `live-site-ref/` directory. No errors in the new/modified files.
