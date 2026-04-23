import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';
import CategoryJobsClient from './category-jobs-client';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await db.category.findMany({
      select: { slug: true },
    });
    return categories.map((cat) => ({
      slug: cat.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  let categoryName: string | null = null;

  try {
    const category = await db.category.findUnique({
      where: { slug },
      select: { name: true },
    });
    categoryName = category?.name || null;
  } catch {
    // fallback
  }

  if (!categoryName) {
    return { title: 'Category Not Found | JobReady Kenya' };
  }

  const title = `${categoryName} Jobs in Kenya | JobReady Kenya`;
  const description = `Browse the latest ${categoryName.toLowerCase()} jobs across Kenya. Find top employers hiring for ${categoryName.toLowerCase()} positions.`;
  const url = `${SITE.url}/jobs/category/${slug}`;

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

export default async function CategoryJobsPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let categoryName: string | null = null;

  try {
    const category = await db.category.findUnique({
      where: { slug },
      select: { name: true },
    });
    categoryName = category?.name || null;
  } catch {
    // fallback
  }

  if (!categoryName) {
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
        name: categoryName,
        item: `${SITE.url}/jobs/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryJobsClient categoryName={categoryName} categorySlug={slug} />
    </>
  );
}
