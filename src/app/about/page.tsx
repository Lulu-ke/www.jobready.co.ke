'use client';

import Link from 'next/link';
import {
  Briefcase,
  FileText,
  BookOpen,
  Shield,
  Smartphone,
  Zap,
  Award,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">About JobReady.co.ke</h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto">
              Kenya&apos;s fastest-growing job board and career services platform. We connect talented job seekers with real opportunities from verified employers across the country.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-6 text-center">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed text-center max-w-3xl mx-auto">
              To democratize access to employment opportunities in Kenya by providing a reliable, user-friendly platform that bridges the gap between job seekers and employers. We believe every Kenyan deserves a fair shot at building a meaningful career — regardless of their background, location, or connections.
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
              {/* Left */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-6">Who We Are</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    JobReady.co.ke was founded with a simple but powerful vision: to make it easier for Kenyans to find meaningful employment. We saw that too many talented individuals were missing out on opportunities — not because they lacked skills, but because they lacked access to the right information at the right time.
                  </p>
                  <p>
                    Today, we serve job seekers across all 47 counties, from Nairobi to Mombasa, Kisumu to Garissa. Our platform lists opportunities from thousands of verified employers, including government agencies, NGOs, startups, and multinational corporations. We&apos;re proud to be one of the most trusted job platforms in Kenya.
                  </p>
                  <p>
                    We&apos;ve partnered with leading organizations in education, recruitment, and career development to offer services that go beyond job listings. From professional CV writing to career coaching, interview preparation to scholarship guidance — JobReady is your complete career companion.
                  </p>
                </div>
              </div>

              {/* Right — Why JobReady? */}
              <div className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] rounded-2xl p-6 lg:p-8 text-white">
                <h3 className="text-xl font-bold mb-5">Why JobReady?</h3>
                <ul className="space-y-3">
                  {[
                    'Jobs verified directly with employers',
                    'CVs written by Kenyan market experts',
                    'Career advice tailored for Kenya',
                    'Mobile-first design for job seekers on the go',
                    'WhatsApp support for instant assistance',
                    'Free resources: templates, guides, scholarship info',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300 shrink-0 mt-0.5" />
                      <span className="text-blue-50 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-10 text-center">What We Do</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Briefcase,
                  title: 'Job Board',
                  description:
                    'Browse thousands of verified job listings from top employers across Kenya.',
                },
                {
                  icon: FileText,
                  title: 'CV Writing',
                  description:
                    'Get a professional, ATS-optimized CV written by Kenyan market experts. Starting from KSh 500.',
                },
                {
                  icon: BookOpen,
                  title: 'Career Resources',
                  description:
                    'Access expert career advice, interview tips, salary guides, and scholarship opportunities.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Impact */}
        <section className="py-16 bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-10 text-center">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10,000+', label: 'Jobs Listed' },
                { value: '5,000+', label: 'Companies' },
                { value: '50,000+', label: 'Job Seekers' },
                { value: '92%', label: 'Success Rate' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-10 text-center">Our Values</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Trust',
                  description: 'Every job listing is verified to ensure authenticity and relevance.',
                },
                {
                  icon: Smartphone,
                  title: 'Accessibility',
                  description: 'Designed for everyone, including job seekers on basic smartphones.',
                },
                {
                  icon: Zap,
                  title: 'Speed',
                  description: 'New jobs posted daily with instant notifications so you never miss out.',
                },
                {
                  icon: Award,
                  title: 'Quality',
                  description: 'We curate the best opportunities and deliver premium career services.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-purple-50 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
              Ready to Find Your Next Opportunity?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold text-sm bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/cv-services"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold text-sm bg-[#5B21B6] hover:bg-[#4a1a94] transition-colors"
              >
                Get Your CV Done
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
