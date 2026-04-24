'use client';

import Link from 'next/link';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CVCheckerCTA() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-purple-700 rounded-2xl" />
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-5">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">23,456+ CVs Checked</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
          Is Your CV ATS-Ready?
        </h2>
        <p className="text-base md:text-lg text-teal-100 mb-7 max-w-xl mx-auto">
          Check your CV against real ATS algorithms for free. Get instant scores
          for keyword match, formatting, and section completeness.
        </p>

        <Link href="/cv-checker">
          <Button
            size="lg"
            className="bg-white text-teal-700 hover:bg-teal-50 font-bold text-base px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Check Your CV Free
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>

        <p className="text-xs text-teal-200 mt-4 opacity-80">
          No sign-up required &bull; Instant results &bull; 100% free
        </p>
      </div>
    </section>
  );
}
