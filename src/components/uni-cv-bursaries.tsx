'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface OppItem {
  id: string;
  title: string;
  slug?: string;
  deadline: string | null;
}

interface UniCvBursariesProps {
  universityOpps: OppItem[];
  bursaryOpps: OppItem[];
}

export default function UniCvBursaries({ universityOpps, bursaryOpps }: UniCvBursariesProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Column 1: University Applications */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
              University Applications
            </h2>
            <div>
              {(universityOpps || []).map((opp) => (
                <div
                  key={opp.id}
                  className="py-1.5"
                  style={{ borderLeft: '3px solid #5B21B6', paddingLeft: '0.75rem' }}
                >
                  <Link
                    href={`/opportunities/${opp.id}`}
                    className="hover:text-teal-600 transition-colors no-underline text-sm text-gray-800 font-medium clickable-text"
                  >
                    {opp.title}
                  </Link>
                  {opp.deadline && (
                    <div className="text-gray-400 text-xs">
                      Deadline: {new Date(opp.deadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
              {(universityOpps || []).length === 0 && (
                <p className="text-gray-400 text-sm">No university applications at this time.</p>
              )}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/opportunities?type=university_admission"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all university apps <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Free CV Review Promo */}
          <div>
            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl border border-teal-200 p-6 shadow-md text-center h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-bold text-xl mt-2" style={{ color: '#1E293B' }}>
                  📝 Free CV Review — Stand Out
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Don&apos;t let a poorly written CV cost you your dream job. Our experts will review your CV for FREE – but spots fill up fast.
                </p>
                <div className="my-3 text-sm text-gray-600">
                  Expert feedback on your CV format, content &amp; ATS compatibility.
                </div>
                <p className="text-gray-600 text-sm">
                  Get actionable feedback, beat ATS filters, and stand out – before the queue closes.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-full transition-colors w-full no-underline"
                >
                  <MessageCircle className="text-xl" />
                  Get Free Review
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Bursaries & Scholarships */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
              Bursaries &amp; Scholarships
            </h2>
            <div>
              {(bursaryOpps || []).map((opp) => (
                <div
                  key={opp.id}
                  className="py-1.5"
                  style={{ borderLeft: '3px solid #F97316', paddingLeft: '0.75rem' }}
                >
                  <Link
                    href={`/opportunities/${opp.id}`}
                    className="hover:text-teal-600 transition-colors no-underline text-sm text-gray-800 font-medium clickable-text"
                  >
                    {opp.title}
                  </Link>
                  {opp.deadline && (
                    <div className="text-gray-400 text-xs">
                      Deadline: {new Date(opp.deadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
              {(bursaryOpps || []).length === 0 && (
                <p className="text-gray-400 text-sm">No bursaries available at this time.</p>
              )}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/opportunities?type=bursary"
                className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                View all bursaries &amp; scholarships <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
