'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Building2,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import NewsletterSection from '@/components/newsletter-section';
import JobCard from '@/components/job-card';
import { orgTypeLabel, getInitials } from '@/lib/helpers';

// ─── Types ──────────────────────────────────────────────────────────────────

interface EmployerData {
  id: string;
  companyName: string;
  slug: string;
  email: string;
  logoUrl: string | null;
  description: string | null;
  orgType: string;
}

interface JobData {
  id: string;
  title: string;
  slug: string;
  company: string | null;
  logo: string | null;
  currency: string;
  location: string;
  county: string;
  type: string;
  category: { id: string; name: string; slug: string } | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFormatted: string;
  description: string;
  howToApply: string;
  isRemote: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  experienceLevel: string;
  closingDate: string | null;
  postedAt: string;
  employer: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    orgType: string;
    slug: string;
    description?: string;
  } | null;
}

interface EmployerDetailClientProps {
  employer: EmployerData;
  jobs: JobData[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLogoGradient(name: string): string {
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
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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

// ─── Component ──────────────────────────────────────────────────────────────

export default function EmployerDetailClient({
  employer,
  jobs,
}: EmployerDetailClientProps) {
  const router = useRouter();
  const gradient = getLogoGradient(employer.companyName);
  const initials = getInitials(employer.companyName);
  const orgColor = getOrgTypeColor(employer.orgType);

  const handleJobClick = (job: JobData) => {
    if (job.slug) {
      router.push(`/jobs/${job.slug}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="bg-gray-50 border-b border-gray-100" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center gap-1.5 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-teal-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </li>
              <li>
                <Link href="/companies" className="hover:text-teal-600 transition-colors">
                  Companies
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </li>
              <li className="text-gray-900 font-medium truncate">{employer.companyName}</li>
            </ol>
          </div>
        </nav>

        {/* Employer Header */}
        <section className="bg-gradient-to-br from-white to-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Logo / Initials */}
              <div
                className={`w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl lg:text-3xl shrink-0 shadow-sm`}
              >
                {employer.logoUrl ? (
                  <img
                    src={employer.logoUrl}
                    alt={`${employer.companyName} logo`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                    {employer.companyName}
                  </h1>
                  {employer.orgType && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${orgColor}`}
                    >
                      <Building2 className="w-3 h-3" />
                      {orgTypeLabel(employer.orgType)}
                    </span>
                  )}
                </div>

                {employer.description && (
                  <p className="text-gray-600 text-sm lg:text-base leading-relaxed max-w-3xl">
                    {employer.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-4">
                  <Link
                    href="/companies"
                    className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    View All Companies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-slate-800">
                  Jobs at {employer.companyName}
                </h2>
                <p className="text-sm text-gray-500">
                  {jobs.length} {jobs.length === 1 ? 'opening' : 'openings'} available
                </p>
              </div>
            </div>

            {/* Jobs List */}
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job as any} onClick={handleJobClick as any} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No current openings at {employer.companyName}
                </h3>
                <p className="text-gray-500 text-sm mb-5 text-center max-w-md">
                  Check back soon. New positions are posted regularly.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Browse All Jobs
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <NewsletterSection />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
