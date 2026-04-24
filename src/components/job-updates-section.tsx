'use client';

import { Megaphone, Building2, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface JobUpdate {
  id: string;
  title: string;
  type: string;
  sourceName: string;
  sourceUrl?: string;
  content?: string;
  publishedAt: string;
}

interface JobUpdatesSectionProps {
  updates: JobUpdate[];
  onUpdateClick?: (update: JobUpdate) => void;
}

function getUpdateTypeBadge(type: string): string {
  const badges: Record<string, string> = {
    SHORTLISTED: 'bg-red-100 text-red-700 border-red-200',
    INTERVIEW_SCHEDULE: 'bg-purple-100 text-purple-700 border-purple-200',
    CLOSING_EXTENDED: 'bg-amber-100 text-amber-700 border-amber-200',
    CORRIGENDUM: 'bg-orange-100 text-orange-700 border-orange-200',
    GENERAL: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return badges[type] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getUpdateTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SHORTLISTED: 'Shortlisted',
    INTERVIEW_SCHEDULE: 'Interview Schedule',
    CLOSING_EXTENDED: 'Closing Extended',
    CORRIGENDUM: 'Corrigendum',
    GENERAL: 'Update',
  };
  return labels[type] || type;
}

export default function JobUpdatesSection({ updates, onUpdateClick }: JobUpdatesSectionProps) {
  if (!updates || updates.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl md:text-2xl font-bold flex items-center gap-2"
              style={{ color: '#1E293B' }}
            >
              <Megaphone className="w-6 h-6" style={{ color: '#5B21B6' }} />
              Latest Job Updates
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Shortlisted candidates, interview schedules, and recruitment announcements
            </p>
          </div>
          <Link
            href="/updates"
            className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            View All Updates
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {updates.map((update) => {
            const timeAgo = (() => {
              try {
                return formatDistanceToNow(new Date(update.publishedAt), { addSuffix: true });
              } catch {
                return 'Recently';
              }
            })();

            return (
              <div
                key={update.id}
                onClick={() => onUpdateClick?.(update)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-5 flex flex-col gap-3"
              >
                {/* Type Badge */}
                <span
                  className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getUpdateTypeBadge(update.type)}`}
                >
                  {getUpdateTypeLabel(update.type)}
                </span>

                {/* Title */}
                <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm leading-snug">
                  {update.title}
                </h3>

                {/* Source & Date */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {update.sourceName}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo}
                    </span>
                  </div>
                  {update.sourceUrl && (
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
