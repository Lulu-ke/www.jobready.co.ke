import Link from 'next/link';
import { Search, Briefcase, Award, BookOpen, Home } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg mx-auto">
          {/* Large 404 */}
          <div className="mb-6">
            <span className="text-[8rem] sm:text-[10rem] font-bold leading-none text-purple-100 select-none">
              404
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
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
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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
              href="/articles"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Career Advice
            </Link>
          </div>

          {/* Go Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#5B21B6' }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
