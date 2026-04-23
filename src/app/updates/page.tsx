'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Calendar, ArrowRight, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import JobUpdateDetailSheet from '@/components/job-update-detail-sheet';
import NewsletterSection from '@/components/newsletter-section';

const UPDATE_TYPES = [
  { key: 'ALL', label: 'All Updates' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW_SCHEDULE', label: 'Interviews' },
  { key: 'CLOSING_EXTENDED', label: 'Extended' },
  { key: 'CORRIGENDUM', label: 'Corrigendum' },
  { key: 'GENERAL', label: 'General' },
] as const;

function getUpdateTypeBadge(type: string): string {
  const badges: Record<string, string> = {
    SHORTLISTED: 'bg-red-100 text-red-700 border-red-200',
    INTERVIEW_SCHEDULE: 'bg-purple-100 text-purple-700 border-purple-200',
    CLOSING_EXTENDED: 'bg-amber-100 text-amber-700 border-amber-200',
    CORRIGENDUM: 'bg-orange-100 text-orange-700 border-orange-200',
    GENERAL: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return badges[type] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getUpdateTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SHORTLISTED: 'Shortlisted',
    INTERVIEW_SCHEDULE: 'Interview Schedule',
    CLOSING_EXTENDED: 'Closing Extended',
    CORRIGENDUM: 'Corrigendum',
    GENERAL: 'Update',
  };
  return labels[type] || type;
}

interface JobUpdate {
  id: string;
  title: string;
  type: string;
  sourceName: string;
  sourceUrl?: string;
  content?: string;
  publishedAt: string;
}

interface JobUpdateDetail extends JobUpdate {
  content: string;
}

function UpdatesListSkeleton() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-lg" />
          <Skeleton className="h-5 w-80 mx-auto rounded-lg" />
        </div>
      </section>
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full shrink-0" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-1.5 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
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

function UpdatesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Sheet state
  const [selectedUpdate, setSelectedUpdate] = useState<JobUpdateDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUpdates = useCallback(async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (type !== 'ALL') params.set('type', type);
      const res = await fetch(`/api/updates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const mapped = (data.updates || []).map((u: Record<string, unknown>) => ({
        ...u,
        publishedAt: u.publishedAt || u.createdAt || '',
      }));
      setUpdates(mapped as JobUpdate[]);
    } catch (err) {
      setError('Failed to load updates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates(activeTab);
  }, [activeTab, fetchUpdates]);

  // Open detail sheet
  const openUpdateSheet = useCallback(async (update: JobUpdate) => {
    setSelectedUpdate(update as JobUpdateDetail);
    setDetailOpen(true);
    router.replace(`/updates?view=${update.id}`, { scroll: false });

    // Fetch full details
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/updates/${update.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.update) setSelectedUpdate(data.update);
      }
    } catch {
      // keep existing data
    } finally {
      setDetailLoading(false);
    }
  }, [router]);

  // Close detail sheet
  const closeUpdateSheet = useCallback(() => {
    setDetailOpen(false);
    router.back();
  }, [router]);

  // Listen for popstate (back button) to close sheet
  useEffect(() => {
    const handlePopState = () => {
      setDetailOpen(false);
      setSelectedUpdate(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-open sheet if ?view= is present on mount
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && !detailOpen) {
      const update = updates.find((u) => u.id === viewId);
      if (update) {
        openUpdateSheet(update);
      } else {
        // Fetch the update directly
        (async () => {
          try {
            setDetailLoading(true);
            setDetailOpen(true);
            const res = await fetch(`/api/updates/${viewId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.update) {
                setSelectedUpdate({
                  ...data.update,
                  publishedAt: data.update.publishedAt || data.update.createdAt || '',
                } as JobUpdateDetail);
              } else {
                setDetailOpen(false);
                router.replace('/updates', { scroll: false });
              }
            } else {
              setDetailOpen(false);
              router.replace('/updates', { scroll: false });
            }
          } catch {
            setDetailOpen(false);
            router.replace('/updates', { scroll: false });
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
            <Bell className="w-8 h-8 text-teal-600" />
            Job Updates
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Stay informed with the latest shortlists, interview schedules, deadline extensions, and important government job announcements
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {UPDATE_TYPES.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchUpdates(activeTab)} className="bg-teal-600 hover:bg-teal-700 text-white">
                Try Again
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="h-1.5 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && updates.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No updates yet</h3>
              <p className="text-gray-500">Check back soon for the latest job updates and announcements.</p>
            </div>
          )}

          {/* Updates Grid */}
          {!loading && !error && updates.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {updates.map((update, index) => (
                <motion.article
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer"
                  onClick={() => openUpdateSheet(update)}
                >
                  {/* Colored header bar */}
                  <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-400" />

                  <div className="p-5">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] mb-3 border ${getUpdateTypeBadge(update.type)}`}
                    >
                      {getUpdateTypeLabel(update.type)}
                    </Badge>

                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {update.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                      {update.content ? update.content.substring(0, 150) + (update.content.length > 150 ? '...' : '') : ''}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {update.sourceName}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(update.publishedAt).toLocaleDateString('en-KE', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterSection />

      {/* Job Update Detail Sheet */}
      <JobUpdateDetailSheet
        update={selectedUpdate}
        open={detailOpen}
        onClose={closeUpdateSheet}
      />
    </div>
  );
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<UpdatesListSkeleton />}>
        <UpdatesPageInner />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
