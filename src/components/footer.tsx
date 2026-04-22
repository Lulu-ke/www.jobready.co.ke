'use client';

import { Briefcase, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  'Job Seekers': [
    { label: 'Browse Jobs', href: '#jobs' },
    { label: 'Categories', href: '#categories' },
    { label: 'Remote Jobs', href: '#jobs' },
    { label: 'Government Jobs', href: '#jobs' },
    { label: 'Internships', href: '#jobs' },
    { label: 'Career Advice', href: '#articles' },
  ],
  'For Employers': [
    { label: 'Post a Job', href: '#' },
    { label: 'Employer Login', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Featured Listings', href: '#' },
    { label: 'Recruitment Solutions', href: '#' },
    { label: 'API Access', href: '#' },
  ],
  'Resources': [
    { label: 'Scholarships', href: '#scholarships' },
    { label: 'CV Builder', href: '#' },
    { label: 'Salary Guide', href: '#' },
    { label: 'Blog', href: '#articles' },
    { label: 'FAQ', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  'Company': [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Sitemap', href: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-tight">JobReady</span>
                <span className="text-[10px] text-gray-400 leading-none tracking-wider uppercase">Kenya</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Kenya&apos;s fastest-growing job board connecting top talent with leading employers. Jobs, internships, scholarships, and career resources — all in one place.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-gray-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} JobReady Kenya. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-red-400">&#9829;</span> in Nairobi, Kenya
          </p>
        </div>
      </div>

      {/* Bottom spacer for mobile nav */}
      <div className="h-16 lg:h-0" />
    </footer>
  );
}
