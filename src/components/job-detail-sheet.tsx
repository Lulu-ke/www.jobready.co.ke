'use client';

import { useState } from 'react';
import { X, MapPin, DollarSign, Clock, Building2, Wifi, ExternalLink, Bookmark, Share2, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';

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
  employer?: { name: string; logo: string; industry: string; isVerified: boolean; description?: string; size?: string; website?: string } | null;
}

interface JobDetailSheetProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onJobClick: (job: Job) => void;
  relatedJobs: Job[];
}

function getLogoColor(name: string): string {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function JobDetailSheet({ job, open, onClose, onJobClick, relatedJobs }: JobDetailSheetProps) {
  const [saved, setSaved] = useState(false);

  if (!job) return null;

  const logoColor = getLogoColor(job.company);
  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true });

  const shareWhatsApp = () => {
    const text = `${job.title} at ${job.company} in ${job.location}. Salary: ${job.salaryFormatted}. Apply now on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* [&>button]:hidden hides the default tiny Radix close button */}
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0 [&>button]:hidden">
        {/* Sticky header with prominent close button */}
        <SheetHeader className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-base font-semibold text-gray-900 truncate flex-1 min-w-0">
              {job.title}
            </SheetTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-[8px]`}>
              {job.logo || job.company.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-sm text-gray-500 truncate">{job.company} &middot; {job.location}</span>
          </div>
        </SheetHeader>

        <div className="px-5 py-5 space-y-6">
          {/* Company Info */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
              {job.logo || job.company.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">{job.company}</h3>
              <p className="text-sm text-gray-500">{job.employer?.industry || job.category}</p>
              {job.employer?.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium mt-0.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-100 flex items-center justify-center text-[10px] text-teal-600">&#10003;</span>
                  Verified Employer
                </span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-700 truncate">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
              <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Salary</p>
                <p className="text-sm font-medium text-gray-700 truncate">{job.salaryFormatted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Type</p>
                <p className="text-sm font-medium text-gray-700">{job.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Posted</p>
                <p className="text-sm font-medium text-gray-700">{timeAgo}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">
              {job.category}
            </Badge>
            {job.isRemote && (
              <Badge variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">
                <Wifi className="w-3 h-3 mr-1" /> Remote Friendly
              </Badge>
            )}
            {job.isUrgent && (
              <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 animate-pulse-badge">
                Urgent Hiring
              </Badge>
            )}
            {job.closingDate && (
              <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                Closes {format(new Date(job.closingDate), 'MMM d, yyyy')}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
            <ul className="space-y-2">
              {job.requirements.split('. ').filter(Boolean).map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <span>{req.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* How to Apply */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">How to Apply</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{job.howToApply}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-semibold">
              Apply Now
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-3 text-base"
              onClick={shareWhatsApp}
            >
              <Share2 className="w-4 h-4 mr-2 text-green-600" />
              Share via WhatsApp
            </Button>
          </div>

          {/* Bottom actions: Save */}
          <div className="flex gap-2 pt-1 pb-4 border-t border-gray-100">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500 hover:text-teal-600"
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-teal-500 text-teal-500' : ''}`} />
              {saved ? 'Saved' : 'Save Job'}
            </Button>
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Similar Jobs</h4>
              <div className="space-y-3">
                {relatedJobs.slice(0, 3).map((rj) => (
                  <div
                    key={rj.id}
                    onClick={() => onJobClick(rj)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getLogoColor(rj.company)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                      {rj.logo || rj.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{rj.title}</p>
                      <p className="text-xs text-gray-500">{rj.company} &middot; {rj.location}</p>
                    </div>
                    <span className="text-xs text-teal-600 font-medium shrink-0">{rj.salaryFormatted}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
