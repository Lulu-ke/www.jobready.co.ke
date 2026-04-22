'use client';

import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign, Building2, Wifi, Star, Zap, ArrowUpRight, Bookmark, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  county: string;
  type: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFormatted: string;
  description: string;
  requirements: string;
  howToApply: string;
  isRemote: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  closingDate: string | null;
  postedAt: string;
  employer?: { name: string; logo: string; industry: string; isVerified: boolean } | null;
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
    'Full-Time': 'bg-green-100 text-green-700 border-green-200',
    'Part-Time': 'bg-blue-100 text-blue-700 border-blue-200',
    'Contract': 'bg-orange-100 text-orange-700 border-orange-200',
    'Internship': 'bg-purple-100 text-purple-700 border-purple-200',
    'Fixed-Term': 'bg-amber-100 text-amber-700 border-amber-200',
    'Remote': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const logoColor = getLogoColor(job.company);
  const typeColor = getTypeColor(job.type);
  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true });

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:shadow-teal-900/5 hover:border-teal-200 transition-all duration-300 border-gray-200 overflow-hidden"
      onClick={() => onClick(job)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {job.logo || job.company.substring(0, 2).toUpperCase()}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {job.isFeatured && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">
                      <Star className="w-3 h-3 mr-0.5 fill-amber-500" /> Featured
                    </Badge>
                  )}
                  {job.isUrgent && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0 animate-pulse-badge">
                      <Zap className="w-3 h-3 mr-0.5" /> Urgent
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                  {job.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{job.company}</span>
              {job.employer?.isVerified && (
                <span className="text-teal-500" title="Verified Employer">&#10003;</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salaryFormatted}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo}
              </span>
              {job.isRemote && (
                <span className="flex items-center gap-1 text-teal-600 font-medium">
                  <Wifi className="w-3.5 h-3.5" />
                  Remote
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={typeColor + ' text-[11px]'}>
                  {job.type}
                </Badge>
                <span className="text-[11px] text-gray-400 hidden sm:inline">{job.category}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => e.stopPropagation()}>
                  <Bookmark className="w-4 h-4 text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => e.stopPropagation()}>
                  <Share2 className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
