'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, BookOpen, Calendar, User, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MobileNav from '@/components/mobile-nav';
import NewsletterSection from '@/components/newsletter-section';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string | null;
  coverImage: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (!res.ok) throw new Error('Article not found');
        const data = await res.json();
        setArticle(data.article || null);
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 lg:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="mb-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'This article does not exist or has been removed.'}</p>
            <Button onClick={() => router.push('/articles')} className="bg-teal-600 hover:bg-teal-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Button>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  // Split content by \n\n for paragraphs
  const paragraphs = article.content.split('\n\n').filter((p) => p.trim());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 -ml-2"
              onClick={() => router.push('/articles')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Button>
          </div>
        </div>

        <article className="py-8 lg:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Article Header */}
            <header className="mb-8">
              <Badge variant="secondary" className="text-xs mb-4 bg-teal-50 text-teal-700">
                <BookOpen className="w-3 h-3 mr-1" />
                {article.category}
              </Badge>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {article.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {article.author}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.ceil(article.content.length / 1000)} min read
                </span>
              </div>

              <Separator className="mt-6" />
            </header>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8 border-l-4 border-teal-500 pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Content */}
            <div className="prose-custom">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-5 text-[15px]">
                  {paragraph.trim()}
                </p>
              ))}
            </div>

            {/* Footer */}
            <Separator className="my-8" />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:text-teal-600"
                onClick={() => router.push('/articles')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
              </Button>
              <span className="text-xs text-gray-400">
                Published {format(new Date(article.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </article>

        <NewsletterSection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
