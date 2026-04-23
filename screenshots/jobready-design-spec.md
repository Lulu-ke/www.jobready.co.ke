# JobReady.co.ke — Complete Design Specification

> Extracted from live site analysis on April 2025. Site built with **Next.js (App Router) + Tailwind CSS**. Uses React Server Components.

---

## 1. COLOR PALETTE

### Primary Colors
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Purple-600** | `#5B21B6` | `rgb(91, 33, 182)` | Primary brand color. Top bar border, logo bg, nav CTA button bg, h3 section headings, inline purple accent text |
| **Purple-700** | `#4a1a94` | `rgb(74, 26, 148)` | Hover state for purple-600 buttons |
| **Purple-50** | `#faf5ff` | — | Gradient backgrounds (from-purple-50) |
| **Purple-100** | `#f3e8ff` | — | Icon bg circles, CV review card accents |

### Secondary / Accent Colors
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Teal-600** | `#0D9488` | `rgb(13, 148, 136)` | Secondary accent. Navigation links (hover), popular search links, "View all" links, top bar text links, category card icons on homepage (some), opportunity card icon accents |
| **Teal-700** | `#0f766e` | — | Hover state for teal-600 elements |
| **Teal-500** | `#14b8a6` | — | Focus ring color on inputs (`focus:ring-teal-500`) |

### Action / CTA Colors
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Orange-500** | `#F97316` | `rgb(249, 115, 22)` | Hero "Search Jobs" button background (inline style) |
| **Blue-600** | `#1a56db` | `rgb(26, 86, 219)` | Footer logo square fill, loading spinner accent, some secondary buttons |
| **Blue-700** | `#1e40af` | — | Gradient endpoint (`from-[#1a56db] to-[#1e40af]`) used on some banner sections |
| **Green-500** | `#22c55e` | `rgb(34, 197, 94)` | WhatsApp floating button background |
| **Green-600** | `#16a34a` | `rgb(22, 163, 74)` | WhatsApp navbar button background |

### Neutral / Gray Scale
| Token | Hex | Usage |
|-------|-----|-------|
| **Gray-50** | `#F9FAFB` | Body background (`bg-gray-50`), navbar bg `#FAFAFA` |
| **Gray-100** | `#F3F4F6` | Top announcement bar bg, input placeholder bg |
| **Gray-200** | `#E5E7EB` | Borders, separators, skeleton placeholders |
| **Gray-300** | `#D1D5DB` | Input borders, divider lines |
| **Gray-400** | `#9CA3AF` | Secondary text, muted labels, placeholder text |
| **Gray-500** | `#6B7280` | Body text secondary, descriptions, footer text |
| **Gray-600** | `#4B5563` | Hero description text, section paragraph text |
| **Gray-800** | `#1E293B` | Primary headings, nav link text |
| **Gray-900** | `#111827` | Footer background (`bg-gray-900`) |

### Gradients Used
- **Hero section**: `bg-gradient-to-br from-white to-gray-50` (white → very light gray)
- **CV promo card**: `bg-gradient-to-r from-purple-50 to-teal-50` (soft purple → soft teal)
- **CV review card**: `bg-gradient-to-br from-purple-50 to-teal-50`
- **Blue banner (not currently visible on homepage)**: `bg-gradient-to-r from-[#1a56db] to-[#1e40af]`

---

