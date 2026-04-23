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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        break;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="w-44 h-44 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <div className="grid sm:grid-cols-2 gap-4 w-full mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
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
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/cv-checker"
        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Check Another CV
      </Link>

      {/* Score Gauge */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
        <ScoreGauge score={scan.atsScore} />
      </div>

      {/* Score Breakdown */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
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
                <Progress
                  value={card.score}
                  className="h-2"
                />
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

      {/* Email Capture for non-logged-in */}
      {!session?.user && (
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-teal-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Want detailed AI suggestions for your CV?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a free account to get personalized AI improvements.
            </p>
            <Link href="/register">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Get AI Suggestions — Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="mb-8 border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session?.user ? (
              <Link href="/dashboard">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/cv-services">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  Get AI-Powered CV Rewrite — KES 200
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share */}
      <Card className="mb-8 border-0 shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Your Results
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
            >
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('whatsapp')}
            >
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
