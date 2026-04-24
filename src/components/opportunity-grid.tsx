'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, GraduationCap, Users, Star, DollarSign, Monitor } from 'lucide-react';

const hubCategories = [
  {
    type: 'internship',
    label: 'Internships',
    description: 'Paid & unpaid internship placements across Kenya and beyond.',
    Icon: Users,
    color: '#0D9488',
    bgColor: '#F0FDFA',
  },
  {
    type: 'sponsorship',
    label: 'Sponsorships',
    description: 'Training, conference, and event sponsorships.',
    Icon: Users,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  {
    type: 'bursary',
    label: 'Bursaries',
    description: 'Financial aid for students in need of tuition support.',
    Icon: DollarSign,
    color: '#EA580C',
    bgColor: '#FFF7ED',
  },
  {
    type: 'university_admission',
    label: 'University Admissions',
    description: 'Admissions, application deadlines & guidance.',
    Icon: GraduationCap,
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    type: 'certification',
    label: 'Bootcamps',
    description: 'Intensive coding and skills bootcamps.',
    Icon: Monitor,
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
  {
    type: 'bursary',
    label: 'Mentorship',
    description: 'Connect with industry experts for career guidance.',
    Icon: Star,
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    type: 'scholarship',
    label: 'Scholarships',
    description: 'Fully funded & partial scholarships for Kenyan students.',
    Icon: GraduationCap,
    color: '#5B21B6',
    bgColor: '#FAF5FF',
  },
  {
    type: 'certification',
    label: 'Certifications',
    description: 'Professional certification programmes & sponsorships.',
    Icon: Star,
    color: '#0891B2',
    bgColor: '#ECFEFF',
  },
  {
    type: 'sponsorship',
    label: 'Funding',
    description: 'Grants, seed capital & research funding opportunities.',
    Icon: DollarSign,
    color: '#CA8A04',
    bgColor: '#FEFCE8',
  },
];

interface OpportunityGridProps {
  opportunities: Array<{ type: string }>;
  onOpportunityClick?: (opp: any) => void;
}

export default function OpportunityGrid({ opportunities, onOpportunityClick }: OpportunityGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  // Count opportunities by type
  const typeCounts: Record<string, number> = {};
  if (opportunities) {
    for (const opp of opportunities) {
      const t = opp.type || '';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  }

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1E293B' }}>
            Opportunities Hub
          </h2>
          <Link
            href="/opportunities"
            className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
          >
            View all opportunities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative">
          {/* Left chevron */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors text-teal-600 hidden md:block cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-5 pb-4 hide-scrollbar scroll-smooth"
          >
            {hubCategories.map((cat) => {
              const count = typeCounts[cat.type] || 0;
              return (
                <Link
                  key={cat.label}
                  href={`/opportunities?type=${cat.type}`}
                  className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow no-underline group"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: cat.bgColor }}
                  >
                    <cat.Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    {cat.label}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                  {count > 0 && (
                    <span
                      className="inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      {count} {count === 1 ? 'opportunity' : 'opportunities'}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right chevron */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors text-teal-600 hidden md:block cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
