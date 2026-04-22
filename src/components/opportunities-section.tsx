'use client';

import { Award, Clock, ExternalLink } from 'lucide-react';
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
    internship: 'bg-blue-100 text-blue-700',
    sponsorship: 'bg-purple-100 text-purple-700',
    bursary: 'bg-green-100 text-green-700',
    university_admission: 'bg-amber-100 text-amber-700',
    scholarship: 'bg-violet-100 text-violet-700',
    certification: 'bg-orange-100 text-orange-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

export default function OpportunitiesSection({ opportunities }: OpportunitiesSectionProps) {
  const displayOpportunities = opportunities.slice(0, 6);

  return (
    <section id="opportunities" className="scroll-mt-20 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-purple-600" />
              Opportunities &amp; Funding
            </h2>
            <p className="text-gray-500 mt-1">
              {opportunities.length} funding opportunities for Kenyan students
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="group p-5 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-lg hover:shadow-purple-900/5 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={`text-[10px] ${getTypeColor(opp.type)}`}>
                  {opportunityTypeLabel(opp.type)}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                {opp.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{opp.description}</p>

              <div className="space-y-2 text-xs">
                {opp.provider && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Provider:</span>
                    <span className="font-medium text-gray-700">{opp.provider.companyName}</span>
                  </div>
                )}
                {opp.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-green-600">{opp.amount}</span>
                  </div>
                )}
                {opp.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Deadline:
                    </span>
                    <span className="font-medium text-orange-600">
                      {format(new Date(opp.deadline), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              {opp.link && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    onClick={() => window.open(opp.link!, '_blank', 'noopener,noreferrer')}
                  >
                    Apply <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
