'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Briefcase,
  Award,
  Building2,
  BookOpen,
  Loader2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import { orgTypeLabel, opportunityTypeLabel, experienceLevelLabel } from '@/lib/helpers';

// ── Types ──────────────────────────────────────────────
interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experienceLevel?: string;
  slug?: string;
  employer?: { id: string; companyName: string; slug: string } | null;
}

interface OpportunityResult {
  id: string;
  title: string;
  type: string;
  deadline: string | null;
  providerName?: string | null;
  slug?: string;
}

interface CompanyResult {
  id: string;
  companyName: string;
  orgType: string;
  slug?: string;
}

interface ArticleResult {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  slug?: string;
}

type SearchTab = 'all' | 'jobs' | 'opportunities' | 'companies' | 'articles';

const tabs: { key: SearchTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'opportunities', label: 'Opportunities', icon: <Award className="w-4 h-4" /> },
  { key: 'companies', label: 'Companies', icon: <Building2 className="w-4 h-4" /> },
  { key: 'articles', label: 'Articles', icon: <BookOpen className="w-4 h-4" /> },
];

const popularSearches = [
  'Software Engineer',
  'Nursing',
  'Accounting',
  'Scholarship',
  'Government',
  'Remote',
];

// ── Skeleton ──────────────────────────────────────────
function SearchPageSkeleton() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-lg" />
            <Skeleton className="h-5 w-80 mx-auto rounded-lg" />
          </div>
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
          <div className="flex justify-center gap-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
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

