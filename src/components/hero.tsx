'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <section className="relative bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-6 border border-teal-100"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Kenya&apos;s #1 Job Board
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-800 mb-6 leading-tight">
            Find Your Next{' '}
            <span style={{ color: 'rgb(91, 33, 182)' }}>Opportunity</span>
            <br />
            in Kenya
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Jobs, internships, scholarships, and government vacancies — all in one place.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm p-1.5 focus-within:border-teal-400 focus-within:shadow-md transition-all">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, company, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 py-3 h-auto border-0 shadow-none focus-visible:ring-0 text-base rounded-full bg-transparent"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 h-auto rounded-full text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
              >
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search Jobs</span>
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="flex items-center justify-center gap-1 mt-4 text-sm">
              <span className="text-gray-400 font-medium">Popular:</span>
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                    document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Bottom Stat Line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm">
              <Users className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-gray-600">
                Join <span className="font-semibold text-slate-800">{(stats.totalJobs / 4).toLocaleString()}+</span> job seekers getting hired faster
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
