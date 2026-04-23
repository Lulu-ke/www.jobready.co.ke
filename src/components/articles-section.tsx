'use client';

import { motion } from 'framer-motion';
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
    <section id="articles" className="scroll-mt-20 py-12 lg:py-16 bg-gradient-to-br from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <BookOpen className="w-7 h-7 text-teal-600" />
            Career Advice
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mt-1">
            Expert tips and guides to help you land your dream job in Kenya
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md border border-gray-100 hover:border-teal-200 transition-all duration-200 cursor-pointer"
            >
              {/* Colored header bar */}
              <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-400" />

              <div className="p-5">
                <Badge variant="secondary" className="text-[10px] mb-3 bg-teal-50 text-teal-700 border-0">
                  {article.category}
                </Badge>

                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
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
                  <span className="text-xs font-medium text-teal-600 group-hover:text-teal-700 flex items-center gap-1">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
