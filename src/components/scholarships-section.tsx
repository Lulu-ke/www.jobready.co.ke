'use client';

import { Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string;
  deadline: string | null;
  amount: string | null;
  level: string;
  isFeatured: boolean;
}

interface ScholarshipsSectionProps {
  scholarships: Scholarship[];
}

export default function ScholarshipsSection({ scholarships }: ScholarshipsSectionProps) {
  const displayScholarships = scholarships.slice(0, 6);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Undergraduate': 'bg-green-100 text-green-700',
      'Masters': 'bg-blue-100 text-blue-700',
      'Professional': 'bg-purple-100 text-purple-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <section id="scholarships" className="scroll-mt-20 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-purple-600" />
              Scholarships &amp; Funding
            </h2>
            <p className="text-gray-500 mt-1">
              {scholarships.length} funding opportunities for Kenyan students
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayScholarships.map((sch) => (
            <div
              key={sch.id}
              className="group p-5 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-lg hover:shadow-purple-900/5 transition-all duration-300 cursor-pointer"
            >
              {sch.isFeatured && (
                <Badge className="bg-purple-100 text-purple-700 text-[10px] mb-3">
                  <Award className="w-3 h-3 mr-1" /> Featured
                </Badge>
              )}
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                {sch.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{sch.description}</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Provider:</span>
                  <span className="font-medium text-gray-700">{sch.provider}</span>
                </div>
                {sch.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-green-600">{sch.amount}</span>
                  </div>
                )}
                {sch.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Deadline:
                    </span>
                    <span className="font-medium text-orange-600">
                      {format(new Date(sch.deadline), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Level:</span>
                  <Badge variant="outline" className={`text-[10px] ${getLevelColor(sch.level)}`}>
                    {sch.level}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
