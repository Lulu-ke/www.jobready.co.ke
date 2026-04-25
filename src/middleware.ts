import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// CUID pattern: starts with 'cm' followed by lowercase alphanumeric chars, ~25 chars total
const CUID_PATTERN = /^cm[a-z0-9]{20,24}$/;

// In-memory cache to avoid repeated DB lookups
const slugCache = new Map<string, string>();

// Match table against route base path
const ROUTE_MODELS: Record<string, { model: string; basePath: string }> = {
  jobs: { model: 'job', basePath: '/jobs' },
  articles: { model: 'article', basePath: '/career-advice' },
  opportunities: { model: 'opportunity', basePath: '/opportunities' },
  updates: { model: 'jobUpdate', basePath: '/updates' },
  employers: { model: 'employer', basePath: '/companies' },
};

/**
 * Look up the slug for a given model + id.
 * Results are cached in-memory to avoid hitting the DB on every request.
 */
async function getIdToSlug(model: string, id: string): Promise<string | null> {
  const cacheKey = `${model}:${id}`;

  // Return cached result if available
  if (slugCache.has(cacheKey)) return slugCache.get(cacheKey)!;

  try {
    // Dynamic import to avoid bundling Prisma into the edge chunk at build time
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();
    if (process.env.NODE_ENV === 'development') {
      console.warn('[middleware] PrismaClient created with default DATABASE_URL. Ensure DATABASE_URL or DB_* env vars are set.');
    }

    let result: { slug: string } | null = null;

    switch (model) {
      case 'job':
        result = await db.job.findUnique({ where: { id }, select: { slug: true } });
        break;
      case 'article':
        result = await db.article.findUnique({ where: { id }, select: { slug: true } });
        break;
      case 'opportunity':
        result = await db.opportunity.findUnique({ where: { id }, select: { slug: true } });
        break;
      case 'jobUpdate':
        result = await db.jobUpdate.findUnique({ where: { id }, select: { slug: true } });
        break;
      case 'employer':
        result = await db.employer.findUnique({ where: { id }, select: { slug: true } });
        break;
    }

    await db.$disconnect();

    if (result) {
      slugCache.set(cacheKey, result.slug);

      // Limit cache size to prevent unbounded growth
      if (slugCache.size > 1000) {
        const firstKey = slugCache.keys().next().value;
        if (firstKey) slugCache.delete(firstKey);
      }
    }

    return result?.slug ?? null;
  } catch (error) {
    console.error(
      `Middleware: Failed to look up ${model} slug for id ${id}:`,
      error
    );
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Dashboard auth protection ──
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', '/dashboard');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Old route redirects (301 permanent) ──
  if (pathname.startsWith('/articles')) {
    return NextResponse.redirect(new URL(pathname.replace('/articles', '/career-advice'), request.url), 301);
  }
  if (pathname.startsWith('/employers')) {
    return NextResponse.redirect(new URL(pathname.replace('/employers', '/companies'), request.url), 301);
  }

  // ── CUID-to-slug redirect ──
  // Match only /jobs/{segment}, /career-advice/{segment}, etc. — single segment only
  // This intentionally does NOT match nested routes like /jobs/county/nairobi
  const match = pathname.match(
    /^\/(jobs|career-advice|opportunities|updates|companies)\/([^/]+)$/
  );

  if (!match) return NextResponse.next();

  const route = match[1]; // e.g. "jobs"
  const param = match[2]; // e.g. "cm1a2b3c4..." or "my-job-title"

  // If the param doesn't look like a CUID, it's already a slug — pass through
  if (!CUID_PATTERN.test(param)) return NextResponse.next();

  // Resolve the model and base path for this route
  const routeConfig = ROUTE_MODELS[route];
  if (!routeConfig) return NextResponse.next();

  const { model, basePath } = routeConfig;

  const slug = await getIdToSlug(model, param);

  if (slug) {
    // 301 permanent redirect to the slug-based URL
    const newUrl = new URL(`${basePath}/${slug}`, request.url);
    return NextResponse.redirect(newUrl, 301);
  }

  // No slug found — let the request fall through (will likely 404)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Dashboard routes — auth protection
    '/dashboard/:path*',
    // Old route redirects
    '/articles/:path*',
    '/employers/:path*',
    // Only match single-segment paths under these routes for CUID redirect
    '/jobs/:path',
    '/career-advice/:path',
    '/opportunities/:path',
    '/updates/:path',
    '/companies/:path',
  ],
};
