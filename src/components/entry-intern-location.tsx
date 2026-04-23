'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface EntryInternJob {
  id: string;
  title: string;
  company: string;
  county: string;
  closingDate: string | null;
}

interface LocationCount {
  county: string;
  count: number;
}

interface EntryInternLocationProps {
  entryJobs: EntryInternJob[];
  internJobs: EntryInternJob[];
  locationCounts: LocationCount[];
}

export default function EntryInternLocation({ entryJobs, internJobs, locationCounts }: EntryInternLocationProps) {
  const defaultLocations = [
    { county: 'Nairobi', count: 0 },
    { county: 'Mombasa', count: 0 },
    { county: 'Kisumu', count: 0 },
    { county: 'Nakuru', count: 0 },
    { county: 'Eldoret', count: 0 },
    { county: 'Remote', count: 0 },
  ];

  const locationData = locationCounts?.length > 0
    ? defaultLocations.map((dl) => {
        const found = locationCounts.find(
          (lc) => lc.county?.toLowerCase() === dl.county?.toLowerCase()
        );
        return { county: dl.county, count: found?.count || 0 };
      })
    : defaultLocations;

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Column 1: Entry Level Jobs */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
              Entry Level Jobs
            </h2>
            <div>
              {(entryJobs || []).map((job) => (
                <div
                  key={job.id}
                  className="py-1.5"
                  style={{ borderLeft: '3px solid #5B21B6', paddingLeft: '0.75rem' }}
                >
                  <Link
                    href={`/jobs/${job.id}`}
                    className="hover:text-teal-600 transition-colors no-underline text-sm text-gray-800 font-medium clickable-text"
                  >
                    {job.title} – {job.company}{job.county ? `, ${job.county}` : ''}
                  </Link>
                  {job.closingDate && (
                    <div className="text-gray-400 text-xs">
                      Deadline: {new Date(job.closingDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
              {(entryJobs || []).length === 0 && (
                <p className="text-gray-400 text-sm">No entry level jobs at this time.</p>
              )}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/jobs?experienceLevel=entry"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all entry level jobs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Internship Opportunities */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
              Internship Opportunities
            </h2>
            <div>
              {(internJobs || []).map((job) => (
                <div
                  key={job.id}
                  className="py-1.5"
                  style={{ borderLeft: '3px solid #F97316', paddingLeft: '0.75rem' }}
                >
                  <Link
                    href={`/jobs/${job.id}`}
                    className="hover:text-teal-600 transition-colors no-underline text-sm text-gray-800 font-medium clickable-text"
                  >
                    {job.title} – {job.company}{job.county ? `, ${job.county}` : ''}
                  </Link>
                  {job.closingDate && (
                    <div className="text-gray-400 text-xs">
                      Deadline: {new Date(job.closingDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
              {(internJobs || []).length === 0 && (
                <p className="text-gray-400 text-sm">No internship jobs at this time.</p>
              )}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/jobs?type=Internship"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all internships <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 3: Jobs by Location */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
              Jobs by Location
            </h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {locationData.map((loc) => (
                <div
                  key={loc.county}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Link
                    href={`/jobs?county=${encodeURIComponent(loc.county || '')}`}
                    className="text-gray-700 hover:text-teal-600 transition-colors no-underline text-sm"
                  >
                    {loc.county}
                  </Link>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {loc.count > 0 ? `${loc.count.toLocaleString()} jobs` : `${loc.county}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/jobs"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all locations <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