## 2. TYPOGRAPHY

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
/* Tailwind default: font-sans */
```
Body class: `font-sans text-gray-800 bg-gray-50 antialiased`

### Font Sizes & Weights

| Element | Tailwind Classes | Computed Size | Weight | Color |
|---------|-----------------|---------------|--------|-------|
| **Body** | `text-gray-800` | 16px | 400 | `#1E293B` (gray-800) |
| **Hero H1** | `text-2xl md:text-4xl font-bold mb-4` | 24px / 36px | 700 (bold) | `rgb(30, 41, 59)` #1E293B |
| **Hero H1 accent word** | inline `style="color: rgb(91, 33, 182)"` | 24px / 36px | 700 | `#5B21B6` (purple-600) |
| **Hero description** | `text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6` | 18px / 20px | 400 | gray-600 |
| **Section H2** | `text-xl md:text-2xl font-bold mb-5` or `mb-4` | 20px / 24px | 700 | `rgb(30, 41, 59)` inline |
| **Section H3 (purple)** | `text-lg font-semibold mb-3` | 18px | 600 | `rgb(91, 33, 182)` inline |
| **Section H3 (dark)** | `font-bold text-lg mt-1` | 18px | 700 | `rgb(30, 41, 59)` inline |
| **Card title** | `font-bold text-xl mt-2` | 20px | 700 | `rgb(30, 41, 59)` inline |
| **Card text** | `text-sm text-gray-600 my-2` | 14px | 400 | gray-600 |
| **Category card label** | `text-sm font-medium mt-2` | 14px | 500 | `rgb(30, 41, 59)` inline |
| **"View all" link** | `text-sm font-medium text-teal-600 hover:text-purple-700` | 14px | 500 | teal-600 |
| **Top bar text** | `text-xs` | 12px | 400 | gray-800 |
| **Nav links** | default (no class specified) | 16px (inherit) | 400 | `#1E293B` |
| **Nav link hover** | `hover:text-[#0D9488]` | — | — | teal-600 |
| **Search input** | `text-sm` | 14px | 400 | gray-800 |
| **Button text** | `text-sm font-semibold` | 14px | 600 | white |
| **Footer heading** | `text-white text-[0.92rem] font-semibold mb-3.5` | ~14.7px | 600 | white |
| **Footer link** | `text-gray-400 text-[0.84rem] hover:text-white` | ~13.4px | 400 | gray-400 |
| **Footer brand** | `text-[1.3rem] font-extrabold text-white` | ~20.8px | 800 | white |
| **Footer desc** | `text-[0.87rem] leading-relaxed opacity-80` | ~13.9px | 400 | gray-300 |
| **Popular label** | `text-gray-500` | 14px | 400 | gray-500 |
| **Badge/Tag** | `text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full` | 12px | 400/600 | gray bg, gray-600 text |
| **Timestamp** | `text-xs text-gray-500 mt-0.5 leading-relaxed` | 12px | 400 | gray-500 |
| **Empty state** | `text-gray-400 text-sm` | 14px | 400 | gray-400 |

---

## 3. SPACING / PADDING PATTERNS

### Max Widths
- **Main container**: `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8`
- **Footer container**: `max-w-[1200px] mx-auto px-4 sm:px-6`
- **Hero search form**: `max-w-2xl mx-auto mb-4`

### Section Padding
- **Sections**: `py-8 md:py-12` (32px vertical on mobile, 48px on desktop)
- **Hero section**: `py-8 md:py-12`

### Content Gaps
- **Grid gaps**: `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`
- **Flex gaps**: `gap-2`, `gap-3`, `gap-4`, `space-x-4`, `space-x-5`
- **Space vertical**: `space-y-3`, `mb-2`, `mb-3`, `mb-4`, `mb-5`, `mt-2`, `mt-3`, `mt-4`

### Responsive Breakpoints
- `sm`: 640px — Search form switches to row, footer adjusts
- `md`: 768px — Category cards wider (`w-36`), grids activate, top bar shows, nav links show, H1 larger, sections more padding
- `lg`: 1024px — Footer goes 4-column, padding increases, search input wider (`lg:w-56`)

---

## 4. BORDER RADIUS VALUES

| Element | Radius | Tailwind Class |
|---------|--------|---------------|
| Search inputs | `3.35544e+07px` (effectively pill) | `rounded-full` |
| Buttons (Search, CTA, WhatsApp, Sign Up) | pill | `rounded-full` |
| Category cards | 16px | `rounded-xl` |
| Opportunity cards | 16px | `rounded-xl` |
| Job card skeleton | 16px | `rounded-xl` |
| Featured job placeholder | 16px | `rounded-xl` |
| CV promo card | 16px | `rounded-xl` |
| CV review card | 16px | `rounded-xl` |
| Logo circle | 50% (full) | `rounded-full` |
| Company avatar (skeleton) | 50% (full) | `rounded-full` |
| Scroll buttons (carousel) | 50% (full) | `rounded-full` |
| Cookie modal | 16px | `rounded-2xl` |
| Footer logo square | 8px | `rx="8"` (SVG) |
| Sponsored ad placeholder | 8px | `rounded-lg` |
| Badge tags | pill | `rounded-full` |

---

## 5. SHADOW STYLES

