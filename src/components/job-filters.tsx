'use client';

import { useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, MapPin, Briefcase, DollarSign,
  ChevronDown, X, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface Filters {
  search: string;
  location: string;
  category: string;
  type: string;
  salaryMin: string;
  salaryMax: string;
  sort: string;
}

interface JobFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: { name: string; slug: string; jobCount: number }[];
  totalResults: number;
}

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Garissa', 'Narok', 'Voi'];
const jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Fixed-Term', 'Remote'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'featured', label: 'Featured' },
  { value: 'salary-high', label: 'Salary: High to Low' },
  { value: 'salary-low', label: 'Salary: Low to High' },
];

export default function JobFilters({ filters, onFilterChange, categories, totalResults }: JobFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.salaryMin) count++;
    if (filters.salaryMax) count++;
    if (filters.sort !== 'newest') count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    onFilterChange({
      search: filters.search,
      location: '',
      category: '',
      type: '',
      salaryMin: '',
      salaryMax: '',
      sort: 'newest',
    });
  };

  const renderFilterContent = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Job title or keyword..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <MapPin className="w-4 h-4" /> Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <Briefcase className="w-4 h-4" /> Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.name}>{cat.name} ({cat.jobCount})</option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Job Type</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {jobTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Salary Range */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <DollarSign className="w-4 h-4" /> Salary Range (KSh)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min (000s)"
            value={filters.salaryMin}
            onChange={(e) => onFilterChange({ ...filters, salaryMin: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max (000s)"
            value={filters.salaryMax}
            onChange={(e) => onFilterChange({ ...filters, salaryMax: e.target.value })}
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Active filters & clear */}
      {activeFilterCount > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-teal-600 hover:text-teal-700" onClick={clearFilters}>
              <RotateCcw className="w-3 h-3 mr-1" /> Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.location && (
              <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => onFilterChange({ ...filters, location: '' })}>
                {filters.location} <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => onFilterChange({ ...filters, category: '' })}>
                {filters.category} <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => onFilterChange({ ...filters, type: '' })}>
                {filters.type} <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Desktop Filters Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {renderFilterContent()}
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(true)}
          className="w-full justify-between bg-white"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters &amp; Sort
            {activeFilterCount > 0 && (
              <Badge className="bg-teal-600 text-white text-xs ml-1">{activeFilterCount}</Badge>
            )}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile Filters Sheet */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-5 max-h-[80vh] overflow-y-auto custom-scrollbar lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {renderFilterContent()}
              <div className="mt-6">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Show {totalResults.toLocaleString()} Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