// ── Main search inner ──────────────────────────────────
function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  // Results
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityResult[]>([]);
  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [articles, setArticles] = useState<ArticleResult[]>([]);

  const performSearch = useCallback(async (q: string, tab: SearchTab) => {
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      if (tab === 'jobs') {
        const res = await fetch(`/api/jobs?search=${encodeURIComponent(q)}&limit=12`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
        setOpportunities([]);
        setCompanies([]);
        setArticles([]);
      } else if (tab === 'opportunities') {
        const res = await fetch('/api/opportunities');
        if (!res.ok) throw new Error('Failed to fetch opportunities');
        const data = await res.json();
        const all = data.opportunities || [];
        const lowerQ = q.toLowerCase();
        const filtered = all.filter(
          (o: OpportunityResult) =>
            o.title.toLowerCase().includes(lowerQ) ||
            o.providerName?.toLowerCase().includes(lowerQ)
        );
        setOpportunities(filtered);
        setJobs([]);
        setCompanies([]);
        setArticles([]);
      } else if (tab === 'companies') {
        const res = await fetch('/api/employers');
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data = await res.json();
        const all = data.employers || [];
        const lowerQ = q.toLowerCase();
        const filtered = all.filter(
          (e: CompanyResult) =>
            e.companyName.toLowerCase().includes(lowerQ)
        );
        setCompanies(filtered);
        setJobs([]);
        setOpportunities([]);
        setArticles([]);
      } else if (tab === 'articles') {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        const all = data.articles || [];
        const lowerQ = q.toLowerCase();
        const filtered = all.filter(
          (a: ArticleResult) =>
            a.title.toLowerCase().includes(lowerQ) ||
            a.category.toLowerCase().includes(lowerQ)
        );
        setArticles(filtered);
        setJobs([]);
        setOpportunities([]);
        setCompanies([]);
      } else {
        // 'all' — fetch everything in parallel
        const [jobsRes, oppsRes, empsRes, artsRes] = await Promise.allSettled([
          fetch(`/api/jobs?search=${encodeURIComponent(q)}&limit=12`).then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
          }),
          fetch('/api/opportunities').then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
          }),
          fetch('/api/employers').then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
          }),
          fetch('/api/articles').then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
          }),
        ]);

        const lowerQ = q.toLowerCase();

        if (jobsRes.status === 'fulfilled') {
          setJobs(jobsRes.value.jobs || []);
        } else {
          setJobs([]);
        }
        if (oppsRes.status === 'fulfilled') {
          const all = (oppsRes.value.opportunities || []) as OpportunityResult[];
          setOpportunities(
            all.filter(
              (o) =>
                o.title.toLowerCase().includes(lowerQ) ||
                o.providerName?.toLowerCase().includes(lowerQ)
            )
          );
        } else {
          setOpportunities([]);
        }
        if (empsRes.status === 'fulfilled') {
          const all = (empsRes.value.employers || []) as CompanyResult[];
          setCompanies(
            all.filter((e) => e.companyName.toLowerCase().includes(lowerQ))
          );
        } else {
          setCompanies([]);
        }
        if (artsRes.status === 'fulfilled') {
          const all = (artsRes.value.articles || []) as ArticleResult[];
          setArticles(
            all.filter(
              (a) =>
                a.title.toLowerCase().includes(lowerQ) ||
                a.category.toLowerCase().includes(lowerQ)
            )
          );
        } else {
          setArticles([]);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL param on mount
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, 'all');
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.replace(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
      performSearch(query.trim(), activeTab);
    }
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    if (query.trim()) {
      performSearch(query.trim(), tab);
    }
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`, { scroll: false });
    performSearch(term, activeTab);
  };

  // Count helpers
  const totalResults =
    activeTab === 'all'
      ? jobs.length + opportunities.length + companies.length + articles.length
      : activeTab === 'jobs'
        ? jobs.length
        : activeTab === 'opportunities'
          ? opportunities.length
          : activeTab === 'companies'
            ? companies.length
            : articles.length;

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Full-Time': 'bg-green-50 text-green-700',
      'Part-Time': 'bg-blue-50 text-blue-700',
      Contract: 'bg-orange-50 text-orange-700',
      Internship: 'bg-purple-50 text-purple-700',
      'Fixed-Term': 'bg-amber-50 text-amber-700',
      Remote: 'bg-cyan-50 text-cyan-700',
    };
    return colors[type] || 'bg-gray-50 text-gray-600';
  };

  const getOppTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      internship: 'bg-blue-100 text-blue-700',
      sponsorship: 'bg-purple-100 text-purple-700',
      bursary: 'bg-green-100 text-green-700',
      university_admission: 'bg-amber-100 text-amber-700',
      scholarship: 'bg-violet-100 text-violet-700',
      certification: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="flex-1">
      {/* Hero / Search Bar */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
              <Search className="w-8 h-8 text-teal-600" />
              Search JobReady Kenya
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Find jobs, scholarships, companies, and career advice all in one place
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm p-1.5 focus-within:border-teal-400 focus-within:shadow-md transition-all">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search for jobs, companies, scholarships..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 pr-4 h-11 text-base rounded-full border-0 shadow-none focus-visible:ring-0 bg-transparent"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 h-11 rounded-full text-sm font-semibold"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Tab Bar */}
          <div className="flex justify-center mt-6 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Initial state (no query yet) ─────────── */}
          {!hasSearched && !loading && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Search for jobs, companies, scholarships, and career advice
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Start typing to search across all our resources or pick a popular search below
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularClick(term)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading ──────────────────────────────── */}
          {loading && (
            <div>
              <Skeleton className="h-4 w-48 mb-6 rounded" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Error ────────────────────────────────── */}
          {error && !loading && (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button
                onClick={() => performSearch(query, activeTab)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* ── No results ───────────────────────────── */}
          {!loading && !error && hasSearched && totalResults === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No results found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-gray-500 mb-6">
                Try different search terms or browse our categories
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularClick(term)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Results (activeTab === 'all') ────────── */}
          {!loading && !error && hasSearched && activeTab === 'all' && totalResults > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-6">
                Found <span className="font-semibold text-slate-800">{totalResults}</span>{' '}
                results for &ldquo;{query}&rdquo;
              </p>

              {/* Jobs Section */}
              {jobs.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                      Jobs
                      <span className="text-sm font-normal text-gray-400">
                        ({jobs.length})
                      </span>
                    </h2>
                    <button
                      onClick={() => handleTabChange('jobs')}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {jobs.slice(0, 5).map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.slug || job.id}`}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-700 transition-colors truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {job.company} &middot; {job.location}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full ${getTypeBadgeColor(job.type)}`}
                            >
                              {job.type}
                            </span>
                            {job.experienceLevel && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
                                {experienceLevelLabel(job.experienceLevel)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities Section */}
              {opportunities.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Award className="w-5 h-5" style={{ color: '#5B21B6' }} />
                      Opportunities
                      <span className="text-sm font-normal text-gray-400">
                        ({opportunities.length})
                      </span>
                    </h2>
                    <button
                      onClick={() => handleTabChange('opportunities')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {opportunities.slice(0, 4).map((opp) => (
                      <Link
                        key={opp.id}
                        href={`/opportunities/${opp.slug || opp.id}`}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${getOppTypeColor(opp.type)}`}
                            >
                              {opportunityTypeLabel(opp.type)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-slate-800 group-hover:text-purple-700 transition-colors line-clamp-2">
                            {opp.title}
                          </h3>
                          {opp.deadline && (
                            <p className="text-xs text-gray-400 mt-1">
                              Deadline:{' '}
                              {new Date(opp.deadline).toLocaleDateString('en-KE', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies Section */}
              {companies.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-teal-600" />
                      Companies
                      <span className="text-sm font-normal text-gray-400">
                        ({companies.length})
                      </span>
                    </h2>
                    <button
                      onClick={() => handleTabChange('companies')}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {companies.slice(0, 8).map((company) => (
                      <Link
                        key={company.id}
                        href={`/employers?id=${company.id}`}
                        className="flex flex-col items-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group text-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm mb-2 group-hover:scale-105 transition-transform">
                          {company.companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-xs text-slate-800 group-hover:text-teal-700 transition-colors truncate w-full">
                          {company.companyName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-1">
                          {orgTypeLabel(company.orgType)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles Section */}
              {articles.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                      Articles
                      <span className="text-sm font-normal text-gray-400">
                        ({articles.length})
                      </span>
                    </h2>
                    <button
                      onClick={() => handleTabChange('articles')}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {articles.slice(0, 4).map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug || article.id}`}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 inline-block mb-1">
                            {article.category}
                          </span>
                          <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(article.createdAt).toLocaleDateString('en-KE', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Results (single tab) ─────────────────── */}
          {!loading && !error && hasSearched && activeTab !== 'all' && totalResults > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-slate-800">{totalResults}</span>{' '}
                {activeTab === 'jobs'
                  ? 'jobs'
                  : activeTab === 'opportunities'
                    ? 'opportunities'
                    : activeTab === 'companies'
                      ? 'companies'
                      : 'articles'}{' '}
                found for &ldquo;{query}&rdquo;
              </p>

              {/* Jobs Tab Results */}
              {activeTab === 'jobs' && (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.slug || job.id}`}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-700 transition-colors truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {job.company} &middot; {job.location}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full ${getTypeBadgeColor(job.type)}`}
                          >
                            {job.type}
                          </span>
                          {job.experienceLevel && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
                              {experienceLevelLabel(job.experienceLevel)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Opportunities Tab Results */}
              {activeTab === 'opportunities' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opportunities.map((opp) => (
                    <Link
                      key={opp.id}
                      href={`/opportunities/${opp.slug || opp.id}`}
                      className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                      <Badge
                        variant="outline"
                        className={`text-[10px] mb-3 ${getOppTypeColor(opp.type)}`}
                      >
                        {opportunityTypeLabel(opp.type)}
                      </Badge>
                      <h3 className="font-semibold text-sm text-slate-800 group-hover:text-purple-700 transition-colors line-clamp-2 mb-2">
                        {opp.title}
                      </h3>
                      {opp.deadline && (
                        <p className="text-xs text-orange-600 font-medium">
                          Deadline:{' '}
                          {new Date(opp.deadline).toLocaleDateString('en-KE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Companies Tab Results */}
              {activeTab === 'companies' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {companies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/employers?id=${company.id}`}
                      className="flex flex-col items-center p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-base mb-3 group-hover:scale-105 transition-transform">
                        {company.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-700 transition-colors truncate w-full">
                        {company.companyName}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-2">
                        {orgTypeLabel(company.orgType)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Articles Tab Results */}
              {activeTab === 'articles' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug || article.id}`}
                      className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group overflow-hidden"
                    >
                      <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-400 -mx-5 -mt-5 mb-4" />
                      <Badge
                        variant="secondary"
                        className="text-[10px] mb-3 bg-teal-50 text-teal-700"
                      >
                        {article.category}
                      </Badge>
                      <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {new Date(article.createdAt).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Page export ────────────────────────────────────────
export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageInner />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
