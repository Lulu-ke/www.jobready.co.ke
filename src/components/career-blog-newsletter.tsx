'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Loader, Check, AlertCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  createdAt: string;
}

// ─── Subscribe Form ────────────────────────────────────────────
function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setResult('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setResult(null);
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.ok || res.status === 201) {
        setResult('success');
        setEmail('');
      } else {
        setResult('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    } catch {
      setResult('error');
      setErrorMsg('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 text-center">
      {result === null ? (
        <>
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-2">
            <Mail className="w-6 h-6" style={{ color: '#5B21B6' }} />
          </div>
          <h3 className="font-bold text-lg" style={{ color: '#1E293B' }}>
            Never Miss an Opportunity
          </h3>
          <p className="text-gray-500 text-sm mt-1 mb-3">
            Get the latest jobs, scholarships, and career tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              disabled={loading}
              className="w-full px-3 py-2 rounded-full border border-gray-300 text-sm text-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-2 rounded-full transition-colors text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#5B21B6' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4a1a94')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          {result === 'error' && errorMsg && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </>
      ) : result === 'success' ? (
        <div className="py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-2">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-lg" style={{ color: '#1E293B' }}>
            You&apos;re Subscribed!
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Welcome aboard! Check your inbox for a confirmation email.
          </p>
          <p className="text-xs text-gray-400 mt-3">
            We&apos;ll send you the latest jobs and career tips.
          </p>
          <button
            onClick={resetForm}
            className="mt-3 text-xs text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <div className="py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-bold text-lg" style={{ color: '#1E293B' }}>
            Something went wrong
          </h3>
          <p className="text-gray-500 text-sm mt-1">{errorMsg}</p>
          <button
            onClick={resetForm}
            className="mt-3 text-xs text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Career Blog + Newsletter Combined ─────────────────────────
interface CareerBlogNewsletterProps {
  articles: Article[];
  onArticleClick?: (article: Article) => void;
}

const categoryColors: Record<string, string> = {
  'Career Advice': '#5B21B6',
  'Job Search': '#0D9488',
  'Interview Tips': '#F97316',
  'CV Writing': '#2563EB',
  default: '#6B7280',
};

export default function CareerBlogNewsletter({ articles, onArticleClick }: CareerBlogNewsletterProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Left: Blog cards (3/4) */}
          <div className="md:col-span-3">
            <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ color: '#1E293B' }}>
              Career Advice &amp; News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.slice(0, 3).map((article) => {
                const catColor = categoryColors[article.category] || categoryColors.default;
                return onArticleClick ? (
                  <div
                    key={article.id}
                    onClick={() => onArticleClick(article)}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  >
                    <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center">
                      <span className="text-4xl">📰</span>
                    </div>
                    <div className="p-4">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-2"
                        style={{
                          backgroundColor: `${catColor}20`,
                          color: catColor,
                        }}
                      >
                        {article.category}
                      </span>
                      <h3
                        className="font-bold line-clamp-2"
                        style={{ color: '#1E293B', fontSize: '0.95rem' }}
                      >
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="inline-block mt-3 text-xs font-medium text-teal-600 group-hover:text-purple-700 transition-colors">
                        Read More <ArrowRight className="w-3 h-3 inline" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group no-underline"
                  >
                    <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center">
                      <span className="text-4xl">📰</span>
                    </div>
                    <div className="p-4">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-2"
                        style={{
                          backgroundColor: `${catColor}20`,
                          color: catColor,
                        }}
                      >
                        {article.category}
                      </span>
                      <h3
                        className="font-bold line-clamp-2"
                        style={{ color: '#1E293B', fontSize: '0.95rem' }}
                      >
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="inline-block mt-3 text-xs font-medium text-teal-600 group-hover:text-purple-700 transition-colors">
                        Read More <ArrowRight className="w-3 h-3 inline" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 text-right">
              <Link
                href="/articles"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Newsletter subscribe (1/4) */}
          <div>
            <SubscribeForm />
          </div>
        </div>
      </div>
    </section>
  );
}
