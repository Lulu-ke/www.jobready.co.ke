'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Briefcase,
  BellRing,
  UserCircle,
  FileText,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDashboardUser } from './dashboard-shell';

interface ProfileData {
  id?: string;
  title?: string | null;
  summary?: string | null;
  skills?: string | null;
  experience?: unknown;
  education?: unknown;
  cvUrl?: string | null;
  location?: string | null;
  county?: string | null;
}

interface RecentApplication {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    slug: string;
    location: string;
    employer?: { companyName: string } | null;
  };
}

interface DashboardStats {
  savedJobs: number;
  activeApplications: number;
  jobAlerts: number;
  profileCompletion: number;
  profile: ProfileData;
  recentApplications: RecentApplication[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function DashboardOverview() {
  const user = useDashboardUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [savedRes, appsRes, alertsRes, profileRes] = await Promise.all([
          fetch('/api/saved-jobs'),
          fetch('/api/applications?limit=5'),
          fetch('/api/alerts'),
          fetch('/api/profile'),
        ]);

        const savedData = await savedRes.json();
        const appsData = await appsRes.json();
        const alertsData = await alertsRes.json();
        const profileData = await profileRes.json();

        const profile: ProfileData = profileData.data || {};
        const savedJobs = savedData.data?.savedJobs?.length || 0;
        const applications = appsData.data?.applications || [];
        const jobAlerts = alertsData.data?.alerts?.length || 0;

        // Calculate profile completion
        const fields = [profile.title, profile.summary, profile.skills, profile.experience, profile.education, profile.cvUrl, profile.location];
        const filled = fields.filter((f) => f !== null && f !== undefined && f !== '' && f !== '[]').length;
        const profileCompletion = Math.round((filled / 7) * 100);

        setStats({
          savedJobs,
          activeApplications: applications.filter((a: RecentApplication) => a.status !== 'rejected').length,
          jobAlerts,
          profileCompletion,
          profile,
          recentApplications: applications.slice(0, 5),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Saved Jobs',
          value: stats.savedJobs,
          icon: Bookmark,
          color: 'text-teal-600',
          bg: 'bg-teal-50',
        },
        {
          label: 'Applications',
          value: stats.activeApplications,
          icon: Briefcase,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
        {
          label: 'Job Alerts',
          value: stats.jobAlerts,
          icon: BellRing,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
        {
          label: 'Profile Completion',
          value: `${stats.profileCompletion}%`,
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0]}!</h1>
              <p className="text-teal-100 mt-1">
                {stats
                  ? stats.profileCompletion === 100
                    ? 'Your profile is complete. You\'re all set!'
                    : `Complete your profile to stand out to employers (${stats.profileCompletion}% done)`
                  : 'Loading your dashboard...'}
              </p>
            </div>
            {stats && stats.profileCompletion < 100 && (
              <Link href="/dashboard/profile">
                <Button variant="secondary" className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl">
                  Complete Profile
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${card.bg}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/profile">
          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Update Profile</p>
                <p className="text-xs text-gray-500">Keep your info current</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/cv">
          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Upload CV</p>
                <p className="text-xs text-gray-500">Stand out with your CV</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/jobs">
          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Browse Jobs</p>
                <p className="text-xs text-gray-500">Find your next role</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Applications */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Applications</CardTitle>
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : stats && stats.recentApplications.length > 0 ? (
            <div className="space-y-0">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <Link href={`/jobs/${app.job.slug}`} className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors">
                      {app.job.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {app.job.employer?.companyName} · {app.job.location}
                    </p>
                  </div>
                  <Badge className={statusColors[app.status] || 'bg-gray-100 text-gray-800'} variant="secondary">
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No applications yet</p>
              <Link href="/jobs">
                <Button variant="outline" size="sm" className="mt-3 rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
