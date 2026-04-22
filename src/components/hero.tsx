'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, TrendingUp, Building2, GraduationCap, ArrowRight } from 'lucide-react';
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

export default function Hero({ stats, onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [animatedStats, setAnimatedStats] = useState({ totalJobs: 0, totalEmployers: 0, totalCategories: 0, remoteJobs: 0 });

  const animateStats = useCallback(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalJobs: Math.round(stats.totalJobs * eased),
        totalEmployers: Math.round(stats.totalEmployers * eased),
        totalCategories: Math.round(stats.totalCategories * eased),
        remoteJobs: Math.round(stats.remoteJobs * eased),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  useEffect(() => {
    animateStats();
  }, [animateStats]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const statItems = [
    { label: 'Active Jobs', value: animatedStats.totalJobs, icon: Briefcase, suffix: '+' },
    { label: 'Top Employers', value: animatedStats.totalEmployers, icon: Building2, suffix: '+' },
    { label: 'Job Categories', value: animatedStats.totalCategories, icon: TrendingUp, suffix: '+' },
    { label: 'Remote Jobs', value: animatedStats.remoteJobs, icon: MapPin, suffix: '+' },
  ];

  return (
    <section className="relative hero-gradient overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6"
          >
            <GraduationCap className="w-4 h-4" />
            Kenya&apos;s Fastest-Growing Job Board
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Find Your{' '}
            <span className="gradient-text">Dream Job</span>
            <br />
            in Kenya Today
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Browse thousands of opportunities from Kenya&apos;s top employers.
            Jobs, internships, scholarships &amp; more — all in one place.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl shadow-xl shadow-teal-900/5 p-3 border border-gray-100">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, company, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 py-3.5 h-auto border-0 shadow-none focus-visible:ring-0 text-base rounded-xl"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 h-auto rounded-xl text-base font-semibold shadow-lg shadow-teal-600/25 transition-all hover:shadow-teal-600/40"
              >
                <Search className="w-5 h-5 sm:mr-2" />
                <span>Search Jobs</span>
              </Button>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['Software Engineer', 'Accountant', 'Nurse', 'Remote', 'Internship'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                    document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 text-sm text-gray-500 bg-white/80 hover:bg-white hover:text-teal-600 rounded-lg border border-gray-200 hover:border-teal-200 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 max-w-3xl mx-auto mt-14"
          >
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <item.icon className="w-4 h-4 text-teal-500" />
                  <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {item.value.toLocaleString()}{item.suffix}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
