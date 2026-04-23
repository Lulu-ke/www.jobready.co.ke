'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  User,
  Bookmark,
  Share2,
  Clock,
  ChevronRight,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import NewsletterSection from '@/components/newsletter-section';
import AdSlot from '@/components/ad-slot';

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

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string | null;
  coverImage: string | null;
  createdAt: string;
}

interface ArticleDetailClientProps {
  article: ArticleDetail;
  relatedArticles: RelatedArticle[];
}

function getAuthorInitials(author: string): string {
  return author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function generateSectionTitle(paragraph: string, index: number): string {
  // Extract a short title from the first ~60 chars of a paragraph
  const trimmed = paragraph.trim();
  if (trimmed.length <= 55) return trimmed;
  const cutoff = trimmed.lastIndexOf(' ', 55);
  return (cutoff > 0 ? trimmed.slice(0, cutoff) : trimmed.slice(0, 55)) + '…';
}

export default function ArticleDetailClient({
  article,
  relatedArticles,
}: ArticleDetailClientProps) {
  const [saved, setSaved] = useState(false);

  // Split content by \n\n for paragraphs
  const paragraphs = article.content.split('\n\n').filter((p) => p.trim());
  const readTime = Math.max(1, Math.ceil(article.content.length / 1000));

  // Table of contents: show if more than 3 paragraphs
  const showToc = paragraphs.length > 3;
  const tocSections = showToc
    ? paragraphs.map((p, i) => ({
        index: i,
        title: generateSectionTitle(p, i),
      }))
    : [];

  // Inline ad after 3rd paragraph
  const inlineAdPosition = 2; // index 2 = after 3rd paragraph

  // Handle share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  // WhatsApp share
  const shareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${article.title} - JobReady Kenya`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
              <Link href="/" className="hover:text-teal-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <Link href="/articles" className="hover:text-teal-600 transition-colors">
                Articles
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-teal-600 font-medium truncate max-w-[200px] sm:max-w-none">
                {article.category}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />
              <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none hidden sm:inline">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* ========== LEFT COLUMN (2/3) ========== */}
            <div className="md:col-span-2">
              {/* Back link */}
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 -ml-2 mb-6"
                asChild
              >
                <Link href="/articles">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
                </Link>
              </Button>

              {/* Article Header Card */}
              <Card className="mb-8 border-0 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  {/* Category Badge */}
                  <Badge variant="secondary" className="text-xs mb-4 bg-teal-50 text-teal-700 border-teal-100">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {article.category}
                  </Badge>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                  </h1>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mb-5">
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
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {readTime} min read
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600"
                      onClick={() => setSaved(!saved)}
                    >
                      <Bookmark
                        className={`w-4 h-4 mr-1.5 ${saved ? 'fill-teal-500 text-teal-500' : ''}`}
                      />
                      {saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-1.5" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Excerpt Highlight */}
              {article.excerpt && (
                <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-5 mb-8">
                  <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              )}

              {/* Article Content */}
              <Card className="border-0 shadow-sm mb-8">
                <CardContent className="p-6 sm:p-8">
                  <div className="prose-custom">
                    {paragraphs.map((paragraph, index) => (
                      <div key={index}>
                        <p
                          id={`section-${index}`}
                          className="text-gray-600 leading-relaxed mb-5 text-[15px] scroll-mt-24"
                        >
                          {paragraph.trim()}
                        </p>
                        {/* Inline ad after 3rd paragraph */}
                        {index === inlineAdPosition && (
                          <div className="my-8">
                            <AdSlot slot="inline-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Article Footer */}
              <Card className="border-0 shadow-sm mb-8">
                <CardContent className="p-6 sm:p-8">
                  {/* Tags */}
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Category
                    </span>
                    <div className="mt-2">
                      <Link href={`/articles?category=${encodeURIComponent(article.category)}`}>
                        <Badge
                          variant="secondary"
                          className="bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100 transition-colors cursor-pointer"
                        >
                          {article.category}
                        </Badge>
                      </Link>
                    </div>
                  </div>

                  {/* Author Bio */}
                  {article.author && (
                    <>
                      <Separator className="my-6" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-700 font-bold text-sm">
                            {getAuthorInitials(article.author)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">Written by {article.author}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Career insights and job market analysis for Kenyan professionals.
                          </p>
                          <Link
                            href={`/articles?author=${encodeURIComponent(article.author)}`}
                            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mt-2 transition-colors"
                          >
                            View all articles by {article.author}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Share Strip */}
                  <Separator className="my-6" />
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className="text-sm text-gray-500 font-medium">Share this article:</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 rounded-full text-xs hover:border-green-300 hover:text-green-600"
                        onClick={shareWhatsApp}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 rounded-full text-xs hover:border-teal-300 hover:text-teal-600"
                        onClick={handleShare}
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Read Next Section */}
              {relatedArticles.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center gap-2 mb-5">
                    <ArrowRight className="w-5 h-5 text-teal-600" />
                    <h2 className="text-xl font-bold text-gray-900">Read Next</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedArticles.slice(0, 3).map((related) => (
                      <Link
                        key={related.id}
                        href={`/articles/${related.slug}`}
                        className="group block no-underline"
                      >
                        <Card className="border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 h-full">
                          <CardContent className="p-4">
                            <Badge
                              variant="secondary"
                              className="text-[10px] mb-2 bg-teal-50 text-teal-700 border-teal-100"
                            >
                              {related.category}
                            </Badge>
                            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2 mb-2">
                              {related.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {related.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              {related.author && <span>{related.author}</span>}
                              <span suppressHydrationWarning>
                                {format(new Date(related.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ========== RIGHT SIDEBAR (1/3) ========== */}
            <aside className="md:col-span-1 space-y-6">
              {/* Ad Slot 1 */}
              <AdSlot slot="sidebar-1" />

              {/* Table of Contents */}
              {showToc && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <h3 className="font-bold text-gray-900 text-sm">Table of Contents</h3>
                    </div>
                    <nav aria-label="Table of Contents">
                      <ol className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {tocSections.map((section) => (
                          <li key={section.index}>
                            <a
                              href={`#section-${section.index}`}
                              className="flex items-start gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors no-underline leading-snug group"
                            >
                              <span className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-teal-600 flex-shrink-0 mt-0.5 transition-colors">
                                {section.index + 1}
                              </span>
                              <span className="line-clamp-2">{section.title}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  </CardContent>
                </Card>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedArticles.slice(0, 3).map((related) => (
                        <Link
                          key={related.id}
                          href={`/articles/${related.slug}`}
                          className="group block no-underline"
                        >
                          <div className="flex gap-3">
                            {/* Number indicator */}
                            <div className="w-8 h-8 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center flex-shrink-0 transition-colors">
                              <span className="text-xs font-bold text-teal-600">
                                {relatedArticles
                                  .slice(0, 3)
                                  .indexOf(related) + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2">
                                {related.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2" suppressHydrationWarning>
                                <span>{related.category}</span>
                                <span>·</span>
                                <span>{format(new Date(related.createdAt), 'MMM d')}</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/articles?category=${encodeURIComponent(article.category)}`}
                      className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mt-4 transition-colors no-underline"
                    >
                      View all in {article.category}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Ad Slot 2 */}
              <AdSlot slot="sidebar-2" />

              {/* Newsletter CTA */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/15 flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg">
                    Career Tips in Your Inbox
                  </h3>
                  <p className="text-teal-100 text-sm mt-2 mb-4">
                    Join 50,000+ Kenyan job seekers getting weekly career advice.
                  </p>
                  <Link
                    href="/articles#newsletter"
                    className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-semibold py-2.5 px-5 rounded-full transition-colors text-sm no-underline"
                  >
                    Subscribe Free
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>

              {/* CV Writing CTA */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-purple-50 to-teal-50 p-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" style={{ color: '#5B21B6' }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: '#1E293B' }}>
                    Free CV Review — Stand Out
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Get expert feedback on your CV and boost your chances of landing your dream job.
                  </p>
                  <a
                    href="https://wa.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-full transition-colors w-full no-underline mt-4"
                  >
                    <MessageCircle className="text-xl" />
                    Get Free Review
                  </a>
                </div>
              </Card>
            </aside>
          </div>
        </div>

        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