| Element | Shadow | Tailwind Class |
|---------|--------|---------------|
| **Header/Navbar** | `shadow-md` | `shadow-md` |
| **Category cards** | `0 1px 2px 0 rgba(0,0,0,0.05)` | `shadow-sm` |
| **Category cards hover** | slightly deeper | `hover:shadow-md` |
| **Opportunity cards** | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | `shadow-md` |
| **Opportunity cards hover** | deeper | `hover:shadow-lg` |
| **CV promo card** | `shadow-md` | `shadow-md` |
| **CV review card** | `shadow-md` | `shadow-md` |
| **Featured job placeholder** | `shadow-md` | `shadow-md` |
| **Job card skeleton** | `shadow-sm` | `shadow-sm` |
| **Cookie modal** | `shadow-2xl` | `shadow-2xl` |
| **WhatsApp float button** | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | `shadow-lg` |
| **WhatsApp float hover** | deeper | `hover:shadow-xl` |
| **Carousel scroll buttons** | `shadow-md` | `shadow-md` |

---

## 6. LAYOUT & BREAKPOINTS

### Desktop (≥768px / md)
- Max content width: **1280px**
- Header: sticky, full-width with `bg-[#FAFAFA]`, 2px purple bottom border
- Top bar: hidden on mobile, shown at md
- Navigation: horizontal link row
- Footer: 4-column grid `[1.5fr 1fr 1fr 1fr]`

### Mobile (<768px)
- Full-width stacking
- Top announcement bar: **hidden**
- Navigation links: **hidden** (hamburger menu button shown)
- Search bar in nav: **hidden**
- WhatsApp/sign-in/create-account in nav: **hidden**
- Category cards: `w-32` (128px)
- Hero H1: `text-2xl` (24px)
- All grids become single column
- Footer: single column

---

## 7. HOMEPAGE LAYOUT — SECTION BY SECTION

### 7.1 Top Announcement Bar
```
Container: hidden md:block text-xs border-b border-[#5B21B6] bg-[#F3F4F6]
Inner:     flex justify-between items-center py-1.5 px-4 md:px-6 lg:px-8 max-w-[1280px] mx-auto
Left side: flex items-center gap-3 whitespace-nowrap
  Links:   "Internships" | "Govt Jobs" | "Remote" | "Scholarships" | "CV Writing"
           Each: transition hover:text-[#5B21B6] text-[#0D9488]
           Separator: text-[#1E293B] "|"
           CV Writing: transition hover:text-[#5B21B6] text-[#0D9488] font-medium
Right side: flex items-center gap-4 whitespace-nowrap
  - WhatsApp link (icon + text)
  - Career Advice link
  - Our Services link
```
- Border bottom: **2px solid #5B21B6** (purple-600)
- Background: **#F3F4F6** (gray-100)
- Font size: **12px**
- Hidden on mobile (`hidden md:block`)

### 7.2 Sticky Navbar / Header
```
<header class="sticky top-0 z-50 shadow-md bg-[#FAFAFA] border-b-2 border-[#5B21B6]">
  <div class="flex items-center justify-between py-3 px-6 lg:px-8 max-w-[1280px] mx-auto">
```
**Logo:**
```
<a class="flex-shrink-0" href="/">
  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg bg-[#5B21B6]">
    JK
  </div>
</a>
```
- 40×40px circle
- Background: `#5B21B6`
- Text: white, bold, 18px (text-lg)

**Nav Links (desktop only):**
```
<nav class="hidden md:flex items-center space-x-6">
  Jobs | Opportunities | Companies | Career Advice | CV Services
  Each: transition text-[#1E293B] hover:text-[#0D9488]
</nav>
```
- Font: inherited (~16px), weight 400
- Color: `#1E293B` → hover: `#0D9488` (teal)
- Spacing: `space-x-6` (24px)

**Right side (desktop only):**
```
<div class="hidden md:flex items-center space-x-3">
  <!-- Search form -->
  <form action="/search" method="GET" class="relative">
    <input placeholder="Search jobs..."
           class="w-48 lg:w-56 pl-9 pr-3 py-1.5 rounded-full border border-gray-200 
                  text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 
                  focus:border-transparent text-gray-700 placeholder-gray-400"
           type="text" name="q">
  </form>
  
  <!-- WhatsApp button -->
  <a class="text-white px-3.5 py-1.5 rounded-full text-sm flex items-center gap-1.5 
            transition bg-[#10b981] hover:bg-[#059669]"
     href="https://wa.me/...">WhatsApp</a>
  
  <!-- Sign In -->
  <a class="text-sm font-medium text-[#5B21B6] hover:text-[#4a1a94] transition px-3 py-1.5"
     href="/login">Sign In</a>
  
  <!-- Create Account -->
  <a class="text-white px-4 py-1.5 rounded-full text-sm font-semibold transition 
            bg-[#5B21B6] hover:bg-[#4a1a94]"
     href="/register">Create Account</a>
</div>
```
- Search input: pill shape, 192px/224px wide, 6px vertical padding, 9px left padding (for icon), `border-gray-200`
- Focus ring: teal-500, 2px
- WhatsApp btn: green-500 bg, white text, pill, 14px gap with icon
- Sign In: purple text, no bg, 14px font, medium weight
- Create Account: purple bg, white text, pill, 600 weight

