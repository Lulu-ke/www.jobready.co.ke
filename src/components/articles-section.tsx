'use client';

import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt: string;
}

interface ArticlesSectionProps {
  articles: Article[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section id="articles" className="scroll-mt-32 py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5 flex items-center gap-2" style={{ color: '#1E293B' }}>
          <BookOpen className="w-6 h-6" style={{ color: '#5B21B6' }} />
          Career Advice
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 6).map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Colored header bar */}
              <div className="h-1.5 bg-gradient-to-r from-purple-600 to-teal-500" />

              <div className="p-5">
                <Badge className="text-[10px] mb-3 bg-purple-100 text-purple-700 border-0 rounded-full">
                  {article.category}
                </Badge>

                <h3 className="font-semibold text-sm mb-2 group-hover:text-purple-700 transition-colors line-clamp-2" style={{ color: '#1E293B' }}>
                  {article.title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{article.excerpt}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.createdAt).toLocaleDateString('en-KE', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <span className="text-xs font-medium text-teal-600 group-hover:text-purple-700 flex items-center gap-1">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
