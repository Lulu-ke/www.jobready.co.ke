'use client';

import { Building2 } from 'lucide-react';
import { orgTypeLabel } from '@/lib/helpers';

interface Employer {
  id: string;
  companyName: string;
  logoUrl: string;
  orgType: string;
  slug: string;
}

interface EmployerMarqueeProps {
  employers: Employer[];
}

function getLogoColor(name: string): string {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-green-400 to-green-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function EmployerMarquee({ employers }: EmployerMarqueeProps) {
  const doubled = [...employers, ...employers];

  return (
    <section className="py-10 lg:py-12 overflow-hidden border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-600 flex items-center justify-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            Trusted by Kenya&apos;s Top Employers
          </h2>
        </div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50/80 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {doubled.map((emp, index) => {
            const color = getLogoColor(emp.companyName);
            return (
              <div
                key={`${emp.id}-${index}`}
                className="flex items-center gap-3 px-6 shrink-0"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs`}>
                  {emp.logoUrl || emp.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div className="whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-600">{emp.companyName}</p>
                  <p className="text-xs text-gray-400">{orgTypeLabel(emp.orgType)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