**Mobile hamburger:**
```
<button class="md:hidden text-gray-600 focus:outline-none" aria-label="Open menu">
  <svg class="w-7 h-7"> (hamburger icon) </svg>
</button>
```

### 7.3 Hero Section
```
<section class="bg-gradient-to-br from-white to-gray-50 py-8 md:py-12">
  <div class="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 text-center">
```
**Heading:**
```html
<h1 class="text-2xl md:text-4xl font-bold mb-4" style="color: rgb(30, 41, 59);">
  Find Your Next <span style="color: rgb(91, 33, 182);">Opportunity</span> in Kenya
</h1>
```
- "Opportunity" is highlighted in **purple-600** via inline style

**Description:**
```html
<p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
  Jobs, internships, scholarships, and government vacancies — all in one place.
</p>
```

**Search Form:**
```html
<form class="max-w-2xl mx-auto mb-4">
  <div class="flex flex-col sm:flex-row gap-2">
    <div class="relative flex-1">
      <!-- Search icon: absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 -->
      <input placeholder="Job title, keyword, or company..."
             class="w-full pl-11 pr-4 py-3 rounded-full border border-gray-300 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 
                    focus:border-transparent text-sm text-gray-800">
    </div>
    <button type="submit" 
            class="px-6 py-3 rounded-full font-semibold text-white transition-colors 
                   cursor-pointer whitespace-nowrap"
            style="background-color: rgb(249, 115, 22);">
      Search Jobs
    </button>
  </div>
</form>
```
- Input: full width, 44px left padding (icon), 16px right, 12px vertical, pill, `border-gray-300`
- Focus: teal ring
- Button: **orange-500** bg, white text, pill, `px-6 py-3` (24px/12px), 600 weight
- Stack vertically on mobile (`flex-col`), row on `sm:`

**Popular Searches:**
```html
<div class="flex flex-wrap justify-center gap-2 text-sm mb-5">
  <span class="text-gray-500">Popular:</span>
  <span class="flex items-center gap-2">
    <a class="text-teal-600 hover:text-purple-700 transition-colors">Internships</a>
  </span>
  <!-- • separator, Government Jobs, Remote, Nairobi -->
</div>
```

**Trust badge:**
```html
<div class="max-w-2xl mx-auto pt-3 border-t border-gray-200">
  <p class="text-sm text-gray-500 flex items-center justify-center gap-2">
    <!-- users icon: text-teal-600 w-4 h-4 -->
    Join 10,000+ job seekers getting hired faster with optimized CVs and real opportunities.
  </p>
</div>
```

### 7.4 Featured Jobs – Sponsored Section
```
<section class="py-8 md:py-12">
  <h2 class="text-xl md:text-2xl font-bold mb-5">Featured Jobs – Sponsored</h2>
  <div class="grid md:grid-cols-3 gap-6">
    <!-- Left (2 cols): Featured job cards -->
    <div class="md:col-span-2">
      <div class="grid md:grid-cols-2 gap-5">
        <!-- Main featured placeholder -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden h-64">
          <!-- "No featured jobs yet" -->
        </div>
        <!-- Side list placeholder -->
        <div class="space-y-3">
          <div class="bg-white rounded-xl shadow-md h-28">
            <!-- "More featured jobs coming soon" -->
          </div>
        </div>
      </div>
    </div>
    <!-- Right (1 col): CV promo card -->
    <div class="bg-gradient-to-r from-purple-50 to-teal-50 p-5 rounded-xl 
                border border-teal-200 text-center shadow-md h-full 
                flex flex-col justify-center">
      <!-- Document icon: w-8 h-8, color: purple-600 -->
      <h3 class="font-bold text-lg mt-1">📄 Land Your Dream Job Faster</h3>
      <p class="text-sm text-gray-600 my-2">
        ✅ Professional CV Writing (from KES 2,500)
        ✅ Cover Letter & Application Docs
        ✅ Career Coaching
      </p>
      <a class="inline-block w-full text-center bg-purple-600 hover:bg-purple-700 
                text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
         href="/cv-services">Get Started →</a>
    </div>
  </div>
</section>
```

