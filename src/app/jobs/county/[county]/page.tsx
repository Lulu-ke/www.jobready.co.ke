import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KENYA_COUNTIES, COUNTY_SLUG_MAP, SITE } from '@/lib/constants';
import CountyJobsClient from './county-jobs-client';

interface CountyPageProps {
  params: Promise<{ county: string }>;
}

export async function generateStaticParams() {
  return KENYA_COUNTIES.map((county) => ({
    county: county.slug,
  }));
}

export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const { county } = await params;
  const countyName = COUNTY_SLUG_MAP[county];

  if (!countyName) {
    return { title: 'County Not Found | JobReady Kenya' };
  }

  const title = `Jobs in ${countyName} County | JobReady Kenya`;
  const description = `Browse the latest job vacancies in ${countyName} County, Kenya. Find full-time, part-time, internship, and remote jobs in ${countyName}.`;
  const url = `${SITE.url}/jobs/county/${county}`;

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

export default async function CountyJobsPage({ params }: CountyPageProps) {
  const { county } = await params;
  const countyName = COUNTY_SLUG_MAP[county];

  if (!countyName) {
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
        name: `${countyName} County`,
        item: `${SITE.url}/jobs/county/${county}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CountyJobsClient countyName={countyName} countySlug={county} />
    </>
  );
}
