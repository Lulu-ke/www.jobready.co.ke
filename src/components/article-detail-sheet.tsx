'use client';

import { useState } from 'react';
import { X, Calendar, User, Share2, BookOpen, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  author: string | null;
  createdAt: string;
}

interface ArticleDetailSheetProps {
  article: Article | null;
  open: boolean;
  onClose: () => void;
}

export default function ArticleDetailSheet({ article, open, onClose }: ArticleDetailSheetProps) {
  const [saved, setSaved] = useState(false);

  if (!article) return null;

  const paragraphs = article.content.split('\n\n').filter((p) => p.trim());
  const readTime = Math.ceil(article.content.length / 1000);

  const shareWhatsApp = () => {
    const text = `${article.title} - Read on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0 [&>button]:hidden">
        {/* Sticky header */}
        <SheetHeader className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-base font-semibold text-gray-900 truncate flex-1 min-w-0">
              {article.title}
            </SheetTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 truncate">{article.category}</span>
          </div>
        </SheetHeader>

        <div className="px-5 py-5 space-y-6">
          {/* Category Badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-[10px] bg-teal-50 text-teal-700">
              <BookOpen className="w-3 h-3 mr-1" />
              {article.category}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h2>
          </div>

          {/* Meta Info */}
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
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              {readTime} min read
            </span>
          </div>

          <Separator />

          {/* Excerpt highlight box */}
          {article.excerpt && (
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Content paragraphs */}
          <div>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm text-gray-600 leading-relaxed mb-5">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4">
            <Button
              variant="outline"
              className="flex-1 py-3 text-base"
              onClick={shareWhatsApp}
            >
              <Share2 className="w-4 h-4 mr-2 text-green-600" />
              Share via WhatsApp
            </Button>
          </div>

          {/* Bottom actions */}
          <div className="flex gap-2 pt-1 pb-4 border-t border-gray-100">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500 hover:text-teal-600"
              onClick={() => setSaved(!saved)}
            >
              <BookOpen className={`w-4 h-4 mr-2 ${saved ? 'fill-teal-500 text-teal-500' : ''}`} />
              {saved ? 'Saved' : 'Save Article'}
            </Button>
          </div>

          {/* View Full Page link */}
          <div className="pt-1 pb-4 border-t border-gray-100">
            <a
              href={`/articles/${article.id}`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View Full Page
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