### 7.5 Browse by Category Section
```
<section class="py-8 md:py-12">
  <h2 class="text-xl md:text-2xl font-bold mb-5">Browse by Category</h2>
  <div class="relative">
    <!-- Scroll left button -->
    <button class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 
                   bg-white rounded-full p-2 shadow-md hover:bg-gray-100 
                   transition-colors text-teal-600 hidden md:block cursor-pointer">
      <svg class="w-5 h-5">chevron-left</svg>
    </button>
    <!-- Scroll right button (mirror position) -->
    
    <!-- Scrollable container -->
    <div class="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar scroll-smooth">
      <!-- Category cards (26 total) -->
      <a class="flex-shrink-0 w-32 md:w-36 bg-white rounded-xl shadow-sm 
                p-4 text-center hover:shadow-md transition-shadow no-underline group"
         href="/jobs/technology">
        <svg class="w-8 h-8 mx-auto text-3xl" style="color: rgb(91, 33, 182); font-size: 1.75rem;">
          <!-- category icon -->
        </svg>
        <p class="text-sm font-medium mt-2" style="color: rgb(30, 41, 59);">Technology</p>
      </a>
      <!-- ... repeat for each category -->
    </div>
  </div>
  <!-- View all link -->
  <a class="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors 
            inline-flex items-center gap-1">
    View all 26 categories <svg class="w-3.5 h-3.5">arrow-right</svg>
  </a>
</section>
```

**Category card specs:**
- Width: 128px mobile / 144px desktop (`w-32 md:w-36`)
- Background: white
- Border radius: 16px (`rounded-xl`)
- Shadow: `shadow-sm`, hover: `shadow-md`
- Padding: 16px (`p-4`)
- Icon: 32×32px SVG, purple-600 color
- Label: 14px, medium weight, gray-800
- Spacing between cards: `space-x-4` (16px)
- Horizontal scroll with hidden scrollbar
- Carousel nav buttons: white circles, shadow, teal chevron, hidden on mobile

**Categories displayed:** Technology, Finance, Sales, Marketing, Human Resources, Engineering, Healthcare, Education, Operations, Supply Chain, Hospitality, Agriculture, Legal, Creative, Architecture, Science, Customer Service, Skilled Trades, Media, Nonprofit, Real Estate, Fitness, Government, Consulting, Insurance, Transport

### 7.6 Government Vacancies Section
```
<section class="py-8 md:py-12">
  <div class="grid md:grid-cols-3 gap-6 items-stretch">
    <!-- Sponsored ad placeholder (1 col) -->
    <div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg 
                flex flex-col items-center justify-center flex-1"
         style="min-height: 250px;">
      📢 Sponsored Ad / 300x250 (stretches)
    </div>
    
    <!-- Government vacancies (2 cols) -->
    <div class="md:col-span-2">
      <h2 class="text-xl md:text-2xl font-bold mb-4">Government Vacancies</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-semibold mb-3" style="color: rgb(91, 33, 182);">
            County Government
          </h3>
          <!-- job items / empty state -->
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-3" style="color: rgb(91, 33, 182);">
            National Government
          </h3>
        </div>
      </div>
    </div>
  </div>
</section>
```
- Sub-headings (H3) in **purple-600**
- 3-column grid with items-stretch
- Sponsored ad placeholder: dashed border, gray bg, rounded-lg

### 7.7 Entry Level / Internships Section
```
<section class="py-8 md:py-12">
  <div class="grid md:grid-cols-3 gap-6">
    <div> <!-- Entry Level Jobs -->
      <h2 class="text-xl md:text-2xl font-bold mb-4">Entry Level Jobs</h2>
      <!-- job items -->
      <a class="text-sm font-medium text-teal-600 hover:text-purple-700">View all →</a>
    </div>
    <div> <!-- Internship Opportunities -->
      <h2 class="text-xl md:text-2xl font-bold mb-4">Internship Opportunities</h2>
      <!-- job items -->
    </div>
    <!-- 3rd column: Jobs by Location -->
  </div>
</section>
```

