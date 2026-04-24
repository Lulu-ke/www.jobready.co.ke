'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { X, Clock, ExternalLink, DollarSign, Globe, Award, Building2, Share2, Bookmark, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { opportunityTypeLabel, orgTypeLabel, getInitials } from '@/lib/helpers';
import AuthModal from '@/components/auth-modal';

interface OpportunityProvider {
  companyName: string;
  logoUrl?: string;
  orgType?: string;
  slug?: string;
  description?: string;
}

interface Opportunity {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  amount: string | number | null;
  deadline: string | null;
  link: string | null;
  provider?: OpportunityProvider | null;
}

interface OpportunityDetailSheetProps {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
}

function getLogoColor(name: string): string {
  const colors = [
    'from-purple-400 to-purple-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getTypeColor(type: string): string {
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

function getOrgTypeColor(orgType: string): string {
  const colors: Record<string, string> = {
    PRIVATE: 'bg-slate-100 text-slate-700',
    SMALL_BUSINESS: 'bg-blue-100 text-blue-700',
    STARTUP: 'bg-violet-100 text-violet-700',
    NGO: 'bg-emerald-100 text-emerald-700',
    INTERNATIONAL_ORG: 'bg-cyan-100 text-cyan-700',
    NATIONAL_GOV: 'bg-amber-100 text-amber-700',
    COUNTY_GOV: 'bg-orange-100 text-orange-700',
    STATE_CORPORATION: 'bg-rose-100 text-rose-700',
    EDUCATION: 'bg-indigo-100 text-indigo-700',
    FOUNDATION: 'bg-pink-100 text-pink-700',
    RELIGIOUS_ORG: 'bg-purple-100 text-purple-700',
  };
  return colors[orgType] || 'bg-gray-100 text-gray-700';
}

export default function OpportunityDetailSheet({ opportunity, open, onClose }: OpportunityDetailSheetProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingActionRef = useRef<'save' | 'unsave' | null>(null);

  // Check saved status when sheet opens or opportunity changes
  useEffect(() => {
    if (!open || !opportunity?.id || !session?.user?.id) return;

    const checkSaved = async () => {
      try {
        const res = await fetch('/api/saved-opportunities/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityIds: [opportunity.id] }),
        });
        const data = await res.json();
        setSaved(data.savedIds?.includes(opportunity.id) || false);
      } catch {
        // Silent fail
      }
    };
    checkSaved();
  }, [open, opportunity?.id, session?.user?.id]);

  const executeSave = useCallback(async () => {
    if (!opportunity?.id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });
      if (res.ok || res.status === 409) {
        setSaved(true);
        toast.success('Opportunity saved!');
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  }, [opportunity?.id]);

  const executeUnsave = useCallback(async () => {
    if (!opportunity?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/saved-opportunities?opportunityId=${opportunity.id}`, {
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
  }, [opportunity?.id]);

  const onSaveOpportunity = useCallback(() => {
    if (saved) {
      executeUnsave();
    } else if (!session?.user?.id) {
      pendingActionRef.current = 'save';
      setShowAuthModal(true);
    } else {
      executeSave();
    }
  }, [saved, session?.user?.id, executeSave, executeUnsave]);

  if (!opportunity) return null;

  const providerName = opportunity.provider?.companyName || 'Unknown Provider';
  const logoColor = getLogoColor(providerName);
  const initials = getInitials(providerName);

  const shareWhatsApp = () => {
    const text = `${opportunity.title} - ${opportunityTypeLabel(opportunity.type)}. Apply now on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0 [&>button]:hidden">
          {/* Sticky header */}
          <SheetHeader className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-base font-semibold text-gray-900 truncate flex-1 min-w-0">
                {opportunity.title}
              </SheetTitle>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-[8px]`}>
                {initials}
              </div>
              <span className="text-sm text-gray-500 truncate">{providerName}</span>
            </div>
          </SheetHeader>

          <div className="px-5 py-5 space-y-6">
            {/* Provider Info */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">{providerName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {opportunity.provider?.orgType && (
                    <Badge variant="outline" className={`text-[10px] ${getOrgTypeColor(opportunity.provider.orgType)}`}>
                      <Building2 className="w-2.5 h-2.5 mr-0.5" />
                      {orgTypeLabel(opportunity.provider.orgType)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Type Badge */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`text-[10px] ${getTypeColor(opportunity.type)}`}>
                <Award className="w-3 h-3 mr-1" />
                {opportunityTypeLabel(opportunity.type)}
              </Badge>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {opportunity.amount != null && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="text-sm font-semibold text-green-600 truncate">{String(opportunity.amount)}</p>
                  </div>
                </div>
              )}
              {opportunity.deadline && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Deadline</p>
                    <p className="text-sm font-semibold text-orange-600">
                      {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
              {opportunity.link && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">External Link</p>
                    <p className="text-sm font-semibold text-purple-600">Available</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {opportunity.description || 'No description available for this opportunity.'}
              </p>
            </div>

            {/* Provider Description */}
            {opportunity.provider?.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    About {providerName}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{opportunity.provider.description}</p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4">
              {opportunity.link && (
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-semibold"
                  onClick={() => window.open(opportunity.link!, '_blank', 'noopener,noreferrer')}
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 py-3 text-base"
                onClick={shareWhatsApp}
              >
                <Share2 className="w-4 h-4 mr-2 text-green-600" />
                Share via WhatsApp
              </Button>
            </div>

            {/* Bottom actions */}
            <div className="flex gap-2 pt-1 pb-4 border-t border-gray-100">
              <Button
                variant="ghost"
                className="flex-1 text-gray-500 hover:text-purple-600"
                onClick={onSaveOpportunity}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-purple-500 text-purple-500' : ''}`} />
                )}
                {saved ? 'Saved' : 'Save Opportunity'}
              </Button>
            </div>

            {/* View Full Page link */}
            <div className="pt-1 pb-4 border-t border-gray-100">
              <a
                href={`/opportunities/${opportunity.slug}`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                View Full Page
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal
        open={showAuthModal}
        onClose={() => { setShowAuthModal(false); pendingActionRef.current = null; }}
        onSuccess={() => {
          setShowAuthModal(false);
          if (pendingActionRef.current === 'save' && opportunity?.id) {
            executeSave();
          } else if (pendingActionRef.current === 'unsave' && opportunity?.id) {
            executeUnsave();
          }
          pendingActionRef.current = null;
        }}
        title="Save this opportunity"
        subtitle="Sign in to save opportunities and stay updated"
      />
    </>
  );
}
