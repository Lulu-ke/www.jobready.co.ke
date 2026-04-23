'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, MessageCircle } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Jobs', href: '/jobs' },
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'Companies', href: '/employers' },
    { label: 'Career Advice', href: '/articles' },
    { label: 'CV Services', href: '/cv-services' },
  ];

  const topBarLinks = [
    { label: 'Internships', href: '/jobs?type=Internship' },
    { label: 'Govt Jobs', href: '/jobs?category=government' },
    { label: 'Remote', href: '/jobs?isRemote=true' },
    { label: 'Scholarships', href: '/opportunities?type=scholarship' },
    { label: 'Career Advice', href: '/articles' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="hidden md:block border-b border-[#5B21B6] bg-[#F3F4F6]">
        <div className="flex justify-between items-center py-1.5 px-4 md:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3 whitespace-nowrap text-xs">
            {topBarLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-3">
                {i > 0 && <span className="text-[#1E293B]">|</span>}
                <Link
                  href={link.href}
                  className="transition hover:text-[#5B21B6] text-[#0D9488]"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap text-xs">
            <Link href="https://wa.me/" className="flex items-center gap-1 text-[#0D9488] hover:text-[#5B21B6] transition">
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </Link>
            <Link href="/articles" className="text-[#0D9488] hover:text-[#5B21B6] transition">
              Career Advice
            </Link>
            <Link href="/cv-services" className="text-[#0D9488] hover:text-[#5B21B6] transition">
              Our Services
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 shadow-md bg-[#FAFAFA] border-b-2 border-[#5B21B6]">
        <div className="flex items-center justify-between py-3 px-4 md:px-6 lg:px-8 max-w-[1280px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg bg-[#5B21B6]">
                JK
              </div>
            </Link>
            <Link href="/" className="hidden sm:block">
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight" style={{ color: '#1E293B' }}>JobReady</span>
                <span className="text-[10px] text-gray-400 leading-none tracking-wider uppercase">Kenya</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition text-[#1E293B] hover:text-[#0D9488]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search Input */}
            <form action="/jobs" method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="search"
                placeholder="Search jobs..."
                className="w-48 lg:w-56 pl-9 pr-3 py-1.5 rounded-full border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                type="text"
              />
            </form>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/"
              className="text-white px-3.5 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition bg-[#10b981] hover:bg-[#059669]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>

            {/* Sign In */}
            <Link
              href="#"
              className="text-sm font-medium text-[#5B21B6] hover:text-[#4a1a94] transition px-3 py-1.5"
            >
              Sign In
            </Link>

            {/* Create Account */}
            <Link
              href="#"
              className="text-white px-4 py-1.5 rounded-full text-sm font-semibold transition bg-[#5B21B6] hover:bg-[#4a1a94]"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 focus:outline-none p-1"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search jobs..."
                  className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                  type="text"
                />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-[#1E293B] hover:text-[#0D9488] hover:bg-gray-50 rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <a
                  href="https://wa.me/"
                  className="flex items-center justify-center gap-2 text-white px-4 py-2 rounded-full text-sm bg-[#10b981] hover:bg-[#059669] transition"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <Link
                  href="#"
                  className="text-center text-sm font-medium text-[#5B21B6] hover:text-[#4a1a94] transition px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="#"
                  className="text-center text-white px-4 py-2 rounded-full text-sm font-semibold transition bg-[#5B21B6] hover:bg-[#4a1a94]"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
