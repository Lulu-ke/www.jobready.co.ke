'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Award, Clock, ExternalLink, Loader2, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import OpportunityDetailSheet from '@/components/opportunity-detail-sheet';
import NewsletterSection from '@/components/newsletter-section';
import { opportunityTypeLabel } from '@/lib/helpers';

interface Opportunity {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  amount: string | null;
  deadline: string | null;
  link: string | null;
  isActive: boolean;
  views: number;
  provider?: { id: string; companyName: string; logoUrl: string; orgType: string; slug: string; description?: string } | null;
  providerName?: string | null;
  providerLogo?: string | null;
}

interface OpportunityDetail extends Opportunity {
  provider?: { id: string; companyName: string; logoUrl: string; orgType: string; slug: string; description?: string } | null;
}

const typeFilters = [
  { value: '', label: 'All' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'internship', label: 'Internship' },
  { value: 'bursary', label: 'Bursary' },
  { value: 'certification', label: 'Certification' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'university_admission', label: 'University Admission' },
];

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    internship: 'bg-blue-100 text-blue-700 border-blue-200',
    sponsorship: 'bg-purple-100 text-purple-700 border-purple-200',
    bursary: 'bg-green-100 text-green-700 border-green-200',
    university_admission: 'bg-amber-100 text-amber-700 border-amber-200',
    scholarship: 'bg-violet-100 text-violet-700 border-violet-200',
    certification: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function OpportunitiesListSkeleton() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-lg" />
          <Skeleton className="h-5 w-80 mx-auto mb-8 rounded-lg" />
          <div className="max-w-md mx-auto">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </section>
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-gray-100">
                <Skeleton className="h-5 w-24 mb-3 rounded-full" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-9 w-full mt-4 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function OpportunitiesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpps, setFilteredOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState('');
  const [search, setSearch] = useState('');

  // Sheet state
  const [selectedOpp, setSelectedOpp] = useState<OpportunityDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/opportunities');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      } catch (err) {
        setError('Failed to load opportunities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  useEffect(() => {
    let filtered = opportunities;
    if (activeType) {
      filtered = filtered.filter((o) => o.type === activeType);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q) ||
          o.providerName?.toLowerCase().includes(q)
      );
    }
    setFilteredOpps(filtered);
  }, [opportunities, activeType, search]);

  const pathname = usePathname();
  const sheetOpenRef = useRef(false);

  // Open detail sheet
  const openOppSheet = useCallback(async (opp: Opportunity) => {
    setSelectedOpp(opp);
    setDetailOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=${opp.id}`, { scroll: false });

    // Fetch full details
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opp.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.opportunity) setSelectedOpp(data.opportunity);
      }
    } catch {
      // keep existing data
    } finally {
      setDetailLoading(false);
    }
  }, [router, pathname]);

  // Close detail sheet — stay on the current page
  const closeOppSheet = useCallback(() => {
    setDetailOpen(false);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Listen for popstate (back button) to close sheet
  useEffect(() => {
    const handlePopState = () => {
      if (sheetOpenRef.current) {
        sheetOpenRef.current = false;
        setDetailOpen(false);
        setSelectedOpp(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-open sheet if ?view= is present on mount
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && !detailOpen) {
      const opp = opportunities.find((o) => o.id === viewId);
      if (opp) {
        openOppSheet(opp);
      } else {
        // Fetch the opportunity directly
        (async () => {
          try {
            setDetailLoading(true);
            setDetailOpen(true);
            const res = await fetch(`/api/opportunities/${viewId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.opportunity) {
                setSelectedOpp(data.opportunity);
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

  return (
    <div className="flex-1">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
            <Award className="w-8 h-8" style={{ color: 'rgb(91, 33, 182)' }} />
            Opportunities &amp; Funding
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            Scholarships, internships, bursaries, and more for Kenyan students and professionals
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm p-1.5 focus-within:border-purple-400 focus-within:shadow-md transition-all">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 h-11 text-base rounded-full border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 h-11 rounded-full text-sm font-semibold">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {typeFilters.map((tf) => (
              <Button
                key={tf.value}
                variant={activeType === tf.value ? 'default' : 'outline'}
                className={
                  activeType === tf.value
                    ? 'bg-purple-600 hover:bg-purple-700 text-white text-sm'
                    : 'border-gray-200 text-gray-600 hover:text-purple-600 text-sm'
                }
                onClick={() => setActiveType(tf.value)}
              >
                {tf.label}
              </Button>
            ))}
          </div>

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700 text-white">
                Try Again
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-gray-100">
                  <Skeleton className="h-5 w-24 mb-3 rounded-full" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-9 w-full mt-4 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredOpps.length === 0 && (
            <div className="text-center py-16">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button
                onClick={() => {
                  setActiveType('');
                  setSearch('');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filteredOpps.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="group p-5 rounded-xl shadow-sm border border-gray-100 bg-white hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => openOppSheet(opp)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`text-[10px] ${getTypeColor(opp.type)}`}>
                      {opportunityTypeLabel(opp.type)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                    {opp.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{opp.description}</p>

                  <div className="space-y-2 text-xs">
                    {(opp.provider?.companyName || opp.providerName) && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Provider:</span>
                        <span className="font-medium text-gray-700">
                          {opp.provider?.companyName || opp.providerName}
                        </span>
                      </div>
                    )}
                    {opp.amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium text-green-600">{opp.amount}</span>
                      </div>
                    )}
                    {opp.deadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deadline:
                        </span>
                        <span className="font-medium text-orange-600">
                          {new Date(opp.deadline).toLocaleDateString('en-KE', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {opp.link && (
                    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
                        onClick={() => window.open(opp.link!, '_blank', 'noopener,noreferrer')}
                      >
                        Apply <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterSection />

      {/* Opportunity Detail Sheet */}
      <OpportunityDetailSheet
        opportunity={selectedOpp}
        open={detailOpen}
        onClose={closeOppSheet}
      />
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<OpportunitiesListSkeleton />}>
        <OpportunitiesPageInner />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
