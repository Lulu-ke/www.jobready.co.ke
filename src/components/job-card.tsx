'use client';

import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign, Building2, Wifi, Star, Zap, Bookmark, Share2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { experienceLevelLabel } from '@/lib/helpers';

export interface Job {
  id: string;
  title: string;
  slug?: string;
  company: string;
  logo: string;
  currency?: string;
  location: string;
  county: string;
  type: string;
  category: { id: string; name: string; slug: string } | string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFormatted: string;
  description: string;
  requirements: string;
  howToApply: string;
  isRemote: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  experienceLevel?: string;
  closingDate: string | null;
  postedAt: string;
  employer?: { id: string; companyName: string; logoUrl: string; orgType: string; slug: string; description?: string } | null;
}

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

function getLogoColor(name: string): string {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'Full-Time': 'bg-green-50 text-green-700',
    'Part-Time': 'bg-blue-50 text-blue-700',
    'Contract': 'bg-orange-50 text-orange-700',
    'Internship': 'bg-purple-50 text-purple-700',
    'Fixed-Term': 'bg-amber-50 text-amber-700',
    'Remote': 'bg-cyan-50 text-cyan-700',
  };
  return colors[type] || 'bg-gray-50 text-gray-700';
}

function getCategoryName(category: Job['category']): string {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category.name;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const logoColor = getLogoColor(job.company);
  const typeColor = getTypeColor(job.type);
  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true });
  const categoryName = getCategoryName(job.category);

  return (
    <div
      className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md p-4 border border-gray-100 transition-all duration-200"
      onClick={() => onClick(job)}
    >
      <div className="flex items-start gap-3">
        {/* Company Logo - rounded-full per live site */}
        <div className={`w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br ${logoColor}`}>
          {job.logo || job.company.substring(0, 2).toUpperCase()}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {job.isFeatured && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full gap-0.5">
                <Star className="w-3 h-3 fill-amber-500" /> Featured
              </Badge>
            )}
            {job.isUrgent && (
              <Badge className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full gap-0.5 animate-pulse-badge">
                <Zap className="w-3 h-3" /> Urgent
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm group-hover:text-teal-700 transition-colors truncate mb-0.5" style={{ color: '#1E293B' }}>
            {job.title}
          </h3>

          {/* Company */}
          <p className="text-xs text-gray-400 mb-1">{job.company} &middot; {job.location}</p>

          {/* Tags */}
          <div className="flex gap-2 mt-3">
            {categoryName && (
              <span className="text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{categoryName}</span>
            )}
            <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{job.location}</span>
            <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{job.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
