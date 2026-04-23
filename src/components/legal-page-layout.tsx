'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  sections: LegalSection[];
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const sectionIds = sections.map((s) => s.id);

  // Scroll spy using IntersectionObserver to highlight the active section
  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li className="flex items-center gap-1.5">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          </li>
          <li>
            <span className="text-gray-700 font-medium">{title}</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content */}
        <div ref={contentRef} className="flex-1 min-w-0">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#1a56db] flex-shrink-0" />
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {title}
              </h1>
            </div>
            {lastUpdated && (
              <p className="text-sm text-gray-400">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mb-10 scroll-mt-[90px]"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                {section.title}
              </h2>
              <div className="text-[15px] text-gray-600 leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar — On This Page */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                On This Page
              </h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left text-sm leading-snug px-2.5 py-2 rounded-lg transition-all cursor-pointer border-0 bg-transparent ${
                        activeId === section.id
                          ? 'text-[#1a56db] font-semibold bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
