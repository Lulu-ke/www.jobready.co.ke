import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticleDetailClient from './article-detail-client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await db.article.findUnique({
    where: { id },
    select: {
      title: true,
      excerpt: true,
      category: true,
      author: true,
      createdAt: true,
    },
  });
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} | JobReady Kenya`,
    description: `${article.excerpt || (article.title + ' - Read more on JobReady Kenya.')}`,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      siteName: 'JobReady Kenya',
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const article = await db.article.findUnique({
    where: { id },
  });
  if (!article) notFound();

  // JSON-LD structured data for Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author,
        }
      : undefined,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
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
      <ArticleDetailClient article={JSON.parse(JSON.stringify(article))} />
    </>
  );
}
