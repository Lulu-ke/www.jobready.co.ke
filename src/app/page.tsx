'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Hero from '@/components/hero';
import EmployerMarquee from '@/components/employer-marquee';
import DeadlineStrip from '@/components/deadline-strip';
import JobUpdatesSection from '@/components/job-updates-section';
import LatestTrendingSection from '@/components/latest-trending-section';
import CategoriesGrid from '@/components/categories-grid';
import GovVacancies from '@/components/gov-vacancies';
import EntryInternLocation from '@/components/entry-intern-location';
import OpportunityGrid from '@/components/opportunity-grid';
import UniCvBursaries from '@/components/uni-cv-bursaries';
import CareerBlogNewsletter from '@/components/career-blog-newsletter';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import JobDetailSheet from '@/components/job-detail-sheet';
import OpportunityDetailSheet from '@/components/opportunity-detail-sheet';
import ArticleDetailSheet from '@/components/article-detail-sheet';
import JobUpdateDetailSheet from '@/components/job-update-detail-sheet';

interface Stats {
  totalJobs: number;
  totalEmployers: number;
  totalCategories: number;
  remoteJobs: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  jobCount: number;
  description?: string;
}

// ─── Skeleton Fallback ─────────────────────────────────────────
function HomePageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="h-[400px] bg-gradient-to-br from-white to-gray-50" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="max-w-[1280px] mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────
export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

