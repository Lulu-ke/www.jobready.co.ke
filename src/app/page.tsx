'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import DeadlineStrip from '@/components/deadline-strip';
import LatestTrendingSection from '@/components/latest-trending-section';
import CategoriesGrid from '@/components/categories-grid';
import GovVacancies from '@/components/gov-vacancies';
import EntryInternLocation from '@/components/entry-intern-location';
import OpportunityGrid from '@/components/opportunity-grid';
import UniCvBursaries from '@/components/uni-cv-bursaries';
import CareerBlogNewsletter from '@/components/career-blog-newsletter';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';

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

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [deadlineJobs, setDeadlineJobs] = useState<any[]>([]);
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [trendingJobs, setTrendingJobs] = useState<any[]>([]);
  const [entryJobs, setEntryJobs] = useState<any[]>([]);
  const [internJobs, setInternJobs] = useState<any[]>([]);
  const [govJobs, setGovJobs] = useState<any[]>([]);
  // locationCounts derived from latestJobs (computed below)
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [universityOpps, setUniversityOpps] = useState<any[]>([]);
  const [bursaryOpps, setBursaryOpps] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          featuredRes,
          deadlineRes,
          latestRes,
          trendingRes,
          entryRes,
          internRes,
          govRes,
          catRes,
          oppRes,
          articleRes,
        ] = await Promise.all([
          fetch('/api/jobs?featured=true&limit=5'),
          fetch('/api/jobs?deadline=soon&limit=5'),
          fetch('/api/jobs?sort=newest&limit=10'),
          fetch('/api/jobs?sort=trending&limit=5'),
          fetch('/api/jobs?experienceLevel=entry&limit=4'),
          fetch('/api/jobs?type=Internship&limit=4'),
          fetch('/api/jobs?category=government&limit=8'),
          fetch('/api/categories'),
          fetch('/api/opportunities'),
          fetch('/api/articles'),
        ]);

        const [
          featuredData,
          deadlineData,
          latestData,
          trendingData,
          entryData,
          internData,
          govData,
          catData,
          oppData,
          articleData,
        ] = await Promise.all([
          featuredRes.json(),
          deadlineRes.json(),
          latestRes.json(),
          trendingRes.json(),
          entryRes.json(),
          internRes.json(),
          govRes.json(),
          catRes.json(),
          oppRes.json(),
          articleRes.json(),
        ]);

        setFeaturedJobs(featuredData.jobs || []);
        setDeadlineJobs(deadlineData.jobs || []);
        setLatestJobs(latestData.jobs || []);
        setTrendingJobs(trendingData.jobs || []);
        setEntryJobs(entryData.jobs || []);
        setInternJobs(internData.jobs || []);
        setGovJobs(govData.jobs || []);
        setCategories(catData.categories || []);
        setOpportunities(oppData.opportunities || []);
        setArticles(articleData.articles || []);

        // Split opportunities by type
        const allOpps = oppData.opportunities || [];
        setUniversityOpps(allOpps.filter((o: any) => o.type === 'university_admission').slice(0, 4));
        setBursaryOpps(allOpps.filter((o: any) => o.type === 'bursary' || o.type === 'scholarship').slice(0, 4));

        // Split gov jobs into county vs national
        const allGov = govData.jobs || [];
        const countyGov = allGov.filter(
          (j: any) =>
            (j.county && j.county.toLowerCase().includes('county')) ||
            (j.title && j.title.toLowerCase().includes('county'))
        );
        const nationalGov = allGov.filter(
          (j: any) =>
            !(j.county && j.county.toLowerCase().includes('county')) &&
            !(j.title && j.title.toLowerCase().includes('county'))
        );
        const padCounty = countyGov.length < 4 ? [...countyGov, ...nationalGov.slice(0, 4 - countyGov.length)] : countyGov;
        const padNational = nationalGov.length < 4 ? [...nationalGov, ...countyGov.slice(0, 4 - nationalGov.length)] : nationalGov;
        setGovJobs({ county: padCounty.slice(0, 4), national: padNational.slice(0, 4) });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  // Derive location counts from latest jobs
  const locationCounts = (() => {
    if (latestJobs.length === 0) return [];
    const locMap: Record<string, number> = {};
    latestJobs.forEach((j: any) => {
      const loc = j.county || j.location || '';
      if (loc) {
        locMap[loc] = (locMap[loc] || 0) + 1;
      }
    });
    return Object.entries(locMap)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  })();

  const defaultStats: Stats = {
    totalJobs: 2500,
    totalEmployers: 500,
    totalCategories: categories.length || 26,
    remoteJobs: 300,
  };

  const govJobsData = Array.isArray(govJobs) ? { county: [], national: govJobs } : govJobs;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      <main className="flex-1">
        <Hero stats={defaultStats} onSearch={() => {}} />
        <DeadlineStrip jobs={deadlineJobs} />
        <LatestTrendingSection
          latestJobs={latestJobs}
          trendingJobs={trendingJobs}
          featuredJobs={featuredJobs}
        />
        <CategoriesGrid categories={categories} />
        <GovVacancies
          countyJobs={govJobsData?.county || []}
          nationalJobs={govJobsData?.national || []}
        />
        <EntryInternLocation
          entryJobs={entryJobs}
          internJobs={internJobs}
          locationCounts={locationCounts}
        />
        <OpportunityGrid opportunities={opportunities} />
        <UniCvBursaries
          universityOpps={universityOpps}
          bursaryOpps={bursaryOpps}
        />
        <CareerBlogNewsletter articles={articles} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
