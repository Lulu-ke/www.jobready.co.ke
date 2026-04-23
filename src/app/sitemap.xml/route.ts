import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { KENYA_COUNTIES, JOB_TYPE_SLUGS } from '@/lib/constants'

const SITE_URL = 'https://www.jobready.co.ke'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatLastmod(date: Date): string {
  return date.toISOString().split('T')[0]
}

function buildUrlEntry(entry: SitemapEntry): string {
  const lastmod = entry.lastmod ? `  <lastmod>${entry.lastmod}</lastmod>\n` : ''
  return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n${lastmod}    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
}

export async function GET() {
  try {
    const today = formatLastmod(new Date())

    // Fetch all active jobs
    const jobs = await db.job.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch all active opportunities
    const opportunities = await db.opportunity.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch all published articles
    const articles = await db.article.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch all published job updates
    const jobUpdates = await db.jobUpdate.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch all categories
    const categories = await db.category.findMany({
      select: { slug: true, updatedAt: true },
    })

    // Fetch all employers
    const employers = await db.employer.findMany({
      select: { id: true, createdAt: true },
    })

    const urls: SitemapEntry[] = []

    // Static pages
    urls.push(
      { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/jobs`, lastmod: today, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/opportunities`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/employers`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
      { loc: `${SITE_URL}/articles`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
      { loc: `${SITE_URL}/updates`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
    )

    // Job pages
    for (const job of jobs) {
      urls.push({
        loc: `${SITE_URL}/jobs/${job.id}`,
        lastmod: formatLastmod(job.updatedAt),
        changefreq: 'daily',
        priority: '0.8',
      })
    }

    // Opportunity pages
    for (const opp of opportunities) {
      urls.push({
        loc: `${SITE_URL}/opportunities/${opp.id}`,
        lastmod: formatLastmod(opp.updatedAt),
        changefreq: 'weekly',
        priority: '0.7',
      })
    }

    // Article pages
    for (const article of articles) {
      urls.push({
        loc: `${SITE_URL}/articles/${article.id}`,
        lastmod: formatLastmod(article.updatedAt),
        changefreq: 'weekly',
        priority: '0.6',
      })
    }

    // Job update pages
    for (const update of jobUpdates) {
      urls.push({
        loc: `${SITE_URL}/updates/${update.id}`,
        lastmod: formatLastmod(update.updatedAt),
        changefreq: 'daily',
        priority: '0.7',
      })
    }

    // County job pages (47 counties)
    for (const county of KENYA_COUNTIES) {
      urls.push({
        loc: `${SITE_URL}/jobs/county/${county.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }

    // Category job pages
    for (const category of categories) {
      urls.push({
        loc: `${SITE_URL}/jobs/category/${category.slug}`,
        lastmod: formatLastmod(category.updatedAt),
        changefreq: 'weekly',
        priority: '0.7',
      })
    }

    // Job type pages
    for (const typeSlug of Object.values(JOB_TYPE_SLUGS)) {
      urls.push({
        loc: `${SITE_URL}/jobs/type/${typeSlug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }

    // Employer detail pages
    for (const employer of employers) {
      urls.push({
        loc: `${SITE_URL}/employers/${employer.id}`,
        lastmod: formatLastmod(employer.createdAt),
        changefreq: 'weekly',
        priority: '0.7',
      })
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrlEntry).join('\n')}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
