'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import {
  Calculator, ClipboardList, Sprout, Plane, Landmark, Briefcase,
  Headphones, GraduationCap, Zap, HardHat, Smartphone, Building,
  Heart, Users, Shield, Rocket, Code, Scale, Truck, Megaphone,
  Globe, GanttChart, Wifi, TrendingUp, Award, MapPin
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  icon: string;
  color: string;
  jobCount: number;
  description?: string;
}

interface CategoriesGridProps {
  categories: Category[];
}

const iconMap: Record<string, React.ElementType> = {
  Calculator, ClipboardList, Sprout, Plane, Landmark, Briefcase,
  Headphones, GraduationCap, Zap, HardHat, Smartphone, Building,
  Heart, Users, Shield, Rocket, Code, Scale, Truck, Megaphone,
  Globe, GanttChart, Wifi, TrendingUp, Award, MapPin,
};

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category: Category) => {
    const event = new CustomEvent('categoryClick', { detail: category.name });
    window.dispatchEvent(event);
    document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categories" className="scroll-mt-32 py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ color: '#1E293B' }}>
          Browse by Category
        </h2>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors text-teal-600 hidden md:flex cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors text-teal-600 hidden md:flex cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar scroll-smooth"
          >
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Briefcase;
              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryClick(category)}
                  className="flex-shrink-0 w-32 md:w-36 bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow no-underline group cursor-pointer"
                >
                  <div className="w-8 h-8 mx-auto mb-2">
                    <IconComponent
                      className="w-8 h-8"
                      style={{ color: '#5B21B6', fontSize: '1.75rem' }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-2" style={{ color: '#1E293B' }}>
                    {category.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* View all link */}
        <Link
          href="/jobs"
          className="text-sm font-medium text-teal-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1 mt-2"
        >
          View all {categories.length} categories <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
