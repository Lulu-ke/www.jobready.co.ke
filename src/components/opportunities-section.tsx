'use client';

import { useRef } from 'react';
import { Award, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { opportunityTypeLabel } from '@/lib/helpers';
import Link from 'next/link';

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
  provider?: { id: string; companyName: string; logoUrl: string; orgType: string; slug: string } | null;
}

interface OpportunitiesSectionProps {
  opportunities: Opportunity[];
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    internship: 'bg-blue-50 text-blue-700 border-blue-200',
    sponsorship: 'bg-purple-50 text-purple-700 border-purple-200',
    bursary: 'bg-green-50 text-green-700 border-green-200',
    university_admission: 'bg-amber-50 text-amber-700 border-amber-200',
    scholarship: 'bg-violet-50 text-violet-700 border-violet-200',
    certification: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
}

const opportunityIcons: Record<string, { icon: React.ElementType; bg: string }> = {
  internship: { icon: Award, bg: 'bg-purple-100' },
  sponsorship: { icon: GraduationCapIcon, bg: 'bg-purple-100' },
  bursary: { icon: DollarIcon, bg: 'bg-green-100' },
  university_admission: { icon: BuildingIcon, bg: 'bg-amber-100' },
  scholarship: { icon: StarIcon, bg: 'bg-purple-100' },
  certification: { icon: ClipboardIcon, bg: 'bg-teal-100' },
  mentorship: { icon: UsersIcon, bg: 'bg-blue-100' },
  funding: { icon: DollarIcon, bg: 'bg-green-100' },
  bootcamp: { icon: CodeIcon, bg: 'bg-orange-100' },
};

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 10 3 12 0v-5" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export default function OpportunitiesSection({ opportunities }: OpportunitiesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="opportunities" className="scroll-mt-32 py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1E293B' }}>
            Opportunities Hub
          </h2>
          <Link
            href="/opportunities"
            className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors"
          >
            View all opportunities &rarr;
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors text-teal-600 hidden md:flex cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors text-teal-600 hidden md:flex cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-5 pb-4 hide-scrollbar scroll-smooth"
          >
            {opportunities.map((opp) => {
              const iconData = opportunityIcons[opp.type] || { icon: ClipboardIcon, bg: 'bg-gray-100' };
              const IconComp = iconData.icon;
              return (
                <div
                  key={opp.id}
                  className="group flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow no-underline cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${iconData.bg}`}>
                    <IconComp className="w-7 h-7" style={{ color: '#5B21B6' }} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                    {opp.description}
                  </p>

                  {opp.provider && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium text-gray-700">{opp.provider.companyName}</span>
                    </p>
                  )}
                  {opp.amount && (
                    <p className="text-xs font-medium text-green-600 mt-1">{opp.amount}</p>
                  )}
                  {opp.deadline && (
                    <p className="flex items-center justify-center gap-1 text-xs text-orange-600 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(opp.deadline), 'MMM d, yyyy')}
                    </p>
                  )}

                  {opp.link && (
                    <Button
                      size="sm"
                      className="w-full mt-4 text-white text-xs rounded-full"
                      style={{ backgroundColor: '#5B21B6' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(opp.link!, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      Apply <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
