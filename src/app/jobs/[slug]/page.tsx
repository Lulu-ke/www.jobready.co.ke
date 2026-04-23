import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JobDetailClient from './job-detail-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const jobs = await db.job.findMany({
    select: { slug: true },
    where: { isActive: true },
  });

  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await db.job.findUnique({
    where: { slug },
    include: {
      employer: { select: { companyName: true } },
      category: { select: { name: true } },
    },
  });
  if (!job) return { title: 'Job Not Found' };

  const company = job.employer?.companyName || 'Unknown Company';
  const category = typeof job.category === 'object' ? job.category?.name : '';

  return {
    title: `${job.title} at ${company} | JobReady Kenya`,
    description: `${(job.description || '').substring(0, 160)} Apply now on JobReady Kenya.`,
    openGraph: {
      title: `${job.title} at ${company}`,
      description: `${(job.description || '').substring(0, 160)}`,
      type: 'article',
      siteName: 'JobReady Kenya',
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await db.job.findUnique({
    where: { slug },
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
          icon: true,
          color: true,
        },
      },
    },
  });
  if (!job) notFound();

  // Fetch related jobs
  const relatedJobs = job.categoryId
    ? await db.job.findMany({
        where: { categoryId: job.categoryId, id: { not: job.id }, isActive: true },
        take: 4,
        orderBy: { postedAt: 'desc' },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              orgType: true,
              slug: true,
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
      })
    : [];

  const formattedJob = {
    ...job,
    company: job.employer?.companyName || null,
    logo: job.employer?.logoUrl || null,
    isUrgent: job.closingDate
      ? job.closingDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : false,
    salaryFormatted:
      job.salaryMin && job.salaryMax
        ? `KSh ${Math.round(job.salaryMin / 1000)}K - ${Math.round(job.salaryMax / 1000)}K`
        : job.salaryMin
          ? `From KSh ${Math.round(job.salaryMin / 1000)}K`
          : 'Not disclosed',
  };

  const formattedRelated = relatedJobs.map((rj) => ({
    ...rj,
    company: rj.employer?.companyName || null,
    logo: rj.employer?.logoUrl || null,
    isUrgent: rj.closingDate
      ? rj.closingDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : false,
    salaryFormatted:
      rj.salaryMin && rj.salaryMax
        ? `KSh ${Math.round(rj.salaryMin / 1000)}K - ${Math.round(rj.salaryMax / 1000)}K`
        : 'Not disclosed',
  }));

  // JSON-LD structured data for JobPosting
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    validThrough: job.closingDate,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressRegion: job.county,
        addressCountry: 'KE',
      },
    },
    employmentType:
      job.type === 'Full-Time'
        ? 'FULL_TIME'
        : job.type === 'Part-Time'
          ? 'PART_TIME'
          : 'CONTRACTOR',
    hiringOrganization: job.employer
      ? {
          '@type': 'Organization',
          name: job.employer.companyName,
          sameAs: job.employer.logoUrl,
        }
      : undefined,
    baseSalary: job.salaryMin
      ? {
          '@type': 'MonetaryAmount',
          currency: 'KES',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salaryMin,
            maxValue: job.salaryMax || job.salaryMin,
            unitText: 'MONTH',
          },
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobDetailClient job={formattedJob} relatedJobs={formattedRelated} />
    </>
  );
}
