'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  Upload,
  FileText,
  X,
  Phone,
  Mail,
  Star,
  Zap,
  Crown,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Link from 'next/link';

// ────────────────────────────────────────────────────────────────────────────
// Static data
// ────────────────────────────────────────────────────────────────────────────

const howItWorks = [
  {
    icon: FileCheck,
    title: 'Upload or Paste Your CV',
    description:
      'Upload a PDF/DOCX file or paste your CV text. Our system extracts the content instantly.',
  },
  {
    icon: Target,
    title: 'Instant AI Analysis',
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

const pricingPlans = [
  {
    id: 'anonymous',
    name: 'Quick Scan',
    subtitle: 'Anonymous',
    price: 'KES 100',
    priceNote: '4 scans',
    badge: null,
    features: [
      '4 AI-powered scans',
      'Instant results',
      'Email delivery',
      'Download PDF report',
    ],
    cta: 'Get Started',
    highlighted: false,
    ctaLink: null,
  },
  {
    id: 'member',
    name: 'Member',
    subtitle: 'Logged-in',
    price: '1 Free Scan',
    priceNote: 'then KES 40/scan',
    badge: 'BEST VALUE',
    features: [
      '1 free scan on sign up',
      'Save scan history',
      'Cheaper per-scan rates',
      'Email + PDF delivery',
    ],
    cta: 'Sign Up Free',
    highlighted: true,
    ctaLink: '/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Subscription',
    price: 'KES 500',
    priceNote: '/month',
    badge: null,
    features: [
      '4 scans daily (120/month)',
      'Priority AI analysis',
      'Full scan history',
      'Email + PDF delivery',
    ],
    cta: 'Subscribe Now',
    highlighted: false,
    ctaLink: '/register?plan=pro',
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
      'You can use the CV checker without an account at KES 100 for 4 scans. However, signing up gives you 1 free scan and cheaper rates (KES 40/scan). Pro members get 4 scans daily for KES 500/month.',
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

// ────────────────────────────────────────────────────────────────────────────
// Credits type
// ────────────────────────────────────────────────────────────────────────────

interface CreditsInfo {
  hasCredits: boolean;
  remainingScans: number;
  tier: 'anonymous' | 'logged_in' | 'pro';
  isPro: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────────────

export default function CVCheckerPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // ── Input state ──────────────────────────────────────────────────────────
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  // ── File upload state ────────────────────────────────────────────────────
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedText, setParsedText] = useState('');
  const [fileParsing, setFileParsing] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Credits state ────────────────────────────────────────────────────────
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  // ── Payment modal state ──────────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentWaiting, setPaymentWaiting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Scan state ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Derived: effective CV text ───────────────────────────────────────────
  const effectiveCvText = activeTab === 'upload' ? parsedText : cvText;

  // ── Session-aware credit fetching ────────────────────────────────────────
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    async function fetchCredits() {
      setCreditsLoading(true);
      try {
        const params = new URLSearchParams();
        if (session?.user?.id) {
          params.set('userId', session.user.id);
        } else if (phone.trim()) {
          params.set('phone', phone.trim());
        } else {
          setCreditsLoading(false);
          return;
        }

        const res = await fetch(`/api/credits/check?${params}`);
        const data = await res.json();
        if (res.ok) {
          setCredits(data);
        }
      } catch {
        // Silent fail — credits are non-critical
      } finally {
        setCreditsLoading(false);
      }
    }

    fetchCredits();
  }, [sessionStatus, session?.user?.id, phone]);

  // ── Cleanup polling on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // ── Credit badge text ────────────────────────────────────────────────────
  const creditBadgeText = (() => {
    if (creditsLoading) return null;
    if (!credits) return null;
    if (credits.isPro && credits.remainingScans > 0) {
      return `Pro Member — 4 scans/day`;
    }
    if (credits.hasCredits && credits.remainingScans > 0) {
      if (credits.tier === 'logged_in' && credits.remainingScans === 1) {
        return '1 Free Scan Available';
      }
      return `${credits.remainingScans} scan${credits.remainingScans > 1 ? 's' : ''} remaining`;
    }
    return null;
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // File handling
  // ──────────────────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setFileError('');
    setParsedText('');
    setUploadedFile(file);

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      setFileError('Only PDF and DOCX files are accepted.');
      setUploadedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File is too large. Maximum size is 5 MB.');
      setUploadedFile(null);
      return;
    }

    setFileParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cv-parse', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setParsedText(data.text);
      } else {
        setFileError(data.error || 'Failed to parse file.');
        setUploadedFile(null);
      }
    } catch {
      setFileError('Network error. Please try again.');
      setUploadedFile(null);
    } finally {
      setFileParsing(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setParsedText('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Payment modal polling
  // ──────────────────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (crId: string) => {
      setCheckoutRequestId(crId);
      setPaymentWaiting(true);
      setPaymentError('');

      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/mpesa/status?checkoutRequestId=${crId}`,
          );
          const data = await res.json();

          if (data.status === 'SUCCESS') {
            stopPolling();
            setPaymentWaiting(false);
            setPaymentLoading(false);
            setShowPaymentModal(false);

            // Extract creditId from status response for auto-scan
            const freshCreditId = data.credit?.id || undefined;

            // Refresh credits
            try {
              const params = new URLSearchParams();
              if (session?.user?.id) params.set('userId', session.user.id);
              else if (paymentPhone.trim())
                params.set('phone', paymentPhone.trim());
              const creditsRes = await fetch(`/api/credits/check?${params}`);
              const creditsData = await creditsRes.json();
              if (creditsRes.ok) setCredits(creditsData);
            } catch {
              // ignore
            }

            // Auto-proceed with scan, passing the new creditId
            proceedWithScan(freshCreditId);
          } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
            stopPolling();
            setPaymentWaiting(false);
            setPaymentLoading(false);
            setPaymentError(
              data.resultDesc || 'Payment failed or was cancelled. Please try again.',
            );
          }
        } catch {
          // Network error — keep polling
        }
      }, 3000);
    },
    [session?.user?.id, paymentPhone, stopPolling],
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Initiate M-Pesa payment
  // ──────────────────────────────────────────────────────────────────────────

  const handleMpesaPay = useCallback(async () => {
    const phoneToUse = paymentPhone.trim() || phone.trim();
    const phoneRegex = /^(\+?254|0)?[71]\d{8}$/;

    if (!phoneToUse || !phoneRegex.test(phoneToUse.replace(/[\s\-]/g, ''))) {
      setPaymentError('Enter a valid Kenyan phone number (e.g. 0712345678).');
      return;
    }

    setPaymentError('');
    setPaymentLoading(true);

    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToUse,
          amount: 100,
          purpose: 'scan_credits',
          userId: session?.user?.id || undefined,
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.success && data.checkoutRequestId) {
        startPolling(data.checkoutRequestId);
      } else {
        setPaymentLoading(false);
        setPaymentError(data.error || 'Failed to initiate M-Pesa payment.');
      }
    } catch {
      setPaymentLoading(false);
      setPaymentError('Network error. Please try again.');
    }
  }, [paymentPhone, phone, email, session?.user?.id, startPolling]);

  // ──────────────────────────────────────────────────────────────────────────
  // Proceed with scan
  // ──────────────────────────────────────────────────────────────────────────

  const proceedWithScan = useCallback(async (overrideCreditId?: string) => {
    if (effectiveCvText.trim().length < 50) {
      setError('Please provide at least 50 characters of CV text.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/cv-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: effectiveCvText.trim(),
          jobDescription: jobDescription.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          creditId: overrideCreditId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.scanId) {
        router.push(`/cv-checker/result?id=${data.scanId}`);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);

        // If payment required, show modal
        if (data.code === 'PAYMENT_REQUIRED' || data.code === 'NO_CREDITS') {
          setShowPaymentModal(true);
          setPaymentPhone(phone.trim());
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }, [effectiveCvText, jobDescription, email, phone, router]);

  // ──────────────────────────────────────────────────────────────────────────
  // Analyze button click handler
  // ──────────────────────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    if (effectiveCvText.trim().length < 50) {
      setError('Please provide at least 50 characters of CV text.');
      return;
    }

    // Check if we have credits before proceeding
    if (credits && credits.hasCredits) {
      // Has credits — proceed directly
      proceedWithScan();
    } else if (credits && !credits.hasCredits) {
      // No credits — show payment modal
      setShowPaymentModal(true);
      setPaymentPhone(phone.trim());
    } else {
      // Don't know credit status (anonymous, no phone) — try scan and let server handle it
      if (session?.user?.id) {
        // Logged in but credits not loaded yet — try scan
        proceedWithScan();
      } else {
        // Anonymous with no phone — show payment modal
        setShowPaymentModal(true);
        setPaymentPhone(phone.trim());
      }
    }
  }, [effectiveCvText, credits, phone, session?.user?.id, proceedWithScan]);

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
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
            ATS CV Checker
            <br />
            <span className="text-teal-200">Is Your CV Ready?</span>
          </h1>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto mb-6">
            Get an instant AI-powered ATS score. Upload your CV or paste the text.
          </p>

          {/* Credit badge */}
          {creditBadgeText && (
            <div className="inline-flex items-center gap-2">
              <Badge className="bg-green-500/90 text-white border-0 px-3 py-1 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {creditBadgeText}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* ─── Pricing Cards Section ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-10 pb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`py-0 gap-0 overflow-hidden transition-shadow hover:shadow-lg ${
                plan.highlighted
                  ? 'border-2 border-teal-500 shadow-xl relative'
                  : 'border border-gray-200 shadow-md'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-teal-500 text-white text-center text-xs font-bold py-1.5 tracking-wide">
                  ⭐ {plan.badge}
                </div>
              )}
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                {/* Plan header */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div>
                  <span
                    className={`text-2xl font-extrabold ${
                      plan.highlighted ? 'text-teal-700' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {plan.priceNote}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.highlighted
                            ? 'text-teal-500'
                            : 'text-gray-400'
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.ctaLink ? (
                  <Link href={plan.ctaLink}>
                    <Button
                      className={`w-full rounded-xl font-semibold ${
                        plan.highlighted
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      document
                        .getElementById('cv-input-section')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Main Input Section ──────────────────────────────────────────── */}
      <section id="cv-input-section" className="max-w-5xl mx-auto px-4 pb-12">
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ── Left Column: Your CV ─────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Your CV <span className="text-red-500">*</span>
                  </h3>
                  {/* Mini toggle: Upload / Paste */}
                  <div className="inline-flex h-8 rounded-lg bg-gray-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeTab === 'upload'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('paste')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeTab === 'paste'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Paste
                    </button>
                  </div>
                </div>

                {/* Upload mode */}
                {activeTab === 'upload' && (
                  <>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {!uploadedFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                          isDragOver
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isDragOver ? 'bg-teal-100' : 'bg-gray-100'
                            }`}
                          >
                            <Upload
                              className={`w-6 h-6 ${
                                isDragOver ? 'text-teal-600' : 'text-gray-400'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              {isDragOver
                                ? 'Drop your CV here'
                                : 'Drag & drop your CV'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              or <span className="text-teal-600 font-medium">browse files</span>{' '}
                              — PDF or DOCX, max 5 MB
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        {fileParsing ? (
                          <Loader2 className="w-4.5 h-4.5 text-teal-600 animate-spin flex-shrink-0" />
                        ) : parsedText ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 border-0 flex-shrink-0 text-xs"
                          >
                            Parsed
                          </Badge>
                        ) : null}
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
                          aria-label="Remove file"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    )}

                    {fileParsing && (
                      <p className="text-sm text-teal-600 mt-2 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting text from your file...
                      </p>
                    )}
                    {fileError && (
                      <p className="text-sm text-red-500 mt-2">{fileError}</p>
                    )}

                    {/* Hidden textarea to store parsed text */}
                    {parsedText && (
                      <textarea
                        value={parsedText}
                        readOnly
                        className="hidden"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    )}
                  </>
                )}

                {/* Paste mode */}
                {activeTab === 'paste' && (
                  <div>
                    <div className="flex items-center justify-end mb-1.5">
                      <span className="text-xs text-gray-400">
                        {cvText.length} characters{' '}
                        {cvText.length > 0 && cvText.length < 50 && (
                          <span className="text-red-400">(min 50)</span>
                        )}
                      </span>
                    </div>
                    <Textarea
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      placeholder={`JOHN KAMAU\nSoftware Engineer\n\nProfessional Summary\nExperienced software engineer with 5+ years...`}
                      className="min-h-[220px] resize-y text-sm"
                    />
                  </div>
                )}
              </div>

              {/* ── Right Column: Job Description ────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Job Description
                    <span className="text-gray-400 font-normal ml-1.5">(optional)</span>
                  </h3>
                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-200">
                    For keyword matching
                  </Badge>
                </div>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to get keyword matching analysis...\n\nInclude requirements, qualifications, and responsibilities for the best results."
                  className="min-h-[220px] resize-y text-sm"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Adding a job description helps our AI match your CV keywords against what employers are looking for.
                </p>
              </div>
            </div>

            {/* ── Email & Phone Inputs ──────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to receive results (optional)"
                  className="pl-10 text-sm bg-gray-50 border-gray-200"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (for M-Pesa & credit recovery)"
                  className="pl-10 text-sm bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">
              e.g., 0712345678 — used for M-Pesa payment and scan credit recovery
            </p>

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && (
              <p className="text-red-500 text-sm mt-4">{error}</p>
            )}

            {/* ── Submit ────────────────────────────────────────────────── */}
            <div className="mt-5">
              <Button
                onClick={handleAnalyze}
                disabled={
                  loading ||
                  fileParsing ||
                  effectiveCvText.trim().length < 50
                }
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
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── Payment Modal ─────────────────────────────────────────────── */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md" showCloseButton={!paymentWaiting}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              You need scan credits to analyze your CV. Purchase credits via M-Pesa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Amount display */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-teal-700">KES 100</p>
              <p className="text-sm text-teal-600 mt-1">
                for 4 AI-powered scans
              </p>
            </div>

            {/* Phone input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="e.g., 0712345678"
                  className="pl-10 text-sm"
                  disabled={paymentWaiting}
                />
              </div>
            </div>

            {/* Payment waiting state */}
            {paymentWaiting && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-800">
                  Waiting for M-Pesa confirmation...
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Check your phone and enter your M-Pesa PIN to complete the
                  payment.
                </p>
              </div>
            )}

            {/* Payment error */}
            {paymentError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {paymentError}
              </p>
            )}
          </div>

          <DialogFooter>
            {!paymentWaiting && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMpesaPay}
                  disabled={paymentLoading || !paymentPhone.trim()}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Pay via M-Pesa
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Post-payment signup suggestion */}
            {!session?.user && !paymentWaiting && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Want cheaper scans?{' '}
                <Link
                  href="/register"
                  className="text-teal-600 font-medium hover:underline"
                >
                  Create a free account
                </Link>{' '}
                to save results and get KES 40/scan rates.
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── How It Works ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Three simple steps to get your ATS score
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

      {/* ─── What We Check ─────────────────────────────────────────────── */}
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
                <Card
                  key={i}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow py-0 gap-0"
                >
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

      {/* ─── FAQ Section ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Everything you need to know about our CV checker
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

      {/* ─── CTA Section ───────────────────────────────────────────────── */}
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
