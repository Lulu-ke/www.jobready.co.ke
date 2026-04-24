import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';
import EmployerDetailClient from './employer-detail-client';

// ─── Helpers ────────────────────────────────────────────────────────────────

function deriveIsUrgent(closingDate: Date | null): boolean {
  if (!closingDate) return false;
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return closingDate <= sevenDaysFromNow;
}

function formatSalary(
  salaryMin: number | null,
  salaryMax: number | null,
  currency: string
): string {
  const symbol = currency || 'KSh';
  if (salaryMin && salaryMax) {
    return `${symbol} ${Math.round(salaryMin / 1000)}K - ${Math.round(salaryMax / 1000)}K`;
  }
  if (salaryMin) {
    return `From ${symbol} ${Math.round(salaryMin / 1000)}K`;
  }
  return 'Not disclosed';
}

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
  closingDate: Date | null;
  postedAt: Date;
  employer: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    orgType: string;
    slug: string;
    description?: string;
  } | null;
}

// ─── Static Params ──────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const employers = await db.employer.findMany({
      select: { slug: true },
    });
    return employers.map((employer) => ({
      slug: employer.slug,
    }));
  } catch {
    return [];
  }
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const employer = await db.employer.findUnique({
    where: { slug },
    select: {
      companyName: true,
      logoUrl: true,
      description: true,
    },
  });

  if (!employer) {
    return { title: 'Employer Not Found | JobReady Kenya' };
  }

  const title = `${employer.companyName} Jobs & Careers | JobReady Kenya`;
  const description = `Explore job openings at ${employer.companyName}. Apply for the latest vacancies and build your career with ${employer.companyName} in Kenya.`;
  const ogImage = employer.logoUrl || SITE.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE.url}/companies/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/companies/${slug}`,
      siteName: SITE.name,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function EmployerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch employer
  const employer = await db.employer.findUnique({
    where: { slug },
    select: {
      id: true,
      companyName: true,
      slug: true,
      email: true,
      logoUrl: true,
      description: true,
      orgType: true,
    },
  });

  if (!employer) {
    notFound();
  }

  // Fetch active jobs for this employer
  const rawJobs = await db.job.findMany({
    where: {
      employerId: employer.id,
      isActive: true,
    },
    orderBy: { postedAt: 'desc' },
    include: {
      employer: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          orgType: true,
          slug: true,
          description: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const jobs: JobData[] = rawJobs.map((job) => ({
    ...job,
    company: job.employer?.companyName || 'Unknown Company',
    logo: job.employer?.logoUrl || null,
    isUrgent: deriveIsUrgent(job.closingDate),
    salaryFormatted: formatSalary(job.salaryMin, job.salaryMax, job.currency),
  }));

  // ─── JSON-LD Structured Data ─────────────────────────────────────────────

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: employer.companyName,
    url: `${SITE.url}/companies/${slug}`,
    logo: employer.logoUrl || undefined,
    description: employer.description || undefined,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Companies',
        item: `${SITE.url}/companies`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: employer.companyName,
        item: `${SITE.url}/companies/${slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <EmployerDetailClient employer={employer} jobs={jobs} />
    </>
  );
}
