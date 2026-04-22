'use client';

import { motion } from 'framer-motion';
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
  const displayCategories = categories.slice(0, 12);

  return (
    <section id="categories" className="scroll-mt-20 bg-gray-50/50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Explore by Category
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find opportunities in your field of expertise. Browse jobs across 26+ categories.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayCategories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Briefcase;
            return (
              <motion.button
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  const event = new CustomEvent('categoryClick', { detail: category.name });
                  window.dispatchEvent(event);
                  document.querySelector('#jobs')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex flex-col items-center gap-3 p-4 lg:p-5 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <IconComponent
                    className="w-6 h-6 transition-colors"
                    style={{ color: category.color }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{category.jobCount} jobs</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
