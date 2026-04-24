'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useDashboardUser } from '../dashboard-shell';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string | null;
  job: {
    id: string;
    title: string;
    slug: string;
    location: string;
    type: string;
    employer?: { companyName: string } | null;
  };
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  shortlisted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusDots: Record<string, string> = {
  pending: 'bg-amber-500',
  reviewed: 'bg-blue-500',
  shortlisted: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function ApplicationsPage() {
  useDashboardUser();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchApplications = async (status?: string) => {
    setLoading(true);
    try {
      const url = status && status !== 'all' ? `/api/applications?status=${status}` : '/api/applications';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data.applications || []);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of your job applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-xl text-sm transition-all',
              activeTab === tab.key
                ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Job Title</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Company</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Date Applied</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <Link href={`/jobs/${app.job.slug}`} className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                            {app.job.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" /> {app.job.location}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {app.job.type}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">
                            {app.job.employer?.companyName || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-500">
                            {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge className={cn('text-xs', statusColors[app.status] || 'bg-gray-100 text-gray-800')} variant="outline">
                            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', statusDots[app.status])} />
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/jobs/${app.job.slug}`}>
                            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <Card key={app.id} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/jobs/${app.job.slug}`} className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors line-clamp-1">
                        {app.job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {app.job.employer?.companyName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {app.job.employer.companyName}
                          </span>
                        )}
                        <span>·</span>
                        <span>{format(new Date(app.appliedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Badge className={cn('text-[10px] shrink-0', statusColors[app.status] || 'bg-gray-100 text-gray-800')} variant="outline">
                      <span className={cn('w-1.5 h-1.5 rounded-full mr-1', statusDots[app.status])} />
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications`}
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              {activeTab === 'all'
                ? 'Start applying to jobs and track your progress here'
                : `You don't have any ${activeTab} applications at the moment`}
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
