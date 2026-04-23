'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  MapPin,
  Building2,
  Trash2,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useDashboardUser } from '../dashboard-shell';

interface SavedJob {
  id: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    location: string;
    type: string;
    employer?: { companyName: string } | null;
  };
}

export default function SavedJobsPage() {
  useDashboardUser();

  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch('/api/saved-jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.data.savedJobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId: string) => {
    try {
      const res = await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('Job unsaved');
        setJobs((prev) => prev.filter((j) => j.job.id !== jobId));
      } else {
        toast.error(data.error || 'Failed to unsave job');
      }
    } catch (error) {
      console.error('Failed to unsave job:', error);
      toast.error('Failed to unsave job');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 mt-1">Jobs you&apos;ve bookmarked for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((saved) => (
            <Card key={saved.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${saved.job.slug}`} className="text-base font-semibold text-gray-900 hover:text-teal-600 transition-colors line-clamp-1">
                      {saved.job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      {saved.job.employer?.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {saved.job.employer.companyName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {saved.job.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {saved.job.type}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Saved {format(new Date(saved.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUnsave(saved.job.id)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Link href={`/jobs/${saved.job.slug}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50 text-xs">
                      View Job <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No saved jobs yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Start browsing jobs and save the ones that interest you
            </p>
            <Link href="/jobs">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
