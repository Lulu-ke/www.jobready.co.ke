import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SITE_URL = 'https://www.jobready.co.ke'

interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: Date
  category: string
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatRssDate(date: Date): string {
  return date.toUTCString()
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

export async function GET() {
  try {
    // Fetch latest 20 active jobs
    const jobs = await db.job.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        postedAt: true,
        type: true,
      },
      orderBy: { postedAt: 'desc' },
      take: 20,
    })

    // Fetch latest 10 published articles
    const articles = await db.article.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        createdAt: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Build feed items from jobs
    const jobItems: FeedItem[] = jobs.map((job) => ({
      title: job.title,
      link: `${SITE_URL}/jobs/${job.slug}`,
      description: truncate(job.description, 500),
      pubDate: job.postedAt,
      category: job.type,
    }))

    // Build feed items from articles
    const articleItems: FeedItem[] = articles.map((article) => ({
      title: article.title,
      link: `${SITE_URL}/career-advice/${article.slug}`,
      description: article.excerpt,
      pubDate: article.createdAt,
      category: article.category,
    }))

    // Combine and sort by date descending, take top 30
    const allItems = [...jobItems, ...articleItems]
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 30)

    const itemsXml = allItems
      .map(
        (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${formatRssDate(item.pubDate)}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <guid>${escapeXml(item.link)}</guid>
    </item>`,
      )
      .join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>JobReady Kenya - Latest Jobs &amp; Career Updates</title>
    <link>${SITE_URL}</link>
    <description>Your trusted source for the latest job opportunities, career advice, and professional updates in Kenya.</description>
    <language>en-ke</language>
    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}
