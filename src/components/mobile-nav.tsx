'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Search, Grid3x3, Award, User } from 'lucide-react';

const navItems = [
  { icon: Briefcase, label: 'Home', section: '' },
  { icon: Search, label: 'Jobs', section: '#jobs' },
  { icon: Grid3x3, label: 'Categories', section: '#categories' },
  { icon: Award, label: 'Funding', section: '#scholarships' },
  { icon: User, label: 'Profile', section: '' },
];

export default function MobileNav() {
  const scrollToSection = (section: string) => {
    if (section) {
      const el = document.querySelector(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => scrollToSection(item.section)}
            className="flex flex-col items-center gap-1 px-3 py-2 text-gray-400 hover:text-teal-600 active:text-teal-600 transition-colors min-w-[56px]"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
