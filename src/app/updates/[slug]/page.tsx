import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import UpdateDetailClient from './update-detail-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const updates = await db.jobUpdate.findMany({
    select: { slug: true },
    where: { isPublished: true },
  });

  return updates.map((update) => ({
    slug: update.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const update = await db.jobUpdate.findUnique({
    where: { slug },
    select: {
      title: true,
      type: true,
      sourceName: true,
      createdAt: true,
    },
  });
  if (!update) return { title: 'Update Not Found' };

  return {
    title: `${update.title} | JobReady Kenya`,
    description: `${update.title} – Official update from ${update.sourceName} on JobReady Kenya.`,
    openGraph: {
      title: update.title,
      description: `Official update from ${update.sourceName}`,
      type: 'article',
      siteName: 'JobReady Kenya',
    },
  };
}

export default async function UpdateDetailPage({ params }: Props) {
  const { slug } = await params;
  const update = await db.jobUpdate.findUnique({
    where: { slug },
  });
  if (!update) notFound();

  // JSON-LD structured data for Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: update.title,
    description: update.content.substring(0, 200),
    author: {
      '@type': 'Organization',
      name: update.sourceName,
    },
    datePublished: update.createdAt,
    dateModified: update.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: 'JobReady Kenya',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UpdateDetailClient update={JSON.parse(JSON.stringify(update))} />
    </>
  );
}
