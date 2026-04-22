import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import OpportunityDetailClient from './opportunity-detail-client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await db.opportunity.findUnique({
    where: { id },
    include: {
      provider: { select: { companyName: true } },
    },
  });
  if (!opportunity) return { title: 'Opportunity Not Found' };

  const provider = opportunity.provider?.companyName || 'Unknown Provider';
  const typeLabel = opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1).replace(/_/g, ' ');

  return {
    title: `${opportunity.title} | JobReady Kenya`,
    description: `${(opportunity.description || '').substring(0, 160)} ${typeLabel} on JobReady Kenya.`,
    openGraph: {
      title: `${opportunity.title} - ${typeLabel}`,
      description: `${(opportunity.description || '').substring(0, 160)}`,
      type: 'article',
      siteName: 'JobReady Kenya',
    },
  };
}

export default async function OpportunityDetailPage({ params }: Props) {
  const { id } = await params;
  const opportunity = await db.opportunity.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          orgType: true,
          slug: true,
          description: true,
        },
      },
    },
  });
  if (!opportunity) notFound();

  const providerName = opportunity.provider?.companyName || 'Unknown Provider';

  // JSON-LD structured data for Offer
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: opportunity.title,
    description: opportunity.description,
    validThrough: opportunity.deadline,
    offeredBy: opportunity.provider
      ? {
          '@type': 'Organization',
          name: opportunity.provider.companyName,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OpportunityDetailClient opportunity={JSON.parse(JSON.stringify(opportunity))} />
    </>
  );
}
