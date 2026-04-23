'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Building2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import NewsletterSection from '@/components/newsletter-section';
import { orgTypeLabel, getInitials } from '@/lib/helpers';

interface Employer {
  id: string;
  companyName: string;
  logoUrl: string | null;
  orgType: string;
  slug: string;
}

const orgTypeFilters = [
  { value: '', label: 'All Types' },
  { value: 'PRIVATE', label: 'Private Company' },
  { value: 'STARTUP', label: 'Startup' },
  { value: 'NGO', label: 'NGO' },
  { value: 'NATIONAL_GOV', label: 'National Government' },
  { value: 'COUNTY_GOV', label: 'County Government' },
  { value: 'STATE_CORPORATION', label: 'State Corporation' },
  { value: 'INTERNATIONAL_ORG', label: 'International Org' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'SMALL_BUSINESS', label: 'Small Business' },
  { value: 'FOUNDATION', label: 'Foundation' },
  { value: 'RELIGIOUS_ORG', label: 'Religious Org' },
];

function getLogoGradient(name: string): string {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeOrgType, setActiveOrgType] = useState('');

  useEffect(() => {
    async function fetchEmployers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/employers');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEmployers(data.employers || []);
      } catch (err) {
        setError('Failed to load employers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployers();
  }, []);

  const filteredEmployers = useMemo(() => {
    let filtered = employers;
    if (activeOrgType) {
      filtered = filtered.filter((e) => e.orgType === activeOrgType);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((e) => e.companyName.toLowerCase().includes(q));
    }
    return filtered;
  }, [employers, activeOrgType, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-white to-gray-50 py-12 lg:py-16 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
              <Building2 className="w-8 h-8 text-teal-600" />
              Employer Directory
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              Browse top employers hiring in Kenya — from startups to government agencies
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm p-1.5 focus-within:border-teal-400 focus-within:shadow-md transition-all">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search employers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-4 h-11 text-base rounded-full border-0 shadow-none focus-visible:ring-0 bg-transparent"
                  />
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 h-11 rounded-full text-sm font-semibold">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Org Type Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {orgTypeFilters.map((tf) => (
                <Button
                  key={tf.value}
                  variant={activeOrgType === tf.value ? 'default' : 'outline'}
                  className={
                    activeOrgType === tf.value
                      ? 'bg-teal-600 hover:bg-teal-700 text-white text-sm'
                      : 'border-gray-200 text-gray-600 hover:text-teal-600 text-sm'
                  }
                  onClick={() => setActiveOrgType(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>

            {/* Count */}
            {!loading && !error && (
              <p className="text-sm text-gray-500 mb-6">
                Showing <span className="font-semibold text-gray-900">{filteredEmployers.length}</span>{' '}
                {filteredEmployers.length === 1 ? 'employer' : 'employers'}
              </p>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700 text-white">
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-gray-100 text-center">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-5 w-24 mx-auto rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredEmployers.length === 0 && (
              <div className="text-center py-16">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No employers found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button
                  onClick={() => {
                    setActiveOrgType('');
                    setSearch('');
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Employers Grid */}
            {!loading && !error && filteredEmployers.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredEmployers.map((employer) => {
                  const gradient = getLogoGradient(employer.companyName);
                  const initials = getInitials(employer.companyName);
                  return (
                    <div
                      key={employer.id}
                      className="group p-5 rounded-2xl border border-gray-100 bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 text-center cursor-pointer"
                    >
                      {/* Logo Circle */}
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                        {initials}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-teal-700 transition-colors truncate">
                        {employer.companyName}
                      </h3>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        {orgTypeLabel(employer.orgType)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