### 7.8 Jobs by Location
```
<div class="flex flex-wrap gap-2 text-sm mb-5">
  <a class="text-teal-600 hover:text-purple-700 transition-colors">Nairobi</a>
  <a class="text-teal-600 hover:text-purple-700 transition-colors">Mombasa</a>
  <a class="text-teal-600 hover:text-purple-700 transition-colors">Kisumu</a>
  <a class="text-teal-600 hover:text-purple-700 transition-colors">Nakuru</a>
  <a class="text-teal-600 hover:text-purple-700 transition-colors">Eldoret</a>
  <a class="text-teal-600 hover:text-purple-700 transition-colors">Remote</a>
</div>
```
- Inline text links (no background/border)
- Teal-600 color, hover to purple-700

### 7.9 Opportunities Hub
```
<section class="py-8 md:py-12">
  <div class="flex items-center justify-between mb-5">
    <h2 class="text-xl md:text-2xl font-bold">Opportunities Hub</h2>
    <a class="text-sm font-medium text-teal-600 hover:text-purple-700">
      View all opportunities →
    </a>
  </div>
  <!-- Horizontal scroll carousel -->
  <div class="flex overflow-x-auto space-x-5 pb-4 hide-scrollbar scroll-smooth">
    <a class="flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-5 text-center 
              hover:shadow-lg transition-shadow no-underline group">
      <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
        <!-- Icon container: rounded-xl, purple-100 bg or teal-100 bg -->
        <svg class="w-7 h-7 text-purple-600">icon</svg>
      </div>
      <h3 class="font-bold text-base text-gray-900">Internships</h3>
      <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
        Paid & unpaid internship placements across Kenya and beyond.
      </p>
    </a>
    <!-- 9 cards: Internships, Sponsorships, Bursaries, University Admissions, 
         Bootcamps, Mentorship, Scholarships, Certifications, Funding -->
  </div>
</section>
```
**Opportunity card specs:**
- Width: 256px (`w-64`)
- Background: white
- Border radius: 16px (`rounded-xl`)
- Shadow: `shadow-md`, hover: `shadow-lg`
- Padding: 20px (`p-5`)
- Icon container: 56×56px, rounded-xl, purple-100/teal-100 bg
- Title: 16px, bold, gray-900
- Description: 12px, gray-500

### 7.10 CV Review Card
```
<div class="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl 
            border border-teal-200 p-6 shadow-md text-center h-full 
            flex flex-col justify-between">
  <div class="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2">
    <span class="text-2xl">📄</span>
  </div>
  <h3 class="font-bold text-xl mt-2" style="color: rgb(30, 41, 59);">
    📝 Free CV Review — Stand Out
  </h3>
  <p class="text-sm text-gray-600">Description...</p>
  <p class="text-xs text-gray-500 mt-0.5">Sub-description...</p>
  <a class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 
            text-white font-semibold py-3 px-4 rounded-full transition-colors 
            w-full no-underline">
    Get Free Review
  </a>
</div>
```

### 7.11 WhatsApp Floating Button
```
<a class="fixed bottom-6 right-6 z-50 flex items-center gap-2 
          bg-green-500 hover:bg-green-600 text-white px-4 py-3 
          rounded-full shadow-lg hover:shadow-xl transition-all 
          duration-200 no-underline group">
  <svg class="w-5 h-5">WhatsApp icon</svg>
  Chat with us
</a>
```
- Position: fixed, bottom: 24px, right: 24px
- Background: green-500, hover: green-600
- Pill shape, shadow-lg
- z-index: 50

### 7.12 Cookie Consent Modal
```
<div class="fixed bottom-0 left-0 right-0 z-[9999] 
            animate-in slide-in-from-bottom-4 fade-in duration-300">
  <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
    <!-- Header with purple gradient -->
    <div class="bg-gradient-to-r from-[#1a56db] to-[#1e40af] px-6 py-4 
                flex items-center justify-between">
      <h3 class="text-white font-bold text-base">We value your privacy</h3>
      <button class="text-white/60 hover:text-white p-1">✕</button>
    </div>
    <!-- Content with toggle switches for cookies -->
  </div>
</div>
```
- Fixed to bottom, full width
- z-index: 9999
- Slide-in animation from bottom
- Blue gradient header
- Rounded-2xl card, shadow-2xl

---

## 8. FOOTER

