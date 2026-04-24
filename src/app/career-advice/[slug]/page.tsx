import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';
import ArticleDetailClient from './article-detail-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await db.article.findMany({
      select: { slug: true },
      where: { published: true },
    });
    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      category: true,
      author: true,
      createdAt: true,
    },
  });
  if (!article) return { title: 'Article Not Found | JobReady Kenya' };

  return {
    title: `${article.title} | JobReady Kenya`,
    description: `${article.excerpt || (article.title + ' - Read more on JobReady Kenya.')}`,
    alternates: { canonical: `${SITE.url}/career-advice/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      siteName: 'JobReady Kenya',
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
  });
  if (!article) notFound();

  // Fetch related articles from same category
  const relatedArticles = article.category
    ? await db.article.findMany({
        where: {
          category: article.category,
          slug: { not: slug },
          published: true,
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          author: true,
          createdAt: true,
        },
      })
    : [];

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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Career Advice', item: `${SITE.url}/career-advice` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE.url}/career-advice/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArticleDetailClient article={JSON.parse(JSON.stringify(article))} relatedArticles={JSON.parse(JSON.stringify(relatedArticles))} />
    </>
  );
}
