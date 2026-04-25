'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Target,
  ListChecks,
  BookOpen,
  AlertTriangle,
  XCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Share2,
  Loader2,
  TrendingUp,
  Scan,
  FileDown,
  Clock,
  User,
  Crown,
  Zap,
  BarChart3,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

interface ScanData {
  id: string;
  cvText: string;
  jobDescription: string | null;
  atsScore: number;
  keywordMatch: number;
  formatScore: number;
  sectionScore: number;
  readabilityScore: number;
  skillGaps: string[] | null;
  suggestions: any;
  improvements: any[] | null;
  issues: any[] | null;
  isAnalyzed: boolean;
  createdAt: string;
  scanType?: 'anonymous' | 'member_free' | 'member_paid' | 'pro';
  phone?: string | null;
  fileName?: string | null;
  scansRemaining?: number | null;
  totalScans?: number | null;
}

function getScoreColor(score: number) {
  if (score < 50) return '#ef4444';
  if (score <= 75) return '#f59e0b';
  return '#22c55e';
}

function getScoreLabel(score: number) {
  if (score < 50) return 'Needs Improvement';
  if (score <= 75) return 'Good';
  return 'Excellent';
}

function formatScanDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getScanTypeBadge(type?: string) {
  switch (type) {
    case 'pro':
      return { label: 'Pro Scan', variant: 'default' as const, className: 'bg-amber-500 hover:bg-amber-600 text-white border-0' };
    case 'member_paid':
      return { label: 'Member Paid', variant: 'secondary' as const, className: 'bg-teal-100 text-teal-800 border-teal-200' };
    case 'member_free':
      return { label: 'Member Free', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' };
    default:
      return { label: 'Anonymous', variant: 'outline' as const, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
}

function ScoreGauge({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold" style={{ color }}>
            {displayScore}
          </span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-lg font-bold" style={{ color }}>
          {getScoreLabel(score)}
        </p>
        <p className="text-sm text-gray-500">ATS Score</p>
      </div>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = searchParams.get('id');

  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(!id ? 'No scan ID provided.' : '');
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchScan() {
      try {
        const res = await fetch(`/api/cv-scan/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.scan) {
          setScan(data.scan);
        } else {
          setError(data.error || 'Scan not found.');
        }
      } catch {
        if (!cancelled) setError('Failed to load scan results.');
      }
      if (!cancelled) setLoading(false);
    }
    fetchScan();
    return () => { cancelled = true; };
  }, [id]);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/cv-scan/${id}/pdf`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-check-report-${scan?.atsScore || 'result'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(`/api/cv-scan/${id}/pdf`, '_blank');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `I just checked my CV with JobReady Kenya's ATS Checker and scored ${scan?.atsScore || 0}/100! Check yours free:`
    );
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'whatsapp': {
        const summary = `ATS Score: ${scan?.atsScore || 0}/100\nKeyword Match: ${scan?.keywordMatch || 0}/100\nFormat: ${scan?.formatScore || 0}/100\nSections: ${scan?.sectionScore || 0}/100`;
        const waText = encodeURIComponent(`I just checked my CV with JobReady Kenya's ATS Checker!\n\n${summary}\n\nCheck yours: `);
        window.open(`https://wa.me/?text=${waText}${url}`, '_blank');
        break;
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="w-44 h-44 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="w-full mt-4 space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {error || 'Scan Not Found'}
        </h2>
        <p className="text-gray-500 mb-6">
          The scan you are looking for does not exist or has expired.
        </p>
        <Button onClick={() => router.push('/cv-checker')} className="bg-teal-600 hover:bg-teal-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Check Another CV
        </Button>
      </div>
    );
  }

  const issues = Array.isArray(scan.issues) ? scan.issues : [];
  const improvements = Array.isArray(scan.improvements) ? scan.improvements : [];
  const skillGaps = Array.isArray(scan.skillGaps) ? scan.skillGaps : [];

  const missingSections = issues.filter(
    (i: any) => i.category === 'Missing Sections'
  );
  const formattingIssues = issues.filter(
    (i: any) => i.category === 'Formatting Issues'
  );
  const atsRedFlags = issues.filter(
    (i: any) => i.category === 'ATS Red Flags'
  );

  const isPro = scan.scanType === 'pro';
  const isLoggedIn = !!session?.user;

  const scoreCards = [
    {
      label: 'ATS Compatibility',
      score: scan.atsScore,
      icon: Shield,
      color: getScoreColor(scan.atsScore),
    },
    {
      label: 'Keyword Match',
      score: scan.keywordMatch,
      icon: Target,
      color: getScoreColor(scan.keywordMatch),
    },
    {
      label: 'Format & Structure',
      score: scan.formatScore,
      icon: ListChecks,
      color: getScoreColor(scan.formatScore),
    },
    {
      label: 'Section Completeness',
      score: scan.sectionScore,
      icon: BookOpen,
      color: getScoreColor(scan.sectionScore),
    },
    {
      label: 'Readability',
      score: scan.readabilityScore,
      icon: BarChart3,
      color: getScoreColor(scan.readabilityScore),
    },
  ];

  const scanTypeBadge = getScanTypeBadge(scan.scanType);
  const scanPct = scan.scansRemaining != null && scan.totalScans != null && scan.totalScans > 0
    ? (scan.scansRemaining / scan.totalScans) * 100
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/cv-checker"
        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Check Another CV
      </Link>

      {/* Credit / Scan Info Bar */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={scanTypeBadge.variant} className={scanTypeBadge.className}>
                {scanTypeBadge.label}
              </Badge>
              {scan.fileName && (
                <span className="text-xs text-gray-500 truncate max-w-[180px]" title={scan.fileName}>
                  {scan.fileName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {formatScanDate(scan.createdAt)}
            </div>
            {scan.scansRemaining != null && scan.totalScans != null && (
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                  {scan.scansRemaining} scan{scan.scansRemaining !== 1 ? 's' : ''} remaining
                </span>
                {scanPct !== null && (
                  <div className="w-20">
                    <Progress value={scanPct} className="h-1.5" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar: PDF Download + Share buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
        <Button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          variant="outline"
          className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
        >
          {pdfLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4 mr-2" />
          )}
          {pdfLoading ? 'Generating Report...' : 'Download Report'}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            Share:
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('whatsapp')}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2.5"
          >
            WhatsApp
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-8 px-2.5"
          >
            Twitter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2.5"
          >
            LinkedIn
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="h-8 px-2.5">
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
        <ScoreGauge score={scan.atsScore} />
      </div>

      {/* Score Breakdown — 5 cards in a responsive grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {scoreCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {card.label}
                    </p>
                    <p className="text-xl font-bold" style={{ color: card.color }}>
                      {card.score}/100
                    </p>
                  </div>
                </div>
                <Progress value={card.score} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Issues Found */}
      {issues.length > 0 && (
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Issues Found ({issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {missingSections.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Missing Sections
                </h4>
                <ul className="space-y-1.5">
                  {missingSections.map((issue: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {issue.message}
                      {issue.severity && (
                        <Badge
                          variant={
                            issue.severity === 'high'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="ml-auto text-xs"
                        >
                          {issue.severity}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formattingIssues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Formatting Issues
                </h4>
                <ul className="space-y-1.5">
                  {formattingIssues.map((issue: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {atsRedFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  ATS Red Flags
                </h4>
                <ul className="space-y-1.5">
                  {atsRedFlags.map((issue: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Improvements */}
      {improvements.length > 0 && (
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Top Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {improvements.slice(0, 5).map((imp: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {imp.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {imp.description}
                    </p>
                    {imp.impact && (
                      <Badge
                        variant={
                          imp.impact === 'high'
                            ? 'destructive'
                            : imp.impact === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                        className="mt-1 text-xs"
                      >
                        {imp.impact} impact
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gaps */}
      {skillGaps.length > 0 && (
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-3">
              Skills from the job description not found in your CV:
            </p>
            <div className="flex flex-wrap gap-2">
              {skillGaps.map((skill: string, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-sm border-purple-200 text-purple-700 bg-purple-50"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upsell CTA — Session-aware */}
      {!isLoggedIn && (
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-teal-50 to-purple-50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Save your results and get cheaper scans
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a free account to keep your scan history and unlock member pricing.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 line-through">KES 100/4 scans</span>
                      <span className="text-xs text-gray-400">(no account)</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-teal-500 rotate-180" />
                    <div className="flex items-center gap-1.5 font-medium text-teal-700">
                      <span>KES 40/scan + 1 free</span>
                      <span className="text-xs text-teal-600">(with account)</span>
                    </div>
                  </div>
                  <Link href="/register" className="sm:ml-auto">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoggedIn && !isPro && (
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-amber-50 to-purple-50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Upgrade to Pro for unlimited scanning
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {scan.scansRemaining != null
                    ? `You've used ${(scan.totalScans ?? 0) - scan.scansRemaining} scan${(scan.totalScans ?? 0) - scan.scansRemaining !== 1 ? 's' : ''}. Pro members get 4 scans daily for only KES 500/month.`
                    : 'Pro members get 4 scans daily for only KES 500/month.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-medium">
                      <Zap className="w-3 h-3 mr-1" />
                      4 scans/day
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 font-medium">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Priority analysis
                    </Badge>
                  </div>
                  <Link href="/pricing" className="sm:ml-auto">
                    <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                      Upgrade to Pro — KES 500/month
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoggedIn && isPro && (
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  You&apos;re a Pro member!
                </h3>
                <p className="text-sm text-gray-600">
                  {scan.scansRemaining != null
                    ? `You have ${scan.scansRemaining} scan${scan.scansRemaining !== 1 ? 's' : ''} remaining today. They reset at midnight.`
                    : 'Enjoy unlimited scanning power. Your daily scans reset at midnight.'}
                </p>
                {scanPct !== null && (
                  <div className="mt-3 flex items-center gap-3 max-w-xs">
                    <Progress value={scanPct} className="h-2 flex-1" />
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      {scan.scansRemaining}/{scan.totalScans}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check Another */}
      <div className="text-center pb-8">
        <Button
          onClick={() => router.push('/cv-checker')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8"
          size="lg"
        >
          <Scan className="w-5 h-5 mr-2" />
          Check Another CV
        </Button>
      </div>
    </div>
  );
}

export default function CVCheckerResultPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            <p className="text-gray-500 mt-4">Loading results...</p>
          </div>
        }
      >
        <ResultContent />
      </Suspense>
    </div>
  );
}