```html
<footer class="bg-gray-900 text-gray-300 pt-14 pb-8">
  <div class="max-w-[1200px] mx-auto px-4 sm:px-6">
    <!-- 4-column grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-10">
      
      <!-- Column 1: Brand -->
      <div>
        <a class="inline-flex items-center gap-2 text-[1.3rem] font-extrabold text-white no-underline mb-3.5">
          <svg width="26" height="26" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#1a56db"/>
            <path d="M8 16l4 4 12-12" stroke="#fff" stroke-width="3"/>
          </svg>
          JobNet.co.ke
        </a>
        <p class="text-[0.87rem] leading-relaxed opacity-80">
          Kenya's fastest-growing job board...
        </p>
      </div>
      
      <!-- Column 2: For Job Seekers -->
      <div>
        <h4 class="text-white text-[0.92rem] font-semibold mb-3.5">For Job Seekers</h4>
        <ul class="list-none">
          <li class="mb-[7px]"><a class="text-gray-400 text-[0.84rem] hover:text-white transition-colors no-underline">Browse Jobs</a></li>
          <!-- Internships, Government Jobs, Remote Jobs, Career Advice -->
        </ul>
      </div>
      
      <!-- Column 3: Opportunities -->
      <!-- Scholarships, Grants, Fellowships, Bursaries, All Opportunities -->
      
      <!-- Column 4: Company -->
      <!-- About Us, CV Writing Services, Contact Us, Privacy Policy, Terms of Service -->
    </div>
    
    <!-- Bottom bar -->
    <div class="border-t border-white/10 pt-6 flex flex-col md:flex-row 
                justify-between items-center gap-4 text-sm text-gray-500">
      <span>© 2026 JobNet.co.ke. All rights reserved. Data Protection Act 2019 compliant.</span>
      <div class="flex items-center gap-3">
        <!-- Social icons: Twitter, Facebook, LinkedIn, Instagram, TikTok -->
        <!-- Each: text-gray-500 hover:text-white, w-4 h-4 SVG icons -->
      </div>
    </div>
  </div>
</footer>
```

**Below footer (separate section):**
```
<div class="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors">
  <!-- Legal links: Privacy Policy · Terms · Cookies · Disclaimer · Refunds · DPA Notice -->
</div>
```

---

## 9. JOBS LISTING PAGE (/jobs) — STRUCTURE (from RSC/skeleton data)

> **Note:** The /jobs page returned a 500 error during analysis. The following is reconstructed from the RSC payload skeleton structure.

### Search/Filter Bar
```
Container: relative mx-auto max-w-3xl mb-4 mx-4 md:mx-auto p-0
  - Search input (large, centered)
  - Filter row: flex flex-col sm:flex-row items-stretch sm:items-center gap-3
```

### Job Card Structure (from skeleton)
```
<div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
  <div class="flex items-start gap-3">
    <!-- Company logo/avatar -->
    <div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
    
    <!-- Job info -->
    <div class="flex-1 min-w-0">
      <div class="h-4 w-3/4 bg-gray-200 rounded mb-2">  <!-- Job title -->
      <div class="h-3 w-1/2 bg-gray-100 rounded mb-1">     <!-- Company name -->
      <div class="flex gap-2 mt-3">                         <!-- Tags/badges -->
        <div class="h-5 w-16 bg-teal-50 rounded-full">      <!-- Category badge -->
        <div class="h-5 w-20 bg-gray-50 rounded-full">      <!-- Location badge -->
        <div class="h-5 w-14 bg-gray-50 rounded-full">      <!-- Type badge -->
      </div>
    </div>
  </div>
</div>
```

### Job Card Specs (inferred from skeleton + homepage patterns):
- Card: white bg, rounded-xl, shadow-sm, p-4, border border-gray-100
- Layout: flex items-start gap-3
- Company avatar: 40×40px, rounded-full
- Title: ~14px, bold, gray-800
- Company/location: ~12px, gray-400
- Badges: pill-shaped (rounded-full), 20px height, teal-50/gray-50 bg
- Multiple cards in `space-y-3 mb-5` layout

### Sidebar
```
<div class="md:col-span-2 md:grid-cols-2 gap-6">
  <!-- Main content: job cards -->
</div>
```

