'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, BookOpen, Calendar, User, Bookmark, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import NewsletterSection from '@/components/newsletter-section';

interface ArticleDetail {
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

interface ArticleDetailClientProps {
  article: ArticleDetail;
}

export default function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

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
                <span className="flex items-center gap-1.5" suppressHydrationWarning>
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.ceil(article.content.length / 1000)} min read
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-gray-600"
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={`w-4 h-4 mr-1.5 ${saved ? 'fill-teal-500 text-teal-500' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200 text-gray-600">
                  <Share2 className="w-4 h-4 mr-1.5" /> Share
                </Button>
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
              <span className="text-xs text-gray-400" suppressHydrationWarning>
                Published {format(new Date(article.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </article>

        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
