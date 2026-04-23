'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import {
  Calculator, ClipboardList, Sprout, Plane, Landmark, Briefcase,
  Headphones, GraduationCap, Zap, HardHat, Smartphone, Building,
  Heart, Users, Shield, Rocket, Code, Scale, Truck, Megaphone,
  Globe, GanttChart, Wifi, TrendingUp, Award, MapPin
} from 'lucide-react';

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
    <section id="categories" className="scroll-mt-20 py-12 lg:py-16 bg-gradient-to-br from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
              Browse by Category
            </h2>
            <p className="text-gray-500">
              Find opportunities in your field of expertise
            </p>
          </div>
          <a
            href="#jobs"
            className="hidden sm:flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'rgb(91, 33, 182)' }}
          >
            View all {categories.length} categories
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto hide-scrollbar carousel-scroll pb-2"
          >
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Briefcase;
              return (
                <motion.button
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleCategoryClick(category)}
                  className="group flex-shrink-0 w-32 md:w-36 bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md border border-gray-100 hover:border-teal-200 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <IconComponent
                      className="w-6 h-6 transition-colors"
                      style={{ color: 'rgb(91, 33, 182)' }}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{category.jobCount} jobs</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Mobile View All link */}
        <div className="mt-4 text-center sm:hidden">
          <a
            href="#jobs"
            className="text-sm font-medium"
            style={{ color: 'rgb(91, 33, 182)' }}
          >
            View all {categories.length} categories →
          </a>
        </div>
      </div>
    </section>
  );
}
