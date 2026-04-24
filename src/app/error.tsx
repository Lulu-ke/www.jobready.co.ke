'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, Search, Briefcase, Award, BookOpen } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg mx-auto">
          {/* Error icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Something Went Wrong
          </h1>

          {/* Error Message */}
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Try Again */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#5B21B6' }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-slate-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <form action="/search" method="GET">
              <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm p-1.5 focus-within:border-teal-400 focus-within:shadow-md transition-all">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="q"
                    placeholder="Search for jobs, companies..."
                    className="w-full pl-12 pr-4 h-11 text-base rounded-full border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-700 placeholder-gray-400"
                    type="text"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 h-11 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Popular Links */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <Award className="w-4 h-4" />
              View Opportunities
            </Link>
            <Link
              href="/career-advice"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Career Advice
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
