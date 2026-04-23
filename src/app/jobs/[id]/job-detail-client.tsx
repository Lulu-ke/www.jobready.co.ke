'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, MapPin, Clock, DollarSign, Building2, Wifi,
  Star, Zap, Briefcase, TrendingUp, ExternalLink,
  GraduationCap, Bookmark, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import JobCard, { Job } from '@/components/job-card';
import NewsletterSection from '@/components/newsletter-section';
import {
  experienceLevelLabel,
  orgTypeLabel,
  formatClosingDate,
  getInitials
} from '@/lib/helpers';

interface JobDetailClientProps {
  job: any;
  relatedJobs: Job[];
}

export default function JobDetailClient({ job, relatedJobs }: JobDetailClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleJobClick = (j: Job) => {
    router.push(`/jobs/${j.id}`);
    window.scrollTo(0, 0);
  };

  const scrollToApply = () => {
    const el = document.getElementById('how-to-apply');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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

  const companyName = job.company || job.employer?.companyName || 'Unknown Company';
  const logoColor = getLogoColor(companyName);
  const initials = getInitials(companyName);

  const shareWhatsApp = () => {
    const text = `${job.title} at ${companyName} in ${job.location}. Apply now on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 -ml-2"
              onClick={() => router.push('/jobs')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
            </Button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {job.logo || initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {job.isFeatured && (
                        <Badge className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 mr-1 fill-amber-500" /> Featured
                        </Badge>
                      )}
                      {job.isUrgent && (
                        <Badge className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse-badge">
                          <Zap className="w-3 h-3 mr-1" /> Urgently Hiring
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: '#1E293B' }}>{job.title}</h1>

                    {/* Company */}
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                      <Building2 className="w-4 h-4" />
                      {companyName}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {job.location}{job.county ? `, ${job.county}` : ''}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {job.salaryFormatted}
                      </span>
                      <span className="flex items-center gap-1.5" suppressHydrationWarning>
                        <Clock className="w-4 h-4 text-gray-400" />
                        {format(new Date(job.postedAt), 'MMM d, yyyy')}
                      </span>
                      {job.isRemote && (
                        <span className="flex items-center gap-1.5 text-teal-600 font-medium">
                          <Wifi className="w-4 h-4" /> Remote
                        </span>
                      )}
                    </div>

                    {/* Type & Level Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                      {job.experienceLevel && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                          {experienceLevelLabel(job.experienceLevel)}
                        </span>
                      )}
                      {job.closingDate && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                          {formatClosingDate(job.closingDate)}
                        </span>
                      )}
                      {job.category && typeof job.category !== 'string' && job.category.name && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {job.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                  <Button
                    onClick={scrollToApply}
                    className="text-white rounded-full font-semibold"
                    style={{ backgroundColor: '#0D9488' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f766e')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D9488')}
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 rounded-full"
                    onClick={() => setSaved(!saved)}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-purple-500 text-purple-500' : ''}`} />
                    {saved ? 'Saved' : 'Save Job'}
                  </Button>
                  <Button variant="outline" className="border-gray-200 rounded-full" onClick={shareWhatsApp}>
                    <Share2 className="w-4 h-4 mr-2 text-green-600" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1E293B' }}>
                  <Briefcase className="w-5 h-5" style={{ color: '#5B21B6' }} />
                  Job Description
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1E293B' }}>
                    <GraduationCap className="w-5 h-5" style={{ color: '#5B21B6' }} />
                    Requirements
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* How to Apply */}
              {job.howToApply && (
                <div id="how-to-apply" className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl border border-teal-200 p-6 lg:p-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1E293B' }}>
                    <ExternalLink className="w-5 h-5" style={{ color: '#5B21B6' }} />
                    How to Apply
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {job.howToApply}
                  </div>
                  <Button
                    className="text-white mt-6 rounded-full font-semibold"
                    style={{ backgroundColor: '#5B21B6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4a1a94')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
                  >
                    Apply for this Position
                  </Button>
                </div>
              )}

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <div>
                  <Separator className="mb-8" />
                  <h2 className="text-xl font-bold mb-6" style={{ color: '#1E293B' }}>Related Jobs</h2>
                  <div className="space-y-4">
                    {relatedJobs.map((rj) => (
                      <JobCard key={rj.id} job={rj} onClick={handleJobClick} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {job.logo || initials}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#1E293B' }}>{companyName}</h3>
                    {job.employer?.orgType && (
                      <span className="text-xs text-gray-500">{orgTypeLabel(job.employer.orgType)}</span>
                    )}
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>{job.location}{job.county ? `, ${job.county}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Salary</p>
                      <p className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>{job.salaryFormatted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Job Type</p>
                      <p className="text-sm font-medium" style={{ color: '#1E293B' }}>{job.type}</p>
                    </div>
                  </div>
                  {job.closingDate && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <Zap className="w-4 h-4 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Deadline</p>
                        <p className="text-sm font-semibold text-orange-600">{formatClosingDate(job.closingDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CV Promo Card */}
              <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl border border-teal-200 p-6 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <span className="text-2xl">
                    <svg className="w-6 h-6" style={{ color: '#5B21B6' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                </div>
                <h3 className="font-bold text-lg mt-2" style={{ color: '#1E293B' }}>
                  Free CV Review — Stand Out
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Get expert feedback on your CV and increase your chances of landing this job.
                </p>
                <Button
                  className="w-full mt-4 text-white font-semibold py-3 rounded-full"
                  style={{ backgroundColor: '#16a34a' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                  asChild
                >
                  <a href="#">Get Free Review</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
