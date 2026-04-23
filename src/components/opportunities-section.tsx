'use client';

import { useRef } from 'react';
import { Award, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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

const opportunityIcons: Record<string, { icon: string; bg: string }> = {
  internship: { icon: '💼', bg: 'bg-blue-50' },
  sponsorship: { icon: '🎓', bg: 'bg-purple-50' },
  bursary: { icon: '💰', bg: 'bg-green-50' },
  university_admission: { icon: '🏛️', bg: 'bg-amber-50' },
  scholarship: { icon: '🏆', bg: 'bg-violet-50' },
  certification: { icon: '📋', bg: 'bg-orange-50' },
};

export default function OpportunitiesSection({ opportunities }: OpportunitiesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="opportunities" className="scroll-mt-20 py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-7 h-7" style={{ color: 'rgb(91, 33, 182)' }} />
              Opportunities Hub
            </h2>
            <p className="text-gray-500 mt-1">
              {opportunities.length} funding opportunities for Kenyan students
            </p>
          </div>
          <a
            href="/opportunities"
            className="hidden sm:flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'rgb(91, 33, 182)' }}
          >
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto hide-scrollbar carousel-scroll pb-2"
          >
            {opportunities.map((opp) => {
              const iconData = opportunityIcons[opp.type] || { icon: '📋', bg: 'bg-gray-50' };
              return (
                <div
                  key={opp.id}
                  className="group flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-5 text-center border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                >
                  <div className={`w-14 h-14 rounded-full ${iconData.bg} flex items-center justify-center mx-auto mb-3 text-2xl`}>
                    {iconData.icon}
                  </div>
                  <Badge variant="outline" className={`text-[10px] mb-2 ${getTypeColor(opp.type)}`}>
                    {opportunityTypeLabel(opp.type)}
                  </Badge>
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2 text-sm">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{opp.description}</p>

                  <div className="space-y-1.5 text-xs">
                    {opp.provider && (
                      <p className="text-gray-500">
                        <span className="font-medium text-gray-700">{opp.provider.companyName}</span>
                      </p>
                    )}
                    {opp.amount && (
                      <p className="font-medium text-green-600">{opp.amount}</p>
                    )}
                    {opp.deadline && (
                      <p className="flex items-center justify-center gap-1 text-orange-600">
                        <Clock className="w-3 h-3" />
                        {format(new Date(opp.deadline), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  {opp.link && (
                    <Button
                      size="sm"
                      className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                      onClick={() => window.open(opp.link!, '_blank', 'noopener,noreferrer')}
                    >
                      Apply <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View All link */}
        <div className="mt-4 text-center sm:hidden">
          <a
            href="/opportunities"
            className="text-sm font-medium"
            style={{ color: 'rgb(91, 33, 182)' }}
          >
            View All Opportunities →
          </a>
        </div>
      </div>
    </section>
  );
}
