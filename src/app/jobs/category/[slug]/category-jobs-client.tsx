'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Briefcase, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import JobCard, { Job } from '@/components/job-card';
import WhatsAppFloat from '@/components/whatsapp-float';
import JobFilters from '@/components/job-filters';
import JobDetailSheet from '@/components/job-detail-sheet';
import NewsletterSection from '@/components/newsletter-section';

interface Filters {
  search: string;
  location: string;
  category: string;
  type: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  sort: string;
}

interface Category {
  name: string;
  slug: string;
  jobCount: number;
}

interface CategoryJobsClientProps {
  categoryName: string;
  categorySlug: string;
}

function CategoryJobsSkeleton() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-white to-gray-50 py-10 lg:py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40 mb-3 rounded-lg" />
          <Skeleton className="h-10 w-72 mb-2 rounded-lg" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>
      </section>
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryJobsInner({ categoryName, categorySlug }: CategoryJobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Sheet state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    category: categorySlug,
    type: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    sort: 'newest',
  });

  const limit = 12;

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Fetch jobs pre-filtered by category
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('category', categorySlug);
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.type) params.set('type', filters.type);
      if (filters.experienceLevel) params.set('experienceLevel', filters.experienceLevel);
      if (filters.salaryMin) params.set('salaryMin', filters.salaryMin);
      if (filters.salaryMax) params.set('salaryMax', filters.salaryMax);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, categorySlug]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const sheetOpenRef = useRef(false);

  // Open detail sheet
  const openJobSheet = useCallback(async (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=${job.slug || job.id}`, { scroll: false });

    setDetailLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.slug || job.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedJob(data.job || job);
        setRelatedJobs(data.relatedJobs || []);
      }
    } catch {
      // keep existing data
    } finally {
      setDetailLoading(false);
    }
  }, [router, pathname]);

  // Close detail sheet
  const closeJobSheet = useCallback(() => {
    setDetailOpen(false);
    setSelectedJob(null);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Listen for popstate (back button) to close sheet
  useEffect(() => {
    const handlePopState = () => {
      if (sheetOpenRef.current) {
        sheetOpenRef.current = false;
        setDetailOpen(false);
        setSelectedJob(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-open sheet if ?view= is present on mount
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && !detailOpen) {
      const job = jobs.find((j) => j.slug === viewId || j.id === viewId);
      if (job) {
        openJobSheet(job);
      } else {
        (async () => {
          try {
            setDetailLoading(true);
            setDetailOpen(true);
            const res = await fetch(`/api/jobs/${viewId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.job) {
                setSelectedJob(data.job);
                setRelatedJobs(data.relatedJobs || []);
              } else {
                setDetailOpen(false);
                router.replace(pathname, { scroll: false });
              }
            } else {
              setDetailOpen(false);
              router.replace(pathname, { scroll: false });
            }
          } catch {
            setDetailOpen(false);
            router.replace(pathname, { scroll: false });
          } finally {
            setDetailLoading(false);
          }
        })();
      }
    }
    // Only run on mount
  }, []);

  const handleJobClick = (job: Job) => {
    openJobSheet(job);
  };

  return (
    <div className="flex-1">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-10 lg:py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/jobs" className="hover:text-teal-600 transition-colors">Jobs</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">{categoryName}</span>
          </nav>

          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
              <Briefcase className="w-8 h-8 text-teal-600" />
              {categoryName} Jobs in Kenya
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Browse {total > 0 ? total.toLocaleString() : 'the latest'} {categoryName.toLowerCase()} jobs across Kenya from top employers
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Filters */}
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              totalResults={total}
            />

            {/* Job Listings */}
            <div className="flex-1 min-w-0">
              {/* Result Count */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-500">
                  {loading ? (
                    <Skeleton className="h-4 w-40 inline-block" />
                  ) : (
                    <>
                      Showing <span className="font-semibold text-slate-800">{jobs.length}</span> of{' '}
                      <span className="font-semibold text-slate-800">{total.toLocaleString()}</span> jobs
                    </>
                  )}
                </div>
                <Link
                  href="/jobs"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  View All Jobs in Kenya
                </Link>
              </div>

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchJobs} className="bg-teal-600 hover:bg-teal-700 text-white">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && jobs.length === 0 && (
                <div className="text-center py-16">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No {categoryName.toLowerCase()} jobs currently available
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Check back soon or browse all jobs in Kenya.
                  </p>
                  <Link href="/jobs">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                      Browse All Jobs
                    </Button>
                  </Link>
                </div>
              )}

              {/* Loading Skeletons */}
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <div className="flex gap-4">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Job Cards Grid */}
              {!loading && !error && jobs.length > 0 && (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} onClick={handleJobClick} />
                  ))}
                </div>
              )}

              {/* Load More */}
              {!loading && !error && jobs.length > 0 && page < totalPages && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8"
                  >
                    Load More Jobs
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Page {page} of {totalPages}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />

      {/* Job Detail Sheet */}
      <JobDetailSheet
        job={selectedJob}
        open={detailOpen}
        onClose={closeJobSheet}
        onJobClick={handleJobClick}
        relatedJobs={relatedJobs}
      />
    </div>
  );
}

export default function CategoryJobsClient({ categoryName, categorySlug }: CategoryJobsClientProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<CategoryJobsSkeleton />}>
        <CategoryJobsInner categoryName={categoryName} categorySlug={categorySlug} />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
