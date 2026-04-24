'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, FileText, Briefcase, Monitor, Heart, BookOpen, DollarSign, User } from 'lucide-react';
import { formatRelativeDate } from '@/lib/helpers';

// ─── Featured Jobs Section ─────────────────────────────────────
interface FeaturedJob {
  id: string;
  title: string;
  company: string;
  county: string;
  type: string;
  isRemote: boolean;
  postedAt: string;
  slug?: string;
}

function FeaturedJobsSection({ featuredJobs, onJobClick }: { featuredJobs: FeaturedJob[]; onJobClick?: (job: FeaturedJob) => void }) {
  const largeJob = featuredJobs?.[0];
  const smallJobs = featuredJobs?.slice(1, 3);

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ color: '#1E293B' }}>
          Featured Jobs – Sponsored
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Job cards (2/3) */}
          <div className="md:col-span-2">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left column: Large card */}
              <div>
                <div className="mb-2">
                  <Link
                    href="/cv-services"
                    className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors"
                  >
                    Post your job here →
                  </Link>
                </div>
                {largeJob ? (
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full"
                    onClick={onJobClick ? () => onJobClick(largeJob) : undefined}
                    style={onJobClick ? { cursor: 'pointer' } : undefined}
                  >
                    <div className="relative">
                      <div className="w-full h-56 bg-gradient-to-br from-purple-100 to-teal-50" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">{largeJob.title}</h3>
                        <p className="text-sm text-white/80">
                          {largeJob.company}{largeJob.county ? ` – ${largeJob.county}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <div className="flex flex-wrap gap-2">
                        {largeJob.type && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{largeJob.type}</span>
                        )}
                        {largeJob.isRemote && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Remote</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Posted {formatRelativeDate(largeJob.postedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden flex items-center justify-center h-64">
                    <p className="text-gray-400 text-sm">No featured jobs yet</p>
                  </div>
                )}
              </div>

              {/* Right column: Stacked small cards */}
              <div className="space-y-3">
                {smallJobs.map((job) => (
                  onJobClick ? (
                    <div
                      key={job.id}
                      onClick={() => onJobClick(job)}
                      className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-50" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <h3 className="font-bold text-sm text-white">{job.title}</h3>
                          <p className="text-xs text-white/80">
                            {job.company}{job.county ? ` – ${job.county}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="p-2">
                        {job.type && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{job.type}</span>
                          </div>
                        )}
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Posted {formatRelativeDate(job.postedAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.slug}`}
                      className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow no-underline"
                    >
                      <div className="relative">
                        <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-50" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <h3 className="font-bold text-sm text-white">{job.title}</h3>
                          <p className="text-xs text-white/80">
                            {job.company}{job.county ? ` – ${job.county}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="p-2">
                        {job.type && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{job.type}</span>
                          </div>
                        )}
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Posted {formatRelativeDate(job.postedAt)}
                        </p>
                      </div>
                    </Link>
                  )
                ))}
                {smallJobs.length === 0 && (
                  <div className="bg-white rounded-xl shadow-md flex items-center justify-center h-28">
                    <p className="text-gray-400 text-sm">More featured jobs coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: CV promo card (1/3) */}
          <div>
            <div className="bg-gradient-to-r from-purple-50 to-teal-50 p-5 rounded-xl border border-teal-200 text-center shadow-md h-full flex flex-col justify-center">
              <FileText className="w-8 h-8 mx-auto" style={{ color: '#5B21B6' }} />
              <h3 className="font-bold text-lg mt-1" style={{ color: '#1E293B' }}>
                📄 Land Your Dream Job Faster
              </h3>
              <p className="text-sm text-gray-600 my-2">
                ✅ Professional CV Writing (from KES 2,500)
                <br />
                ✅ Cover Letter &amp; Application Docs
                <br />
                ✅ Career Coaching
              </p>
              <Link
                href="/cv-services"
                className="inline-block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Latest Jobs Section ───────────────────────────────────────
interface LatestJob {
  id: string;
  title: string;
  slug: string;
  company: string;
  county: string;
  closingDate: string | null;
}

function LatestJobsSection({ jobs, onJobClick }: { jobs: LatestJob[]; onJobClick?: (job: LatestJob) => void }) {
  if (!jobs || jobs.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
        Latest Jobs in Kenya
      </h2>
      <div>
        {jobs.map((job) => (
          <div
            key={job.id}
            className="py-1"
            style={{ borderLeft: '3px solid #0D9488', paddingLeft: '0.75rem' }}
          >
            {onJobClick ? (
              <button
                type="button"
                onClick={() => onJobClick(job)}
                className="clickable-text font-semibold text-gray-800 bg-transparent border-0 p-0 text-left cursor-pointer"
              >
                {job.title}
              </button>
            ) : (
              <Link
                href={`/jobs/${job.slug}`}
                className="clickable-text font-semibold text-gray-800 no-underline"
              >
                {job.title}
              </Link>
            )}
            <span className="text-gray-500 text-sm">
              {' '}- {job.company}{job.county ? ` - ${job.county}` : ''}
            </span>
            {job.closingDate && (
              <div className="text-gray-400 text-xs">
                Deadline: {new Date(job.closingDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link
          href="/jobs"
          className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
        >
          View all jobs <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Trending Now Section ──────────────────────────────────────
interface TrendingJob {
  id: string;
  title: string;
  slug: string;
  company: string;
}

const categoryIconMap: Record<string, React.ElementType> = {
  TECHNOLOGY: Monitor,
  FINANCE_ACCOUNTING: DollarSign,
  HEALTHCARE: Heart,
  EDUCATION: BookOpen,
  default: Briefcase,
};

function TrendingNowSection({ jobs, onJobClick }: { jobs: TrendingJob[]; onJobClick?: (job: TrendingJob) => void }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
        Trending Now in Kenya
      </h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {jobs.map((job) => {
            const Icon = categoryIconMap.default;
            return (
              <div key={job.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                  <Icon className="w-4 h-4" />
                </div>
                {onJobClick ? (
                  <button
                    type="button"
                    onClick={() => onJobClick(job)}
                    className="flex-1 text-gray-700 hover:text-teal-600 transition-colors text-sm bg-transparent border-0 p-0 text-left cursor-pointer"
                  >
                    {job.title} – {job.company}
                  </button>
                ) : (
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="flex-1 text-gray-700 hover:text-teal-600 transition-colors no-underline text-sm"
                  >
                    {job.title} – {job.company}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 text-right">
        <Link
          href="/jobs?sort=trending"
          className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
        >
          View all trending <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Combined Component ────────────────────────────────────────
interface LatestTrendingSectionProps {
  latestJobs: LatestJob[];
  trendingJobs: TrendingJob[];
  featuredJobs: FeaturedJob[];
  onJobClick?: (job: any) => void;
}

export default function LatestTrendingSection({ latestJobs, trendingJobs, featuredJobs, onJobClick }: LatestTrendingSectionProps) {
  return (
    <>
      <FeaturedJobsSection featuredJobs={featuredJobs} onJobClick={onJobClick} />
      <section className="py-8 md:py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <LatestJobsSection jobs={latestJobs} onJobClick={onJobClick} />
            <TrendingNowSection jobs={trendingJobs} onJobClick={onJobClick} />
          </div>
        </div>
      </section>
    </>
  );
}
