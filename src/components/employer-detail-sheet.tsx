'use client';

import { X, MapPin, Briefcase, Mail, Phone, Building2, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { orgTypeLabel } from '@/lib/helpers';

interface EmployerJob {
  id: string;
  title: string;
  location: string;
  county: string;
  type: string;
  slug?: string;
}

interface Employer {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  orgType: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
}

interface EmployerDetailSheetProps {
  employer: Employer | null;
  open: boolean;
  onClose: () => void;
  jobs?: EmployerJob[];
  onJobClick?: (job: EmployerJob) => void;
}

function getLogoGradient(name: string): string {
  const gradients = [
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
  return gradients[Math.abs(hash) % gradients.length];
}

function getOrgTypeColor(orgType: string): string {
  const colors: Record<string, string> = {
    PRIVATE: 'bg-slate-50 text-slate-700 border-slate-200',
    SMALL_BUSINESS: 'bg-blue-50 text-blue-700 border-blue-200',
    STARTUP: 'bg-violet-50 text-violet-700 border-violet-200',
    NGO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INTERNATIONAL_ORG: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    NATIONAL_GOV: 'bg-amber-50 text-amber-700 border-amber-200',
    COUNTY_GOV: 'bg-orange-50 text-orange-700 border-orange-200',
    STATE_CORPORATION: 'bg-rose-50 text-rose-700 border-rose-200',
    EDUCATION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    FOUNDATION: 'bg-pink-50 text-pink-700 border-pink-200',
    RELIGIOUS_ORG: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return colors[orgType] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function EmployerDetailSheet({
  employer,
  open,
  onClose,
  jobs = [],
  onJobClick,
}: EmployerDetailSheetProps) {
  if (!employer) return null;

  const gradient = getLogoGradient(employer.companyName);
  const initials = getInitials(employer.companyName);

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0 [&>button]:hidden bg-white">
        {/* Sticky header */}
        <SheetHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-base font-semibold text-gray-900 truncate flex-1 min-w-0">
              {employer.companyName}
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
            {employer.orgType && (
              <Badge
                variant="outline"
                className={`text-[10px] ${getOrgTypeColor(employer.orgType)}`}
              >
                <Building2 className="w-2.5 h-2.5 mr-0.5" />
                {orgTypeLabel(employer.orgType)}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="px-5 py-5 space-y-5">
          {/* Company Logo & Name */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm`}
            >
              {employer.logoUrl ? (
                <img
                  src={employer.logoUrl}
                  alt={employer.companyName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-800">
                {employer.companyName}
              </h3>
              {employer.orgType && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {orgTypeLabel(employer.orgType)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {employer.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">About</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {employer.description}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {(employer.email || employer.phone) && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">Contact Information</h4>
              <div className="space-y-3">
                {employer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <a
                      href={`mailto:${employer.email}`}
                      className="text-sm text-teal-600 hover:text-teal-700 transition-colors truncate"
                    >
                      {employer.email}
                    </a>
                  </div>
                )}
                {employer.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <a
                      href={`tel:${employer.phone}`}
                      className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {employer.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Jobs by this employer */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm">
              Jobs by {employer.companyName}
            </h4>

            {jobs.length > 0 ? (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onJobClick?.(job)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-gray-200"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        {job.type && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {job.type}
                          </span>
                        )}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-400">
                  No open positions at this time
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
