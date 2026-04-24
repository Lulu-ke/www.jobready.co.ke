'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Clock,
  ExternalLink,
  Award,
  Building2,
  DollarSign,
  Globe,
  Bookmark,
  Share2,
  ChevronRight,
  FilePenLine,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import NewsletterSection from '@/components/newsletter-section';
import AdSlot from '@/components/ad-slot';
import { opportunityTypeLabel, orgTypeLabel, getInitials } from '@/lib/helpers';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface OpportunityProvider {
  id: string;
  companyName: string;
  logoUrl: string | null;
  orgType: string;
  slug: string;
  description: string | null;
}

interface OpportunityDetail {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  amount: number | null;
  deadline: string | null;
  link: string | null;
  isActive: boolean;
  views: number;
  createdAt: string;
  provider: OpportunityProvider | null;
}

interface RelatedOpportunity {
  id: string;
  title: string;
  slug: string;
  type: string;
  deadline: string | null;
  provider: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    orgType: string;
    slug: string;
  } | null;
}

interface OpportunityDetailClientProps {
  opportunity: OpportunityDetail;
  relatedOpportunities: RelatedOpportunity[];
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

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

function getLogoGradient(name: string): string {
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

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function OpportunityDetailClient({
  opportunity,
  relatedOpportunities,
}: OpportunityDetailClientProps) {
  const [saved, setSaved] = useState(false);

  const providerName = opportunity.provider?.companyName || 'Unknown Provider';
  const logoGradient = getLogoGradient(providerName);
  const initials = getInitials(providerName);
  const typeLabel = opportunityTypeLabel(opportunity.type);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: opportunity.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50/50">
        {/* Breadcrumb bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/opportunities">Opportunities</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/opportunities?type=${opportunity.type}`}>
                      {typeLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] sm:max-w-xs truncate">
                    {opportunity.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Main two-column grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* ─── LEFT COLUMN (2/3) ─────────────────────────────────── */}
            <div className="md:col-span-2 space-y-6">
              {/* Opportunity Header Card */}
              <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-purple-500 to-teal-500" />
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-start gap-4">
                    {opportunity.provider && (
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${logoGradient} flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden`}
                      >
                        {opportunity.provider.logoUrl ? (
                          <img
                            src={opportunity.provider.logoUrl}
                            alt={providerName}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] mb-2 ${getTypeColor(opportunity.type)}`}
                      >
                        <Award className="w-3 h-3 mr-1" />
                        {typeLabel}
                      </Badge>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                        {opportunity.title}
                      </h1>
                      {opportunity.provider && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <Building2 className="w-4 h-4" />
                          {providerName}
                          {opportunity.provider.orgType && (
                            <Badge
                              variant="outline"
                              className="text-[10px] ml-2 text-gray-500"
                            >
                              {orgTypeLabel(opportunity.provider.orgType)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                    {opportunity.amount != null && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-semibold text-green-600">
                            {opportunity.amount}
                          </p>
                        </div>
                      </div>
                    )}
                    {opportunity.deadline && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Deadline</p>
                          <p
                            className="text-sm font-semibold text-orange-600"
                            suppressHydrationWarning
                          >
                            {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                    {opportunity.link && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">External Link</p>
                          <p className="text-sm font-semibold text-purple-600 truncate">
                            Available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {opportunity.link && (
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() =>
                          window.open(opportunity.link!, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Apply Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-gray-200"
                      onClick={() => setSaved(!saved)}
                    >
                      <Bookmark
                        className={`w-4 h-4 mr-2 ${saved ? 'fill-purple-500 text-purple-500' : ''}`}
                      />
                      {saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-200"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {opportunity.description ||
                      'No description available for this opportunity.'}
                  </div>
                </CardContent>
              </Card>

              {/* How to Apply Card (if external link) */}
              {opportunity.link && (
                <Card className="rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-teal-50 to-white">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          How to Apply
                        </h2>
                        <p className="text-xs text-gray-500">
                          Click the button below to apply externally
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      This opportunity is hosted on an external platform. You will be
                      redirected to the provider&apos;s website to complete your application.
                    </p>
                    <Button
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() =>
                        window.open(opportunity.link!, '_blank', 'noopener,noreferrer')
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Apply on Provider Website
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ─── RIGHT SIDEBAR (1/3) ───────────────────────────────── */}
            <div className="space-y-6">
              {/* Ad Slot 1 */}
              <AdSlot slot="sidebar-1" />

              {/* Provider Card */}
              {opportunity.provider && (
                <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${logoGradient} flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden`}
                      >
                        {opportunity.provider.logoUrl ? (
                          <img
                            src={opportunity.provider.logoUrl}
                            alt={providerName}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {providerName}
                        </h3>
                        {opportunity.provider.orgType && (
                          <p className="text-xs text-gray-500">
                            {orgTypeLabel(opportunity.provider.orgType)}
                          </p>
                        )}
                      </div>
                    </div>
                    {opportunity.provider.description && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {opportunity.provider.description}
                      </p>
                    )}
                    <Link
                      href={`/companies/${opportunity.provider.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      View all jobs
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Related Opportunities */}
              {relatedOpportunities.length > 0 && (
                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 text-sm mb-4">
                      More {typeLabel} Opportunities
                    </h3>
                    <div className="space-y-3">
                      {relatedOpportunities.map((related) => (
                        <Link
                          key={related.id}
                          href={`/opportunities/${related.slug}`}
                          className="block group"
                        >
                          <div className="p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1">
                              {related.title}
                            </h4>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-gray-500 truncate">
                                {related.provider?.companyName || 'Unknown'}
                              </span>
                              {related.deadline && (
                                <span className="text-xs text-gray-400 shrink-0" suppressHydrationWarning>
                                  {format(new Date(related.deadline), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <Link
                      href={`/opportunities?type=${opportunity.type}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      View all {typeLabel.toLowerCase()}s
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Ad Slot 2 */}
              <AdSlot slot="sidebar-2" />

              {/* CV Writing CTA Card */}
              <Card className="rounded-2xl border-2 border-purple-200 shadow-sm overflow-hidden bg-gradient-to-br from-purple-50 via-white to-teal-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FilePenLine className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Need a Professional CV?
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Stand out from hundreds of applicants. Our expert writers craft
                    ATS-optimized CVs that impress Kenyan recruiters.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>92% interview success rate</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>From KSh 500 — Fast delivery</span>
                    </div>
                  </div>
                  <Link
                    href="/cv-services"
                    className="mt-4 block w-full text-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                  >
                    Get Your CV Now
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
