'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { BookOpen, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import ArticleDetailSheet from '@/components/article-detail-sheet';
import NewsletterSection from '@/components/newsletter-section';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt: string;
  author?: string | null;
}

interface ArticleDetail extends Article {
  author: string | null;
}

function ArticlesListSkeleton() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-lg" />
          <Skeleton className="h-5 w-80 mx-auto rounded-lg" />
        </div>
      </section>
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Skeleton className="h-2 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="pt-3 border-t border-gray-50">
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticlesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sheet state
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        setError('Failed to load articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const pathname = usePathname();
  const sheetOpenRef = useRef(false);

  // Open detail sheet
  const openArticleSheet = useCallback(async (article: Article) => {
    setSelectedArticle(article);
    setDetailOpen(true);
    sheetOpenRef.current = true;
    router.replace(`${pathname}?view=${article.id}`, { scroll: false });

    // Fetch full details
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/articles/${article.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.article) setSelectedArticle(data.article);
      }
    } catch {
      // keep existing data
    } finally {
      setDetailLoading(false);
    }
  }, [router, pathname]);

  // Close detail sheet — stay on the current page
  const closeArticleSheet = useCallback(() => {
    setDetailOpen(false);
    sheetOpenRef.current = false;
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Listen for popstate (back button) to close sheet
  useEffect(() => {
    const handlePopState = () => {
      if (sheetOpenRef.current) {
        sheetOpenRef.current = false;
        setDetailOpen(false);
        setSelectedArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-open sheet if ?view= is present on mount
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && !detailOpen) {
      const article = articles.find((a) => a.id === viewId);
      if (article) {
        openArticleSheet(article);
      } else {
        // Fetch the article directly
        (async () => {
          try {
            setDetailLoading(true);
            setDetailOpen(true);
            const res = await fetch(`/api/articles/${viewId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.article) {
                setSelectedArticle(data.article);
              } else {
                setDetailOpen(false);
                router.replace(pathname, { scroll: false });
              }
            } else {
              setDetailOpen(false);
              router.replace(pathname, { scroll: false });
            }
          } catch {
            setDetailOpen(false);
            router.replace(pathname, { scroll: false });
          } finally {
            setDetailLoading(false);
          }
        })();
      }
    }
    // Only run on mount
  }, []);

  return (
    <div className="flex-1">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-600" />
            Career Advice &amp; Insights
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Expert tips, guides, and resources to help you navigate your career in Kenya
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700 text-white">
                Try Again
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <Skeleton className="h-2 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="pt-3 border-t border-gray-50">
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-500">Check back soon for career advice and insights.</p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !error && articles.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer"
                  onClick={() => openArticleSheet(article)}
                >
                  {/* Colored header bar */}
                  <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-400" />

                  <div className="p-5">
                    <Badge variant="secondary" className="text-[10px] mb-3 bg-teal-50 text-teal-700">
                      {article.category}
                    </Badge>

                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">{article.excerpt}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.createdAt).toLocaleDateString('en-KE', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs font-medium text-teal-600 group-hover:text-teal-700 flex items-center gap-1">
                        Read More <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterSection />

      {/* Article Detail Sheet */}
      <ArticleDetailSheet
        article={selectedArticle}
        open={detailOpen}
        onClose={closeArticleSheet}
      />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<ArticlesListSkeleton />}>
        <ArticlesPageInner />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
