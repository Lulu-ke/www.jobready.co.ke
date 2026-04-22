'use client';

import { Building2 } from 'lucide-react';

interface Employer {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
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
  // Double the array for seamless loop
  const doubled = [...employers, ...employers];

  return (
    <section className="py-12 lg:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Building2 className="w-7 h-7 text-teal-600" />
            Trusted by Kenya&apos;s Top Employers
          </h2>
          <p className="text-gray-500 mt-1">
            Jobs from verified companies across all industries
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex animate-marquee">
          {doubled.map((emp, index) => {
            const color = getLogoColor(emp.name);
            return (
              <div
                key={`${emp.id}-${index}`}
                className="flex items-center gap-3 px-6 shrink-0"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs`}>
                  {emp.logo || emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-700">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.industry}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
