'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import JobDetailSheet from '@/components/job-detail-sheet';
import {
  MapPin,
  DollarSign,
  Building2,
  Wifi,
  Star,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  formatSalary,
  formatRelativeDate,
  getInitials,
  getCompanyColor,
} from '@/lib/helpers';
import { motion } from 'framer-motion';

export interface JobData {
  id: string;
  title: string;
  slug?: string;
  company: string;
  logo: string;
  currency?: string;
  location: string;
  county: string;
  type: string;
  category: { id: string; name: string; slug: string } | string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFormatted: string;
  description: string;
  requirements: string;
  howToApply: string;
  isRemote: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  experienceLevel?: string;
  closingDate: string | null;
  postedAt: string;
  employer?: { id: string; companyName: string; logoUrl: string; orgType: string; slug: string; description?: string } | null;
}

interface FeaturedJobsProps {
  onJobSelect: (job: JobData) => void;
}

export function FeaturedJobs({ onJobSelect }: FeaturedJobsProps) {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/jobs?featured=true&limit=6');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch {
        console.error('Error fetching featured jobs');
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Jobs
            </h2>
            <p className="text-gray-500 mt-1">Handpicked opportunities from top companies</p>
          </div>
          <Button
            variant="ghost"
            className="text-teal-600 text-sm"
            onClick={() => document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card
                className="group cursor-pointer hover:shadow-lg hover:border-teal-200 transition-all duration-200 border-gray-100 h-full"
                onClick={() => onJobSelect(job)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 ${getCompanyColor(job.company)}`}
                    >
                      {getInitials(job.company)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {job.isFeatured && (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0 gap-1">
                            <Star className="w-2.5 h-2.5" /> Featured
                          </Badge>
                        )}
                        {job.isUrgent && (
                          <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0 gap-1">
                            <Zap className="w-2.5 h-2.5" /> Urgent
                          </Badge>
                        )}
                        {job.isRemote && (
                          <Badge className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0 gap-1">
                            <Wifi className="w-2.5 h-2.5" /> Remote
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {job.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.county}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">
                        {formatRelativeDate(job.postedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
