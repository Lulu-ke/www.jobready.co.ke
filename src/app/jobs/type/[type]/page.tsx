import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JOB_TYPES, JOB_TYPE_SLUGS, JOB_TYPE_LABELS, SITE } from '@/lib/constants';
import TypeJobsClient from './type-jobs-client';

interface TypePageProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return JOB_TYPES.map((type) => ({
    type: JOB_TYPE_SLUGS[type] || type.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const { type } = await params;

  // Map slug back to job type name
  let jobTypeName: string | null = null;
  for (const [name, slug] of Object.entries(JOB_TYPE_SLUGS)) {
    if (slug === type) {
      jobTypeName = name;
      break;
    }
  }

  if (!jobTypeName) {
    return { title: 'Job Type Not Found | JobReady Kenya' };
  }

  const label = JOB_TYPE_LABELS[type] || `${jobTypeName} Jobs in Kenya`;
  const title = `${label} | JobReady Kenya`;
  const description = `Browse the latest ${label.toLowerCase()} across Kenya. Find top employers hiring for ${jobTypeName.toLowerCase()} positions.`;
  const url = `${SITE.url}/jobs/type/${type}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: 'website',
      locale: 'en_KE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE.twitterHandle,
    },
  };
}

export default async function TypeJobsPage({ params }: TypePageProps) {
  const { type } = await params;

  // Map slug back to job type name
  let jobTypeName: string | null = null;
  for (const [name, slug] of Object.entries(JOB_TYPE_SLUGS)) {
    if (slug === type) {
      jobTypeName = name;
      break;
    }
  }

  if (!jobTypeName) {
    notFound();
  }

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
        name: 'Jobs',
        item: `${SITE.url}/jobs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: jobTypeName,
        item: `${SITE.url}/jobs/type/${type}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TypeJobsClient jobType={jobTypeName} typeSlug={type} />
    </>
  );
}
