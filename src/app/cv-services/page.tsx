'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  FileText,
  Clock,
  UserPlus,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';

/* ─── FAQ Data ──────────────────────────────────────────── */
const faqItems = [
  {
    question: 'How long does it take to get my CV?',
    answer:
      'Delivery depends on the package you choose. Our Basic CV is delivered within 48 hours, Professional CV + Cover Letter within 24 hours, and Premium Package within 12 hours. Rush delivery is also available upon request.',
  },
  {
    question: 'What information do you need from me?',
    answer:
      'We need your current CV (if you have one), details about your work experience, education, skills, and the type of job you are targeting. The more information you provide, the better the result. We will send you a simple questionnaire after you place your order.',
  },
  {
    question: 'Do you offer revisions?',
    answer:
      'Yes! Our Basic package includes 1 free revision, Professional includes 2 free revisions, and Premium includes unlimited revisions for 30 days. We want to make sure you are 100% satisfied with your CV.',
  },
  {
    question: 'Is my payment secure?',
    answer:
      'Absolutely. We process payments through M-Pesa, the most trusted mobile payment platform in Kenya. Your financial information is never stored on our servers, and all transactions are encrypted.',
  },
  {
    question: 'Can you write a CV for a specific industry?',
    answer:
      'Yes! Our writers specialize in various industries including IT, finance, healthcare, engineering, education, government, and more. Just let us know your industry when placing your order, and we will match you with the best writer for your field.',
  },
  {
    question: 'What makes JobReady CVs different?',
    answer:
      'Our CVs are written by Kenyan market experts who understand what local recruiters and ATS systems look for. We use proven formats, industry-specific keywords, and modern design principles to give you a competitive edge. With a 92% interview success rate, our track record speaks for itself.',
  },
];

/* ─── Testimonials ──────────────────────────────────────── */
const testimonials = [
  {
    name: 'Sarah Ochieng',
    role: 'Marketing Professional',
    quote:
      'I got 3 interview calls in the first week after using my new CV from JobReady. The quality was amazing and it was so professional. Best KSh 1,500 I ever spent!',
  },
  {
    name: 'David Kamau',
    role: 'Software Engineer',
    quote:
      'Thanks to JobReady\'s CV writing service, I landed a job at one of Kenya\'s top tech companies. The CV was ATS-optimized and highlighted my skills perfectly.',
  },
  {
    name: 'Mary Wairimu',
    role: 'Recent Graduate',
    quote:
      'As a fresh graduate, I had no idea how to write a professional CV. JobReady helped me get my first job within 2 weeks. The cover letter was outstanding too!',
  },
];

export default function CVServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] py-16 lg:py-20 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-200 text-xs font-medium px-3 py-1 rounded-full mb-6">
              <CheckCircle className="w-3.5 h-3.5" />
              25,000+ Job Seekers Served
            </span>

            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              Professional CV Writing Services in Kenya
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Stand out from hundreds of applicants. Our expert writers craft CVs that pass ATS systems and impress Kenyan recruiters.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a
                href="https://wa.me/254786090635"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm bg-[#10b981] hover:bg-[#059669] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <a
                href="https://wa.me/254786090635"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm bg-white text-[#1a56db] hover:bg-blue-50 transition-colors"
              >
                Get Started — from KSh 500
              </a>
            </div>

            {/* Stats inline */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> 5,000+ CVs Written
              </span>
              <span className="hidden sm:inline text-blue-300/40">|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> 92% Interview Rate
              </span>
              <span className="hidden sm:inline text-blue-300/40">|</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> 24hr Fast Delivery
              </span>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
              {[
                'ATS-Optimized',
                'Kenyan Experts',
                'Fast Turnaround',
                'Affordable Pricing',
                'Free Revisions',
                'WhatsApp Support',
              ].map((label) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Services — Pricing Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-10 text-center">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Basic CV */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Basic CV</h3>
                <p className="text-3xl font-bold text-[#5B21B6] mb-4">
                  KSh 500
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Professional CV rewrite',
                    'ATS-optimized format',
                    '48-hour delivery',
                    '1 free revision',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/254786090635?text=Hi%2C%20I%27d%20like%20to%20order%20the%20Basic%20CV%20package%20(KSh%20500)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center px-6 py-3 rounded-full text-sm font-semibold border-2 border-[#5B21B6] text-[#5B21B6] hover:bg-purple-50 transition-colors"
                >
                  Order Now
                </a>
              </div>

              {/* Professional CV + Cover Letter — Featured */}
              <div className="bg-white rounded-2xl border-2 border-purple-500 shadow-md p-6 lg:p-8 flex flex-col relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5B21B6] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-1 mt-1">Professional CV + Cover Letter</h3>
                <p className="text-3xl font-bold text-[#5B21B6] mb-4">
                  KSh 1,500
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Everything in Basic, plus:',
                    'Custom cover letter',
                    '24-hour delivery',
                    '2 free revisions',
                    'LinkedIn profile tips',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/254786090635?text=Hi%2C%20I%27d%20like%20to%20order%20the%20Professional%20CV%20%2B%20Cover%20Letter%20package%20(KSh%201%2C500)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center px-6 py-3 rounded-full text-sm font-semibold bg-[#5B21B6] hover:bg-[#4a1a94] text-white transition-colors"
                >
                  Order Now
                </a>
              </div>

              {/* Premium Package */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Premium Package</h3>
                <p className="text-3xl font-bold text-[#5B21B6] mb-4">
                  KSh 3,000
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Everything in Professional, plus:',
                    'LinkedIn profile optimization',
                    '12-hour delivery',
                    'Unlimited revisions (30 days)',
                    'Interview preparation tips',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/254786090635?text=Hi%2C%20I%27d%20like%20to%20order%20the%20Premium%20Package%20(KSh%203%2C000)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center px-6 py-3 rounded-full text-sm font-semibold border-2 border-[#5B21B6] text-[#5B21B6] hover:bg-purple-50 transition-colors"
                >
                  Order Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-10 text-center">How It Works</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  icon: CheckCircle,
                  title: 'Choose Your Service',
                  description: 'Select the package that best fits your needs and budget.',
                },
                {
                  step: 2,
                  icon: UserPlus,
                  title: 'Share Your Details',
                  description: 'Send us your current CV and career goals via WhatsApp or email.',
                },
                {
                  step: 3,
                  icon: FileText,
                  title: 'Expert Writes Your CV',
                  description: 'A Kenyan market expert crafts your professional CV and documents.',
                },
                {
                  step: 4,
                  icon: CheckCircle,
                  title: 'Receive & Apply',
                  description: 'Get your documents delivered and start applying with confidence!',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="relative w-14 h-14 bg-[#1a56db] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#5B21B6] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-10 text-center">What Our Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none"
                    aria-expanded={openFaq === index}
                  >
                    <span className="font-medium text-slate-800 text-sm pr-4">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto">
              Let our experts craft a CV that gets you noticed. Join 25,000+ Kenyans who&apos;ve already taken the leap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/254786090635"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm bg-[#10b981] hover:bg-[#059669] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Get Your CV on WhatsApp
              </a>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm bg-white text-[#1a56db] hover:bg-blue-50 transition-colors"
              >
                View All Services
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
