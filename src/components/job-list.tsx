'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import JobCard, { Job } from './job-card';
import JobFilters from './job-filters';
import JobDetailSheet from './job-detail-sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface Category {
  name: string;
  slug: string;
  jobCount: number;
}

interface JobListProps {
  initialSearch?: string;
}

export default function JobList({ initialSearch }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: initialSearch || '',
    location: '',
    category: '',
    type: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    sort: 'newest',
    county: '',
  });

  const limit = 12;

  const buildQuery = useCallback(() => {
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
    return params.toString();
  }, [filters, page]);

  const fetchJobs = useCallback(async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const query = buildQuery();
      const res = await fetch(`/api/jobs?${query}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();

      if (append) {
        setJobs((prev) => [...prev, ...data.jobs]);
      } else {
        setJobs(data.jobs);
      }
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleJobClick = async (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);

    try {
      const res = await fetch(`/api/jobs/${job.slug || job.id}`);
      if (res.ok) {
        const data = await res.json();
        setRelatedJobs(data.relatedJobs || []);
        if (data.job) setSelectedJob(data.job);
      }
    } catch {
      // use basic job data
    }
  };

  const hasMore = jobs.length < total;

  return (
    <section id="jobs" className="scroll-mt-32 py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ color: '#1E293B' }}>
          Featured Jobs – Sponsored
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Featured Job Cards (2 cols) */}
          <div className="md:col-span-2">
            <div className="flex flex-col lg:flex-row lg:gap-8 gap-4">
              {/* Filters Sidebar (desktop) */}
              <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                totalResults={total}
              />

              {/* Job Cards */}
              <div className="flex-1 min-w-0 w-full">
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700 mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => fetchJobs()}>Retry</Button>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                            <div className="flex gap-2 pt-1">
                              <Skeleton className="h-5 w-16 rounded-full" />
                              <Skeleton className="h-5 w-20 rounded-full" />
                              <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: '#1E293B' }}>No jobs found</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleFilterChange({
                        search: '', location: '', category: '', type: '', experienceLevel: '', salaryMin: '', salaryMax: '', sort: 'newest', county: '',
                      })}
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} onClick={handleJobClick} />
                    ))}
                  </div>
                )}

                {/* Load More */}
                {hasMore && !loading && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={loadingMore}
                      className="px-8"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading more jobs...
                        </>
                      ) : (
                        `Load More Jobs (${total - jobs.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: CV Promo Card */}
          <div className="bg-gradient-to-r from-purple-50 to-teal-50 p-5 rounded-xl border border-teal-200 text-center shadow-md h-full flex flex-col justify-center">
            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#5B21B6' }} />
            <h3 className="font-bold text-lg mt-1" style={{ color: '#1E293B' }}>
              Land Your Dream Job Faster
            </h3>
            <p className="text-sm text-gray-600 my-2 text-left space-y-1">
              <span className="block">Professional CV Writing (from KES 2,500)</span>
              <span className="block">Cover Letter &amp; Application Docs</span>
              <span className="block">Career Coaching</span>
            </p>
            <Button
              className="w-full mt-2 text-white font-semibold rounded-full transition-colors"
              style={{ backgroundColor: '#5B21B6' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4a1a94')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
              asChild
            >
              <a href="#">Get Started &rarr;</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Job Detail Sheet - MAINTAINED */}
      <JobDetailSheet
        job={selectedJob}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onJobClick={handleJobClick}
        relatedJobs={relatedJobs}
      />
    </section>
  );
}
