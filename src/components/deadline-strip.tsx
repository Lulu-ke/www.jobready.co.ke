'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

interface DeadlineJob {
  id: string;
  title: string;
  company: string;
  county: string;
  closingDate: string;
  slug?: string;
}

function getCountdownText(deadline: string | null): string | null {
  if (!deadline) return null;
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) return 'CLOSED';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const deadlineDate = new Date(deadline);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (days === 0 && hours > 0) return `${hours}h left`;
  if (days === 0) return 'Today';
  if (deadlineDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return `${days}d left`;
}

function CountdownDisplay({ deadline }: { deadline: string | null }) {
  const [text, setText] = useState(getCountdownText(deadline));

  const tick = useCallback(() => {
    setText(getCountdownText(deadline));
  }, [deadline]);

  useEffect(() => {
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [tick]);

  return (
    <span className="text-red-500 text-xs font-medium inline-flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {text}
    </span>
  );
}

interface DeadlineStripProps {
  jobs: DeadlineJob[];
}

export default function DeadlineStrip({ jobs }: DeadlineStripProps) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-red-50 to-white py-4 md:py-6">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Urgency block */}
          <div className="md:col-span-2">
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm md:text-base">
                <span>🔥</span>
                Don&apos;t Miss Out – Applications Close soon
              </div>
            </div>
            <div className="space-y-2">
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="flex flex-wrap justify-between items-center text-sm"
                >
                  <div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-semibold text-gray-800 hover:text-teal-600 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <span className="text-gray-500">
                      {' '}
                      – {job.company}
                      {job.county ? ` – ${job.county}` : ''}
                    </span>
                  </div>
                  <CountdownDisplay deadline={job.closingDate} />
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <Link
                href="/jobs?sort=deadline"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all urgent jobs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Ad placeholder */}
          <div>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center" style={{ height: 200 }}>
              <p className="text-gray-400 text-2xl mb-2">📢</p>
              <p className="text-gray-500 font-medium text-sm">Google Ad Placeholder</p>
              <p className="text-xs text-gray-400">300x200</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
