'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, MapPin, Clock, DollarSign, Building2, Wifi,
  Star, Zap, Briefcase, TrendingUp, ExternalLink,
  Loader2, AlertCircle, GraduationCap, Bookmark, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MobileNav from '@/components/mobile-nav';
import JobCard, { Job } from '@/components/job-card';
import NewsletterSection from '@/components/newsletter-section';
import {
  experienceLevelLabel,
  orgTypeLabel,
  formatClosingDate,
  getInitials
} from '@/lib/helpers';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data.job || null);
        setRelatedJobs(data.relatedJobs || []);
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchJob();
  }, [id]);

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
      'Full-Time': 'bg-green-100 text-green-700 border-green-200',
      'Part-Time': 'bg-blue-100 text-blue-700 border-blue-200',
      'Contract': 'bg-orange-100 text-orange-700 border-orange-200',
      'Internship': 'bg-purple-100 text-purple-700 border-purple-200',
      'Fixed-Term': 'bg-amber-100 text-amber-700 border-amber-200',
      'Remote': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <Card className="rounded-2xl border border-gray-100 p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </Card>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'The job you are looking for does not exist or has been removed.'}</p>
            <Button onClick={() => router.push('/jobs')} className="bg-teal-600 hover:bg-teal-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
            </Button>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const companyName = job.company || job.employer?.companyName || 'Unknown Company';
  const logoColor = getLogoColor(companyName);
  const initials = getInitials(companyName);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 -ml-2"
              onClick={() => router.push('/jobs')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Job Header Card */}
          <Card className="rounded-2xl border border-gray-100 overflow-hidden mb-8">
            {/* Gradient top bar */}
            <div className="h-1.5 bg-gradient-to-r from-teal-500 to-purple-500" />

            <CardContent className="p-6 lg:p-8">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${logoColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {job.logo || initials}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {job.isFeatured && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-2 py-0.5">
                        <Star className="w-3 h-3 mr-1 fill-amber-500" /> Featured
                      </Badge>
                    )}
                    {job.isUrgent && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5">
                        <Zap className="w-3 h-3 mr-1" /> Urgently Hiring
                      </Badge>
                    )}
                    {job.employer?.orgType && (
                      <Badge variant="outline" className="text-[10px] text-gray-500">
                        {orgTypeLabel(job.employer.orgType)}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>

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
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {format(new Date(job.postedAt), 'MMM d, yyyy')}
                    </span>
                    {job.isRemote && (
                      <span className="flex items-center gap-1.5 text-teal-600 font-medium">
                        <Wifi className="w-4 h-4" /> Remote
                      </span>
                    )}
                  </div>

                  {/* Type & Level Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Badge variant="outline" className={getTypeColor(job.type) + ' text-[11px]'}>
                      {job.type}
                    </Badge>
                    {job.experienceLevel && (
                      <Badge variant="outline" className="text-[11px] bg-teal-100 text-teal-700 border-teal-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {experienceLevelLabel(job.experienceLevel)}
                      </Badge>
                    )}
                    {job.closingDate && (
                      <Badge variant="outline" className="text-[11px] bg-orange-100 text-orange-700 border-orange-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatClosingDate(job.closingDate)}
                      </Badge>
                    )}
                    {job.category && typeof job.category !== 'string' && job.category.name && (
                      <Badge variant="outline" className="text-[11px] text-gray-500">
                        {job.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                <Button onClick={scrollToApply} className="bg-teal-600 hover:bg-teal-700 text-white">
                  Apply Now
                </Button>
                <Button variant="outline" className="border-gray-200">
                  <Bookmark className="w-4 h-4 mr-2" /> Save Job
                </Button>
                <Button variant="outline" className="border-gray-200">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <div className="space-y-6 lg:space-y-8">
            {/* Description */}
            <Card className="rounded-2xl border border-gray-100">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  Job Description
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card className="rounded-2xl border border-gray-100">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-teal-600" />
                    Requirements
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How to Apply */}
            {job.howToApply && (
              <Card id="how-to-apply" className="rounded-2xl border border-teal-200 bg-teal-50/30">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-teal-600" />
                    How to Apply
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {job.howToApply}
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white mt-6">
                    Apply for this Position
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="mt-12">
              <Separator className="mb-8" />
              <h2 className="text-xl font-bold text-gray-900 mb-6">Related Jobs</h2>
              <div className="space-y-4">
                {relatedJobs.map((rj) => (
                  <JobCard key={rj.id} job={rj} onClick={handleJobClick} />
                ))}
              </div>
            </div>
          )}
        </div>

        <NewsletterSection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
