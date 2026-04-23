'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Bookmark, Share2, ExternalLink, Briefcase,
  GraduationCap, FileText, MessageCircle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import JobCard, { Job } from '@/components/job-card';
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

  const companyName = job.company || job.employer?.companyName || 'Unknown Company';
  const logoColor = getLogoColor(companyName);
  const initials = getInitials(companyName);
  const categoryName = typeof job.category === 'object' ? job.category?.name : (job.category || '');

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Jobs', href: '/jobs' },
  ];
  if (job.county) {
    breadcrumbItems.push({ name: job.county, href: `/jobs?county=${encodeURIComponent(job.county)}` });
  }
  breadcrumbItems.push({ name: job.title, href: `/jobs/${job.id}` });

  // Format dates
  const postedDate = job.postedAt ? format(new Date(job.postedAt), 'MMM d, yyyy') : '';
  const deadlineDate = job.closingDate ? format(new Date(job.closingDate), 'MMM d, yyyy') : null;

  const shareWhatsApp = () => {
    const text = `${job.title} at ${companyName} in ${job.location}. Apply now on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* ═══ LEFT COLUMN (2/3) ═══ */}
            <div className="md:col-span-2">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-500 mb-4 flex flex-wrap items-center gap-1">
                {breadcrumbItems.map((item, i) => (
                  <span key={item.href + item.name}>
                    {i > 0 && <span className="text-gray-300 mx-1">/</span>}
                    {i === breadcrumbItems.length - 1 ? (
                      <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-none inline-block align-bottom">
                        {item.name}
                      </span>
                    ) : (
                      <Link href={item.href} className="hover:text-teal-600 transition-colors">
                        {item.name}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              {/* ─── Job Header Card ─── */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>

                <div className="text-sm text-gray-600 mt-1.5">
                  <span className="font-medium">{companyName}</span>
                  {categoryName && (
                    <span> &middot; {categoryName}</span>
                  )}
                </div>

                <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                  <span>
                    📍 {job.location}{job.county ? `, ${job.county}` : ''}
                    {job.isRemote && <span className="text-teal-600 font-medium"> (Remote option)</span>}
                  </span>
                  {postedDate && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>📅 Posted: {postedDate}</span>
                    </>
                  )}
                  {deadlineDate && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>⏳ Deadline: {deadlineDate}</span>
                    </>
                  )}
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.salaryFormatted && job.salaryFormatted !== 'Not disclosed' && (
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      💰 {job.salaryFormatted}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      💻 Remote option
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {job.type}
                  </span>
                  {job.experienceLevel && (
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {experienceLevelLabel(job.experienceLevel)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-5">
                  {job.howToApply && (
                    <button
                      onClick={scrollToApply}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
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

              {/* ─── Description + How to Apply ─── */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-3 text-gray-900">Job Description</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {job.description}
                </div>

                {job.requirements && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" style={{ color: '#5B21B6' }} />
                      Requirements
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {job.requirements}
                    </div>
                  </div>
                )}

                {job.howToApply && (
                  <div className="mt-6 pt-4 border-t border-gray-200" id="how-to-apply">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">How to Apply</h3>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {job.howToApply}
                    </div>
                    <Button
                      className="text-white mt-6 rounded-full font-semibold"
                      style={{ backgroundColor: '#5B21B6' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4a1a94')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
                      onClick={scrollToApply}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply for this Position
                    </Button>
                  </div>
                )}
              </div>

              {/* ─── Share Strip ─── */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Share this job:</span>
                  <Button variant="outline" size="sm" className="border-gray-200 rounded-full text-xs" onClick={shareWhatsApp}>
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 rounded-full text-xs" onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: job.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}>
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT SIDEBAR (1/3) ═══ */}
            <div className="space-y-6">
              {/* Company About Card */}
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

                {job.employer?.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{job.employer.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="text-base">📍</span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>{job.location}{job.county ? `, ${job.county}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="text-base">💰</span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Salary</p>
                      <p className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>{job.salaryFormatted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="text-base">💼</span>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Job Type</p>
                      <p className="text-sm font-medium" style={{ color: '#1E293B' }}>{job.type}</p>
                    </div>
                  </div>
                  {job.closingDate && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <span className="text-base">⏳</span>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Deadline</p>
                        <p className="text-sm font-semibold text-orange-600">{formatClosingDate(job.closingDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Jobs Card */}
              {relatedJobs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-base mb-4" style={{ color: '#1E293B' }}>Related Jobs</h3>
                  <div className="space-y-3">
                    {relatedJobs.slice(0, 4).map((rj) => (
                      <div
                        key={rj.id}
                        onClick={() => handleJobClick(rj)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-gray-200"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getLogoColor(rj.company)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                          {rj.logo || rj.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{rj.title}</p>
                          <p className="text-xs text-gray-500">{rj.company} &middot; {rj.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Advice cross-links */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3">Career Advice</h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link href="/articles" className="text-sm text-gray-700 hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                      How to Write a Winning CV in Kenya
                    </Link>
                  </li>
                  <li>
                    <Link href="/articles" className="text-sm text-gray-700 hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                      Top Interview Questions and How to Answer Them
                    </Link>
                  </li>
                  <li>
                    <Link href="/articles" className="text-sm text-gray-700 hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                      Salary Negotiation Tips for Kenyan Job Seekers
                    </Link>
                  </li>
                </ul>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors mt-3"
                >
                  More Career Advice <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* CV Writing CTA */}
              <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl border border-teal-200 p-6 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6" style={{ color: '#5B21B6' }} />
                </div>
                <h3 className="font-bold text-lg mt-2" style={{ color: '#1E293B' }}>
                  Free CV Review — Stand Out
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Get expert feedback on your CV and increase your chances of landing this job.
                </p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-full transition-colors w-full no-underline mt-4"
                >
                  <MessageCircle className="text-xl" />
                  Get Free Review
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
