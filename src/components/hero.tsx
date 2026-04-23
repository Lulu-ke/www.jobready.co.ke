'use client';

import { useState, useCallback } from 'react';
import { Search, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Stats {
  totalJobs: number;
  totalEmployers: number;
  totalCategories: number;
  remoteJobs: number;
}

interface HeroProps {
  stats: Stats;
  onSearch: (search: string) => void;
}

const popularSearches = ['Internships', 'Government Jobs', 'Remote', 'Nairobi'];

export default function Hero({ stats, onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h1
          className="text-2xl md:text-4xl font-bold mb-4"
          style={{ color: '#1E293B' }}
        >
          Find Your Next{' '}
          <span style={{ color: '#5B21B6' }}>Opportunity</span>{' '}
          in Kenya
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Jobs, internships, scholarships, and government vacancies — all in one place.
        </p>

        {/* Search Form */}
        <form
          className="max-w-2xl mx-auto mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title, keyword, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-800 bg-white"
              />
            </div>
            <Button
              type="submit"
              className="px-6 py-3 rounded-full font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              style={{ backgroundColor: '#F97316' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EA580C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F97316')}
            >
              <Search className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Search Jobs</span>
            </Button>
          </div>
        </form>

        {/* Popular Searches */}
        <div className="flex flex-wrap justify-center gap-2 text-sm mb-5">
          <span className="text-gray-500">Popular:</span>
          <span className="flex items-center gap-2">
            {popularSearches.map((tag, i) => (
              <span key={tag} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-400">&middot;</span>}
                <button
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                    document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-teal-600 hover:text-purple-700 transition-colors"
                >
                  {tag}
                </button>
              </span>
            ))}
          </span>
        </div>

        {/* Trust Badge */}
        <div className="max-w-2xl mx-auto pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Join {(stats.totalJobs / 4).toLocaleString() || '10,000'}+ job seekers getting hired faster with optimized CVs and real opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}