### Possible Side Sheet (Job Detail Overlay)
From the RSC data, there is a `rounded-2xl shadow-2xl` element pattern matching the cookie modal style. The jobs listing page likely uses a **side sheet / slide-over panel** pattern for viewing job details without navigating away. This would be:
- Fixed position overlay
- Slide-in from right
- Rounded-2xl card with shadow-2xl
- Contains full job details

---

## 10. TAILWIND CONFIGURATION (extracted from class usage)

```javascript
// tailwind.config.ts — inferred configuration
{
  theme: {
    extend: {
      maxWidth: {
        '3xl': '48rem',  // used for search bar container
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
      zIndex: {
        '50': '50',      // floating buttons
        '9999': '9999',   // cookie modal
      },
    },
  },
  plugins: [],
}
```

**Custom CSS class:**
```css
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
```

---

## 11. KEY DESIGN PATTERNS

### Buttons
| Type | Classes | Colors |
|------|---------|--------|
| Primary (purple) | `bg-[#5B21B6] hover:bg-[#4a1a94] text-white rounded-full text-sm font-semibold` | Purple-600/700 |
| Secondary (outline) | `text-sm font-medium text-[#5B21B6] hover:text-[#4a1a94] px-3 py-1.5` | Purple text only |
| CTA (orange) | `px-6 py-3 rounded-full font-semibold text-white` + inline `bg: rgb(249,115,22)` | Orange-500 |
| WhatsApp | `bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-sm` | Green-500/600 |
| Green CTA | `bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold py-3 px-4` | Green-600/700 |
| Back/Neutral | `bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg` | Gray |

### Cards
| Type | Border Radius | Shadow | Border |
|------|---------------|--------|--------|
| Category card | `rounded-xl` (16px) | `shadow-sm` → `hover:shadow-md` | none |
| Opportunity card | `rounded-xl` (16px) | `shadow-md` → `hover:shadow-lg` | none |
| Job card | `rounded-xl` (16px) | `shadow-sm` | `border border-gray-100` |
| Promo card | `rounded-xl` (16px) | `shadow-md` | `border border-teal-200` |
| Cookie modal | `rounded-2xl` (24px) | `shadow-2xl` | `border border-gray-100` |

### Transitions
- `transition-colors` — for color changes
- `transition-shadow` — for card hover effects
- `transition-all duration-200` — for floating button
- `transition` — generic for nav links

### Empty States
- Text: `text-gray-400 text-sm`
- Icon: emoji prefix (📢, 📄, 📝)
- Centered in card with min-height

---

## 12. COMPONENT PATTERNS FOR NEXT.JS + TAILWIND IMPLEMENTATION

### Tailwind Config Colors
```javascript
colors: {
  brand: {
    purple: '#5B21B6',
    'purple-dark': '#4a1a94',
    blue: '#1a56db',
    'blue-dark': '#1e40af',
    orange: '#F97316',
    green: '#10b981',
    'green-dark': '#059669',
    teal: '#0D9488',
  }
}
```

### Responsive Strategy
- Mobile-first design
- `md:` (768px) = desktop nav, wider cards, grid layouts
- `sm:` (640px) = search form row layout
- `lg:` (1024px) = footer 4-col, wider search input

### Data Attributes / Inline Styles Used
- Some colors applied via inline `style=` attribute rather than Tailwind classes
- The "Opportunity" span in hero heading uses inline color
- Section H2 headings use inline `style="color: rgb(30, 41, 59)"`
- Section H3 headings use inline `style="color: rgb(91, 33, 182)"`
- Category icons use inline `style="color: rgb(91, 33, 182); font-size: 1.75rem"`
- Sponsored ad placeholder uses inline `style="min-height: 250px"`
- The hero search button uses inline `style="background-color: rgb(249, 115, 22)"`

---

## 13. MISSING DATA / NOTES

- **Job Detail page**: Could not be analyzed as the /jobs page returned 500 error and no individual job links were found on the homepage (site appears to have no active job listings currently).
- **Jobs listing page search/filters**: Partially reconstructed from RSC skeleton data.
- **Side sheet/modal for job details**: Inferred from component patterns but not confirmed via live interaction.
- **Mobile menu**: The hamburger button exists but the drawer/overlay was not captured (may require JS interaction that didn't fire).
- **Loading spinner**: Uses `border-[3px] border-gray-200` with `border-t-[#1a56db] animate-spin` on a rounded-full element.
- **Site identity**: The site is branded as "JobNet.co.ke" but the domain is jobready.co.ke. The loading screen shows "JobReady" with the "Ready" in blue.
