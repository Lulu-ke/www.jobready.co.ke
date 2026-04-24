'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { X, MapPin, DollarSign, Clock, Building2, Wifi, ExternalLink, Bookmark, Share2, ChevronRight, TrendingUp, Building, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { experienceLevelLabel, orgTypeLabel } from '@/lib/helpers';
import AuthModal from '@/components/auth-modal';

interface Job {
  id: string;
  title: string;
  slug?: string;
  company: string;
  logo: string;
  currency?: string;
  location: string;
  county: string;
  type: string;
  category: { id: string; name: string; slug: string } | string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFormatted: string;
  description: string;
  howToApply: string;
  isRemote: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  experienceLevel?: string;
  closingDate: string | null;
  postedAt: string;
  employer?: { id: string; companyName: string; logoUrl: string; orgType: string; slug: string; description?: string } | null;
}

interface JobDetailSheetProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onJobClick: (job: Job) => void;
  relatedJobs: Job[];
}

function getLogoColor(name: string | null | undefined): string {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getExperienceLevelColor(level: string): string {
  const colors: Record<string, string> = {
    entry: 'bg-teal-50 text-teal-700 border-teal-200',
    internship: 'bg-purple-50 text-purple-700 border-purple-200',
    casual: 'bg-gray-50 text-gray-700 border-gray-200',
    mid: 'bg-amber-50 text-amber-700 border-amber-200',
    senior: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return colors[level] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function getCategoryName(category: Job['category']): string {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category.name;
}

function getOrgTypeColor(orgType: string): string {
  const colors: Record<string, string> = {
    PRIVATE: 'bg-slate-50 text-slate-700 border-slate-200',
    SMALL_BUSINESS: 'bg-blue-50 text-blue-700 border-blue-200',
    STARTUP: 'bg-violet-50 text-violet-700 border-violet-200',
    NGO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INTERNATIONAL_ORG: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    NATIONAL_GOV: 'bg-amber-50 text-amber-700 border-amber-200',
    COUNTY_GOV: 'bg-orange-50 text-orange-700 border-orange-200',
    STATE_CORPORATION: 'bg-rose-50 text-rose-700 border-rose-200',
    EDUCATION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    FOUNDATION: 'bg-pink-50 text-pink-700 border-pink-200',
    RELIGIOUS_ORG: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return colors[orgType] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export default function JobDetailSheet({ job, open, onClose, onJobClick, relatedJobs }: JobDetailSheetProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingActionRef = useRef<'save' | 'unsave' | null>(null);

  // Check saved status when sheet opens or job changes
  useEffect(() => {
    if (!open || !job?.id || !session?.user?.id) return;

    const checkSaved = async () => {
      try {
        const res = await fetch('/api/saved-jobs/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobIds: [job.id] }),
        });
        const data = await res.json();
        setSaved(data.savedIds?.includes(job.id) || false);
      } catch {
        // Silent fail
      }
    };
    checkSaved();
  }, [open, job?.id, session?.user?.id]);

  const executeSave = useCallback(async () => {
    if (!job?.id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok || res.status === 409) {
        setSaved(true);
        toast.success('Job saved!');
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  }, [job?.id]);

  const executeUnsave = useCallback(async () => {
    if (!job?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/saved-jobs?jobId=${job.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSaved(false);
        toast.success('Removed from saved items');
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  }, [job?.id]);

  const onSaveJob = useCallback(() => {
    if (saved) {
      executeUnsave();
    } else if (!session?.user?.id) {
      pendingActionRef.current = 'save';
      setShowAuthModal(true);
    } else {
      executeSave();
    }
  }, [saved, session?.user?.id, executeSave, executeUnsave]);

  if (!job) return null;

  const logoColor = getLogoColor(job.company);
  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true });
  const categoryName = getCategoryName(job.category);

  const shareWhatsApp = () => {
    const text = `${job.title} at ${job.company} in ${job.location}. Salary: ${job.salaryFormatted}. Apply now on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0 [&>button]:hidden bg-white">
          {/* Sticky header */}
          <SheetHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-base font-semibold text-slate-800 truncate flex-1 min-w-0">
                {job.title}
              </SheetTitle>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 rounded-full border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-[8px]`}>
                {job.logo || (job.company ? job.company.substring(0, 2).toUpperCase() : '??')}
              </div>
              <span className="text-sm text-gray-500 truncate">{job.company || 'Unknown'} &middot; {job.location}</span>
            </div>
          </SheetHeader>

          <div className="px-5 py-5 space-y-5">
            {/* Company Info */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                {job.logo || (job.company ? job.company.substring(0, 2).toUpperCase() : '??')}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800">{job.company || 'Unknown Company'}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {job.employer?.orgType && (
                    <Badge variant="outline" className={`text-[10px] ${getOrgTypeColor(job.employer.orgType)}`}>
                      <Building className="w-2.5 h-2.5 mr-0.5" />
                      {orgTypeLabel(job.employer.orgType)}
                    </Badge>
                  )}
                  {categoryName && (
                    <span className="text-sm text-gray-500">{categoryName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-slate-800 truncate">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Salary</p>
                  <p className="text-sm font-medium text-slate-800 truncate">{job.salaryFormatted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-medium text-slate-800">{job.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Posted</p>
                  <p className="text-sm font-medium text-slate-800">{timeAgo}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {categoryName && (
                <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50">
                  {categoryName}
                </Badge>
              )}
              {job.experienceLevel && (
                <Badge variant="outline" className={`${getExperienceLevelColor(job.experienceLevel)}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {experienceLevelLabel(job.experienceLevel)}
                </Badge>
              )}
              {job.isRemote && (
                <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">
                  <Wifi className="w-3 h-3 mr-1" /> Remote Friendly
                </Badge>
              )}
              {job.isUrgent && (
                <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 animate-pulse-badge">
                  Urgent Hiring
                </Badge>
              )}
              {job.closingDate && (
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                  Closes {format(new Date(job.closingDate), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">Job Description</h4>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</div>
            </div>

            {/* How to Apply */}
            <div className="bg-teal-50/30 rounded-xl border border-teal-200 p-5">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">How to Apply</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{job.howToApply}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1 pb-2">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-semibold rounded-xl">
                Apply Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-3 text-base rounded-xl border-gray-200"
                onClick={shareWhatsApp}
              >
                <Share2 className="w-4 h-4 mr-2 text-green-600" />
                Share via WhatsApp
              </Button>
            </div>

            {/* Save */}
            <div className="flex gap-2 pb-2">
              <Button
                variant="ghost"
                className="flex-1 text-gray-500 hover:text-teal-600"
                onClick={onSaveJob}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-teal-500 text-teal-500' : ''}`} />
                )}
                {saved ? 'Saved' : 'Save Job'}
              </Button>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-4 text-sm">Similar Jobs</h4>
                <div className="space-y-2">
                  {relatedJobs.slice(0, 3).map((rj) => (
                    <div
                      key={rj.id}
                      onClick={() => onJobClick(rj)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getLogoColor(rj.company)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                        {rj.logo || (rj.company ? rj.company.substring(0, 2).toUpperCase() : '??')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{rj.title}</p>
                        <p className="text-xs text-gray-500">{rj.company || 'Unknown'} &middot; {rj.location}</p>
                      </div>
                      <span className="text-xs text-teal-600 font-medium shrink-0">{rj.salaryFormatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal
        open={showAuthModal}
        onClose={() => { setShowAuthModal(false); pendingActionRef.current = null; }}
        onSuccess={() => {
          setShowAuthModal(false);
          if (pendingActionRef.current === 'save' && job?.id) {
            executeSave();
          } else if (pendingActionRef.current === 'unsave' && job?.id) {
            executeUnsave();
          }
          pendingActionRef.current = null;
        }}
        title="Save this job"
        subtitle="Sign in to save jobs and track your applications"
      />
    </>
  );
}
