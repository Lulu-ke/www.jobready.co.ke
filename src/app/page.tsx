'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import JobList from '@/components/job-list';
import CategoriesGrid from '@/components/categories-grid';
import EmployerMarquee from '@/components/employer-marquee';
import ScholarshipsSection from '@/components/scholarships-section';
import ArticlesSection from '@/components/articles-section';
import NewsletterSection from '@/components/newsletter-section';
import Footer from '@/components/footer';
import MobileNav from '@/components/mobile-nav';

interface Stats {
  totalJobs: number;
  totalEmployers: number;
  totalCategories: number;
  remoteJobs: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  jobCount: number;
  description?: string;
}

interface Employer {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string;
  deadline: string | null;
  amount: string | null;
  level: string;
  isFeatured: boolean;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchFromHero, setSearchFromHero] = useState('');

  // Handle category clicks from grid
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchFromHero(customEvent.detail);
    };
    window.addEventListener('categoryClick', handler);
    return () => window.removeEventListener('categoryClick', handler);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, catRes, empRes, schRes, artRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/categories'),
          fetch('/api/employers'),
          fetch('/api/scholarships'),
          fetch('/api/articles'),
        ]);

        const [statsData, catData, empData, schData, artData] = await Promise.all([
          statsRes.json(),
          catRes.json(),
          empRes.json(),
          schRes.json(),
          artRes.json(),
        ]);

        setStats(statsData);
        setCategories(catData.categories || []);
        setEmployers(empData.employers || []);
        setScholarships(schData.scholarships || []);
        setArticles(artData.articles || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleHeroSearch = useCallback((search: string) => {
    setSearchFromHero(search);
  }, []);

  const defaultStats: Stats = {
    totalJobs: stats?.totalJobs || 2500,
    totalEmployers: stats?.totalEmployers || 500,
    totalCategories: stats?.totalCategories || 26,
    remoteJobs: stats?.remoteJobs || 300,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero stats={defaultStats} onSearch={handleHeroSearch} />
        <EmployerMarquee employers={employers} />
        <CategoriesGrid categories={categories} />
        <JobList initialSearch={searchFromHero} />
        <ScholarshipsSection scholarships={scholarships} />
        <ArticlesSection articles={articles} />
        <NewsletterSection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
