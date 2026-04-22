'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import JobCard from './job-card';
import JobFilters from './job-filters';
import JobDetailSheet from './job-detail-sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  county: string;
  type: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFormatted: string;
  description: string;
  requirements: string;
  howToApply: string;
  isRemote: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  closingDate: string | null;
  postedAt: string;
  employer?: { name: string; logo: string; industry: string; isVerified: boolean } | null;
}

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
    salaryMin: '',
    salaryMax: '',
    sort: 'newest',
  });

  const limit = 12;

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    if (filters.type) params.set('type', filters.type);
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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleJobClick = async (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}`);
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
    <section id="jobs" className="scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse Jobs</h2>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading...' : `${total.toLocaleString()} jobs found`}
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Showing {jobs.length} of {total.toLocaleString()} results
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8 gap-4">
          {/* Filters Sidebar — desktop only, mobile handled inside JobFilters */}
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            totalResults={total}
          />

          {/* Job Cards Grid */}
          <div className="flex-1 min-w-0 w-full">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700 mb-6">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => fetchJobs()}>Retry</Button>
              </div>
            )}

            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange({
                    search: '', location: '', category: '', type: '', salaryMin: '', salaryMax: '', sort: 'newest',
                  })}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
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
                  onClick={() => {
                    setPage((p) => p + 1);
                    // fetchJobs with append will be triggered by the useEffect
                  }}
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

      {/* Job Detail Sheet */}
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
