'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, Clock, ExternalLink, Award, Building2,
  DollarSign, Globe, Bookmark, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MobileNav from '@/components/mobile-nav';
import NewsletterSection from '@/components/newsletter-section';
import { opportunityTypeLabel, orgTypeLabel, getInitials } from '@/lib/helpers';

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

interface OpportunityDetailClientProps {
  opportunity: OpportunityDetail;
}

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

export default function OpportunityDetailClient({ opportunity }: OpportunityDetailClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const providerName = opportunity.provider?.companyName || 'Unknown Provider';
  const logoColor = getLogoColor(providerName);
  const initials = getInitials(providerName);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 -ml-2"
              onClick={() => router.push('/opportunities')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Opportunities
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header Card */}
          <Card className="rounded-2xl border border-gray-100 overflow-hidden mb-8">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 to-teal-500" />
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-start gap-4">
                {opportunity.provider && (
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className={`text-[10px] mb-2 ${getTypeColor(opportunity.type)}`}>
                    <Award className="w-3 h-3 mr-1" />
                    {opportunityTypeLabel(opportunity.type)}
                  </Badge>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{opportunity.title}</h1>
                  {opportunity.provider && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <Building2 className="w-4 h-4" />
                      {providerName}
                      {opportunity.provider.orgType && (
                        <Badge variant="outline" className="text-[10px] ml-2 text-gray-500">
                          {orgTypeLabel(opportunity.provider.orgType)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                {opportunity.amount != null && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-semibold text-green-600">{opportunity.amount}</p>
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
                      <p className="text-sm font-semibold text-orange-600" suppressHydrationWarning>
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
                      <p className="text-sm font-semibold text-purple-600 truncate">Available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Button */}
              {opportunity.link && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => window.open(opportunity.link!, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200"
                    onClick={() => setSaved(!saved)}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-purple-500 text-purple-500' : ''}`} />
                    {saved ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" className="border-gray-200">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="rounded-2xl border border-gray-100 mb-8">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {opportunity.description || 'No description available for this opportunity.'}
              </div>
            </CardContent>
          </Card>

          {/* Provider Info */}
          {opportunity.provider && opportunity.provider.description && (
            <Card className="rounded-2xl border border-gray-100">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  About {providerName}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{opportunity.provider.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <NewsletterSection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
