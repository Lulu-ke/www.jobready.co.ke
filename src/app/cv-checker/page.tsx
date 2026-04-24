'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scan,
  Sparkles,
  FileCheck,
  Target,
  ListChecks,
  Shield,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

const howItWorks = [
  {
    icon: FileCheck,
    title: 'Paste Your CV',
    description:
      'Upload or paste your CV text into our checker. No file upload needed — just copy and paste.',
  },
  {
    icon: Target,
    title: 'Instant Analysis',
    description:
      'Our AI scans for ATS compatibility, keywords, formatting, and more in seconds.',
  },
  {
    icon: Sparkles,
    title: 'Get Your Score',
    description:
      'Receive a detailed ATS score with actionable improvement tips to boost your chances.',
  },
];

const checks = [
  {
    icon: Shield,
    title: 'ATS Compatibility',
    description:
      'Checks for tables, images, headers, special characters that confuse ATS systems',
  },
  {
    icon: Target,
    title: 'Keyword Match',
    description:
      'Matches your skills against job description requirements for better alignment',
  },
  {
    icon: ListChecks,
    title: 'Format & Structure',
    description:
      'Evaluates bullet points, sections, date formatting, and overall consistency',
  },
  {
    icon: BookOpen,
    title: 'Section Completeness',
    description:
      'Verifies all essential CV sections like summary, experience, education are present',
  },
  {
    icon: Lightbulb,
    title: 'Readability',
    description:
      'Checks sentence length, action verbs, clarity, and professional tone',
  },
];

const faqs = [
  {
    question: 'What is an ATS?',
    answer:
      'ATS stands for Applicant Tracking System. It is software used by employers to filter and rank job applications. Over 90% of large companies in Kenya use ATS to screen CVs before a human ever sees them. If your CV is not ATS-friendly, it may never reach a recruiter.',
  },
  {
    question: 'How does the CV checker work?',
    answer:
      'Our AI-powered CV checker analyzes your CV text against common ATS algorithms. It checks for formatting issues, missing sections, keyword relevance, readability, and more. You get an instant score out of 100 with specific suggestions for improvement.',
  },
  {
    question: 'Is my CV data secure?',
    answer:
      'Absolutely. Your CV text is processed securely and never shared with third parties. We do not store your full CV text permanently — only the analysis results. Your data is protected in accordance with the Kenya Data Protection Act 2019.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No! You can use the CV checker completely free without signing up. However, creating a free account lets you save your results, track improvements over time, and access our AI-powered CV builder.',
  },
  {
    question: 'How can I improve my ATS score?',
    answer:
      'Focus on these key areas: use a clean, simple format without tables or graphics; include relevant keywords from the job description; ensure all essential sections (summary, experience, education, skills) are present; use action verbs and keep bullet points concise. Our AI suggestions will guide you through specific improvements.',
  },
  {
    question: 'How accurate is the ATS score?',
    answer:
      'Our checker analyzes your CV against common ATS criteria used by leading systems. While no checker can replicate every ATS exactly, our AI has been trained on thousands of CVs and provides highly accurate assessments that align with how most ATS systems evaluate applications.',
  },
];

export default function CVCheckerPage() {
  const router = useRouter();
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (cvText.trim().length < 50) {
      setError('Please paste at least 50 characters of CV text.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/cv-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvText.trim(),
          jobDescription: jobDescription.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.scanId) {
        router.push(`/cv-checker/result?id=${data.scanId}`);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">23,456+ CVs Checked</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Free ATS CV Checker
            <br />
            <span className="text-teal-200">Is Your CV Ready?</span>
          </h1>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto mb-8">
            Paste your CV and get an instant ATS compatibility score.
            <br className="hidden md:block" />
            No sign-up required.
          </p>
        </div>
      </section>

      {/* Main Input Section */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 pb-12">
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste your CV text <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={`JOHN KAMAU\nSoftware Engineer\n\nProfessional Summary\nExperienced software engineer with 5+ years...`}
                  className="min-h-[200px] resize-y text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste job description{' '}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to get keyword matching analysis..."
                  className="min-h-[200px] resize-y text-sm"
                />
              </div>
            </div>

            {/* Email capture */}
            <div className="mb-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to save results (optional)"
                className="max-w-sm text-sm bg-gray-50 border-gray-200"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || cvText.trim().length < 50}
              className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 text-base rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing your CV...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5 mr-2" />
                  Analyze My CV
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Three simple steps to get your free ATS score
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <div className="text-xs font-bold text-teal-600 mb-1">
                    STEP {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            What We Check
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Our AI analyzes your CV across five critical dimensions
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checks.map((check, i) => {
              const Icon = check.icon;
              return (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {check.title}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Everything you need to know about our free CV checker
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-gray-50 rounded-xl px-5 border-0 data-[state=open]:bg-teal-50"
              >
                <AccordionTrigger className="text-sm font-semibold text-gray-900 hover:no-underline py-4 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Want AI-Powered CV Suggestions?
          </h2>
          <p className="text-teal-100 mb-8">
            Create a free account to save results, build your CV with AI, and
            generate cover letters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              Create Free Account
            </Link>
            <Link
              href="/cv-services"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition"
            >
              View CV Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