// ─── Inner Content (uses useSearchParams) ──────────────────────
function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Data state ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [deadlineJobs, setDeadlineJobs] = useState<any[]>([]);
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [trendingJobs, setTrendingJobs] = useState<any[]>([]);
  const [entryJobs, setEntryJobs] = useState<any[]>([]);
  const [internJobs, setInternJobs] = useState<any[]>([]);
  const [govJobs, setGovJobs] = useState<any>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [universityOpps, setUniversityOpps] = useState<any[]>([]);
  const [bursaryOpps, setBursaryOpps] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);

  // ── Sheet state: Jobs ──
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobSheetOpen, setJobSheetOpen] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState<any[]>([]);

  // ── Sheet state: Opportunities ──
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [opportunitySheetOpen, setOpportunitySheetOpen] = useState(false);

  // ── Sheet state: Articles ──
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [articleSheetOpen, setArticleSheetOpen] = useState(false);

  // ── Sheet state: Updates ──
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);

  const pathname = usePathname();
  const sheetOpenRef = useRef(false);

  // ── Fetch all data ──
  useEffect(() => {
    async function fetchData() {
      try {
        const [
          featuredRes,
          deadlineRes,
          latestRes,
          trendingRes,
          entryRes,
          internRes,
          govRes,
          catRes,
          oppRes,
          articleRes,
          employerRes,
          updatesRes,
        ] = await Promise.all([
          fetch('/api/jobs?featured=true&limit=5'),
          fetch('/api/jobs?deadline=soon&limit=5'),
          fetch('/api/jobs?sort=newest&limit=10'),
          fetch('/api/jobs?sort=trending&limit=5'),
          fetch('/api/jobs?experienceLevel=entry&limit=4'),
          fetch('/api/jobs?type=Internship&limit=4'),
          fetch('/api/jobs?category=government&limit=8'),
          fetch('/api/categories'),
          fetch('/api/opportunities'),
          fetch('/api/articles'),
          fetch('/api/employers'),
          fetch('/api/updates?limit=6'),
        ]);

        const [
          featuredData,
          deadlineData,
          latestData,
          trendingData,
          entryData,
          internData,
          govData,
          catData,
          oppData,
          articleData,
          employerData,
          updatesData,
        ] = await Promise.all([
          featuredRes.json(),
          deadlineRes.json(),
          latestRes.json(),
          trendingRes.json(),
          entryRes.json(),
          internRes.json(),
          govRes.json(),
          catRes.json(),
          oppRes.json(),
          articleRes.json(),
          employerRes.json(),
          updatesRes.json(),
        ]);

        setFeaturedJobs(featuredData.jobs || []);
        setDeadlineJobs(deadlineData.jobs || []);
        setLatestJobs(latestData.jobs || []);
        setTrendingJobs(trendingData.jobs || []);
        setEntryJobs(entryData.jobs || []);
        setInternJobs(internData.jobs || []);
        setGovJobs(govData.jobs || []);
        setCategories(catData.categories || []);
        setOpportunities(oppData.opportunities || []);
        setArticles(articleData.articles || []);
        setEmployers(employerData.employers || []);
        setUpdates(updatesData.updates || []);

        // Split opportunities by type
        const allOpps = oppData.opportunities || [];
        setUniversityOpps(allOpps.filter((o: any) => o.type === 'university_admission').slice(0, 4));
        setBursaryOpps(allOpps.filter((o: any) => o.type === 'bursary' || o.type === 'scholarship').slice(0, 4));

        // Split gov jobs into county vs national
        const allGov = govData.jobs || [];
        const countyGov = allGov.filter(
          (j: any) =>
            (j.county && j.county.toLowerCase().includes('county')) ||
            (j.title && j.title.toLowerCase().includes('county'))
        );
        const nationalGov = allGov.filter(
          (j: any) =>
            !(j.county && j.county.toLowerCase().includes('county')) &&
            !(j.title && j.title.toLowerCase().includes('county'))
        );
        const padCounty = countyGov.length < 4 ? [...countyGov, ...nationalGov.slice(0, 4 - countyGov.length)] : countyGov;
        const padNational = nationalGov.length < 4 ? [...nationalGov, ...countyGov.slice(0, 4 - nationalGov.length)] : nationalGov;
        setGovJobs({ county: padCounty.slice(0, 4), national: padNational.slice(0, 4) });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  // ── Derive location counts from latest jobs ──
  const locationCounts = (() => {
    if (latestJobs.length === 0) return [];
    const locMap: Record<string, number> = {};
    latestJobs.forEach((j: any) => {
      const loc = j.county || j.location || '';
      if (loc) {
        locMap[loc] = (locMap[loc] || 0) + 1;
      }
    });
    return Object.entries(locMap)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  })();

  const defaultStats: Stats = {
    totalJobs: 2500,
    totalEmployers: 500,
    totalCategories: categories.length || 26,
    remoteJobs: 300,
  };

  const govJobsData = Array.isArray(govJobs) ? { county: [], national: govJobs } : govJobs;

  // ── Helper: parse ?view= param ──
  function parseViewParam(raw: string | null): { type: string; slugOrId: string } | null {
    if (!raw) return null;
    if (raw.includes(':')) {
      const idx = raw.indexOf(':');
      return { type: raw.substring(0, idx), slugOrId: raw.substring(idx + 1) };
    }
    // Backward compatibility: no prefix → treat as job
    return { type: 'job', slugOrId: raw };
  }

  // ── Sheet open/close handlers ──
  // Uses router.replace(pathname) on close so the user stays on the current page.
  // router.replace for open does NOT push a new history entry, so router.back()
  // would navigate to the *previous* page — not what we want.

  const openJobSheet = useCallback(async (job: any) => {
    setSelectedJob(job);
    setJobSheetOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=job:${job.slug || job.id}`, { scroll: false });
    try {
      const res = await fetch(`/api/jobs/${job.slug || job.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedJob(data.job || job);
        setRelatedJobs(data.relatedJobs || []);
      }
    } catch {
      // keep existing data
    }
  }, [router, pathname]);

  const closeJobSheet = useCallback(() => {
    setJobSheetOpen(false);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const openOpportunitySheet = useCallback(async (opp: any) => {
    setSelectedOpportunity(opp);
    setOpportunitySheetOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=opp:${opp.slug || opp.id}`, { scroll: false });
    try {
      const res = await fetch(`/api/opportunities/${opp.slug || opp.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOpportunity(data.opportunity || opp);
      }
    } catch {
      // keep existing data
    }
  }, [router, pathname]);

  const closeOpportunitySheet = useCallback(() => {
    setOpportunitySheetOpen(false);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const openArticleSheet = useCallback(async (article: any) => {
    setSelectedArticle(article);
    setArticleSheetOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=art:${article.slug || article.id}`, { scroll: false });
    try {
      const res = await fetch(`/api/articles/${article.slug || article.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedArticle(data.article || article);
      }
    } catch {
      // keep existing data
    }
  }, [router, pathname]);

  const closeArticleSheet = useCallback(() => {
    setArticleSheetOpen(false);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const openUpdateSheet = useCallback(async (update: any) => {
    setSelectedUpdate(update);
    setUpdateSheetOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=upd:${update.slug || update.id}`, { scroll: false });
    try {
      const res = await fetch(`/api/updates/${update.slug || update.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUpdate(data.update || update);
      }
    } catch {
      // keep existing data
    }
  }, [router, pathname]);

  const closeUpdateSheet = useCallback(() => {
    setUpdateSheetOpen(false);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // ── Close all sheets on popstate (back button) ──
  useEffect(() => {
    const handlePopState = () => {
      if (sheetOpenRef.current) {
        sheetOpenRef.current = false;
        setJobSheetOpen(false);
        setOpportunitySheetOpen(false);
        setArticleSheetOpen(false);
        setUpdateSheetOpen(false);
        setSelectedJob(null);
        setSelectedOpportunity(null);
        setSelectedArticle(null);
        setSelectedUpdate(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Auto-open sheet if ?view= present on mount ──
  /* eslint-disable react-hooks/set-state-in-effect -- auto-opening sheets from URL params on mount is intentional */
  useEffect(() => {
    const parsed = parseViewParam(searchParams.get('view'));
    if (!parsed) return;

    const { type, slugOrId } = parsed;

    switch (type) {
      case 'job': {
        const job = [...latestJobs, ...trendingJobs, ...featuredJobs, ...entryJobs, ...internJobs].find((j) => j.slug === slugOrId || j.id === slugOrId);
        if (job) {
          openJobSheet(job);
        } else {
          (async () => {
            try {
              setJobSheetOpen(true);
              setSelectedJob({ id: slugOrId } as any);
              const res = await fetch(`/api/jobs/${slugOrId}`);
              if (res.ok) {
                const data = await res.json();
                if (data.job) {
                  setSelectedJob(data.job);
                  setRelatedJobs(data.relatedJobs || []);
                } else {
                  setJobSheetOpen(false);
                  router.replace(pathname, { scroll: false });
                }
              } else {
                setJobSheetOpen(false);
                router.replace(pathname, { scroll: false });
              }
            } catch {
              setJobSheetOpen(false);
              router.replace(pathname, { scroll: false });
            }
          })();
        }
        break;
      }
      case 'opp': {
        const opp = opportunities.find((o) => o.slug === slugOrId || o.id === slugOrId);
        if (opp) {
          openOpportunitySheet(opp);
        } else {
          (async () => {
            try {
              setOpportunitySheetOpen(true);
              setSelectedOpportunity({ id: slugOrId } as any);
              const res = await fetch(`/api/opportunities/${slugOrId}`);
              if (res.ok) {
                const data = await res.json();
                if (data.opportunity) {
                  setSelectedOpportunity(data.opportunity);
                } else {
                  setOpportunitySheetOpen(false);
                  router.replace(pathname, { scroll: false });
                }
              } else {
                setOpportunitySheetOpen(false);
                router.replace(pathname, { scroll: false });
              }
            } catch {
              setOpportunitySheetOpen(false);
              router.replace(pathname, { scroll: false });
            }
          })();
        }
        break;
      }
      case 'art': {
        const article = articles.find((a) => a.slug === slugOrId || a.id === slugOrId);
        if (article) {
          openArticleSheet(article);
        } else {
          (async () => {
            try {
              setArticleSheetOpen(true);
              setSelectedArticle({ id: slugOrId } as any);
              const res = await fetch(`/api/articles/${slugOrId}`);
              if (res.ok) {
                const data = await res.json();
                if (data.article) {
                  setSelectedArticle(data.article);
                } else {
                  setArticleSheetOpen(false);
                  router.replace(pathname, { scroll: false });
                }
              } else {
                setArticleSheetOpen(false);
                router.replace(pathname, { scroll: false });
              }
            } catch {
              setArticleSheetOpen(false);
              router.replace(pathname, { scroll: false });
            }
          })();
        }
        break;
      }
      case 'upd': {
        const update = updates.find((u) => u.slug === slugOrId || u.id === slugOrId);
        if (update) {
          openUpdateSheet(update);
        } else {
          (async () => {
            try {
              setUpdateSheetOpen(true);
              setSelectedUpdate({ id: slugOrId } as any);
              const res = await fetch(`/api/updates/${slugOrId}`);
              if (res.ok) {
                const data = await res.json();
                if (data.update) {
                  setSelectedUpdate(data.update);
                } else {
                  setUpdateSheetOpen(false);
                  router.replace(pathname, { scroll: false });
                }
              } else {
                setUpdateSheetOpen(false);
                router.replace(pathname, { scroll: false });
              }
            } catch {
              setUpdateSheetOpen(false);
              router.replace(pathname, { scroll: false });
            }
          })();
        }
        break;
      }
      default:
        // Unknown type, clean up URL
        router.replace(pathname, { scroll: false });
        break;
    }
    // Only run on mount — intentionally empty deps so searchParams snapshot is taken once
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── Callbacks for sub-components ──
  const handleJobClick = useCallback((job: any) => {
    openJobSheet(job);
  }, [openJobSheet]);

  const handleOpportunityClick = useCallback((opp: any) => {
    openOpportunitySheet(opp);
  }, [openOpportunitySheet]);

  const handleArticleClick = useCallback((article: any) => {
    openArticleSheet(article);
  }, [openArticleSheet]);

  const handleUpdateClick = useCallback((update: any) => {
    openUpdateSheet(update);
  }, [openUpdateSheet]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      <main className="flex-1">
        <Hero stats={defaultStats} onSearch={() => {}} />

        {/* Employer Marquee — after Hero, before DeadlineStrip */}
        <EmployerMarquee employers={employers} />

        <DeadlineStrip jobs={deadlineJobs} />

        {/* Job Updates Section — after DeadlineStrip, before LatestTrending */}
        <JobUpdatesSection updates={updates} onUpdateClick={handleUpdateClick} />

        <LatestTrendingSection
          latestJobs={latestJobs}
          trendingJobs={trendingJobs}
          featuredJobs={featuredJobs}
          onJobClick={handleJobClick}
        />
        <CategoriesGrid categories={categories} />
        <GovVacancies
          countyJobs={govJobsData?.county || []}
          nationalJobs={govJobsData?.national || []}
          onJobClick={handleJobClick}
        />
        <EntryInternLocation
          entryJobs={entryJobs}
          internJobs={internJobs}
          locationCounts={locationCounts}
          onJobClick={handleJobClick}
        />
        <OpportunityGrid opportunities={opportunities} />
        <UniCvBursaries
          universityOpps={universityOpps}
          bursaryOpps={bursaryOpps}
          onOpportunityClick={handleOpportunityClick}
        />
        <CareerBlogNewsletter
          articles={articles}
          onArticleClick={handleArticleClick}
        />
      </main>
      <Footer />
      <WhatsAppFloat />

      {/* ── Side-sheet modals ── */}
      <JobDetailSheet
        job={selectedJob}
        open={jobSheetOpen}
        onClose={closeJobSheet}
        onJobClick={handleJobClick}
        relatedJobs={relatedJobs}
      />
      <OpportunityDetailSheet
        opportunity={selectedOpportunity}
        open={opportunitySheetOpen}
        onClose={closeOpportunitySheet}
      />
      <ArticleDetailSheet
        article={selectedArticle}
        open={articleSheetOpen}
        onClose={closeArticleSheet}
      />
      <JobUpdateDetailSheet
        update={selectedUpdate}
        open={updateSheetOpen}
        onClose={closeUpdateSheet}
      />
    </div>
  );
}
