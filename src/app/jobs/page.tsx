'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Briefcase, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MobileNav from '@/components/mobile-nav';
import JobCard, { Job } from '@/components/job-card';
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

function JobsPageContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsPageInner />
      </Suspense>
      <Footer />
      <MobileNav />
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-purple-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-lg" />
            <Skeleton className="h-5 w-80 mx-auto rounded-lg" />
          </div>
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </section>
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
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

function JobsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    category: '',
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

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.category) params.set('category', filters.category);
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
  }, [filters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Open detail sheet
  const openJobSheet = useCallback(async (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);
    router.replace(`/jobs?view=${job.id}`, { scroll: false });

    // Fetch full details
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`);
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
  }, [router]);

  // Close detail sheet
  const closeJobSheet = useCallback(() => {
    setDetailOpen(false);
    router.back();
  }, [router]);

  // Listen for popstate (back button) to close sheet
  useEffect(() => {
    const handlePopState = () => {
      setDetailOpen(false);
      setSelectedJob(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-open sheet if ?view= is present on mount
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && !detailOpen) {
      // Find the job in the current list
      const job = jobs.find((j) => j.id === viewId);
      if (job) {
        openJobSheet(job);
      } else {
        // Fetch the job directly
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
                router.replace('/jobs', { scroll: false });
              }
            } else {
              setDetailOpen(false);
              router.replace('/jobs', { scroll: false });
            }
          } catch {
            setDetailOpen(false);
            router.replace('/jobs', { scroll: false });
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
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-purple-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Briefcase className="w-8 h-8" />
              Find Your Dream Job
            </h1>
            <p className="text-teal-100 max-w-xl mx-auto">
              Browse {total > 0 ? total.toLocaleString() : 'thousands of'} opportunities from top Kenyan employers
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by job title, company, or keyword..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="pl-12 pr-4 h-12 text-base rounded-xl border-0 shadow-lg bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
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
                      Showing <span className="font-semibold text-gray-900">{jobs.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> jobs
                    </>
                  )}
                </div>
                <a
                  href="/opportunities"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  View All Opportunities <ArrowRight className="w-4 h-4" />
                </a>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                  <Button
                    onClick={() =>
                      handleFilterChange({
                        search: '',
                        location: '',
                        category: '',
                        type: '',
                        experienceLevel: '',
                        salaryMin: '',
                        salaryMax: '',
                        sort: 'newest',
                      })
                    }
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Loading Skeletons */}
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100">
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
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
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

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsPageInner />
      </Suspense>
      <Footer />
      <MobileNav />
    </div>
  );
}
