'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  Save,
  Download,
  Wand2,
  Sparkles,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Scan,
  FileText,
  Briefcase,
  GraduationCap,
  Star,
  Award,
  Globe,
  Eye,
  Upload,
  Users,
  Lock,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Layout,
  Cpu,
  FileUp,
  Monitor,
  FileDown,
  ShieldCheck,
  Zap,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { extractCVFields } from '@/lib/cv-local-extractor';

/* ─── Types ─────────────────────────────────────────────── */
interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: string;
}

interface Referee {
  id: string;
  name: string;
  title: string;
  organization: string;
  phone: string;
  email: string;
}

type Template = 'modern' | 'classic' | 'minimal';

const uid = () => Math.random().toString(36).slice(2, 9);

const TEMPLATES: { key: Template; label: string; desc: string }[] = [
  { key: 'modern', label: 'Modern', desc: 'Teal & purple accent colors' },
  { key: 'classic', label: 'Classic', desc: 'Traditional professional look' },
  { key: 'minimal', label: 'Minimal', desc: 'Clean and understated' },
];

/* ─── Demo Data ─────────────────────────────────────────── */
const DEMO = {
  name: 'Jane Wanjiku', professionalTitle: 'Certified Public Accountant (CPA-K)',
  email: 'jane.wanjiku@email.com', phone: '+254 712 345 678', location: 'Nairobi, Kenya',
  linkedin: 'linkedin.com/in/janewanjiku', portfolio: '',
  summary: 'Results-driven CPA-K certified accountant with 5+ years of experience in financial reporting, audit, and tax compliance across manufacturing and banking sectors. Proven ability to reduce audit findings by 40% and streamline month-end close processes by 3 days.',
  experience: [
    { id: 'demo1', company: 'Equity Bank Kenya', role: 'Senior Accountant', startDate: 'Mar 2021', endDate: 'Present', current: true, description: 'Led month-end close for 3 business units with KES 2B+ in assets\nPrepared IFRS-compliant financial statements and notes\nReduced audit findings by 40% through improved internal controls\nMentored 2 junior accountants on tax compliance and reporting' },
    { id: 'demo2', company: 'KPMG East Africa', role: 'Audit Associate', startDate: 'Jan 2019', endDate: 'Feb 2021', current: false, description: 'Conducted statutory audits for 15+ clients in manufacturing and banking\nPrepared audit working papers and tested internal controls\nIdentified KES 50M in potential cost savings for a manufacturing client' },
  ],
  education: [
    { id: 'edemo1', institution: 'University of Nairobi', degree: 'Bachelor of Commerce', field: 'Accounting', startYear: '2015', endYear: '2018' },
  ],
  skills: ['IFRS Reporting', 'Financial Analysis', 'Tax Compliance (KRA)', 'Sage Pastel', 'QuickBooks', 'Excel Advanced', 'Internal Audit', 'Budgeting & Forecasting'],
  certifications: [
    { id: 'cdemo1', name: 'CPA-K (Certified Public Accountant - Kenya)', issuer: 'ICPAK', year: '2020' },
    { id: 'cdemo2', name: 'CIMA Diploma in Management Accounting', issuer: 'CIMA', year: '2022' },
  ],
  languages: [
    { id: 'ldemo1', name: 'English', proficiency: 'Fluent' },
    { id: 'ldemo2', name: 'Swahili', proficiency: 'Native' },
  ],
  referees: [
    { id: 'rdemo1', name: 'John Ochieng', title: 'Finance Director', organization: 'Equity Bank', phone: '+254 722 111 222', email: 'j.ochieng@equity.co.ke' },
  ],
  careerStrengths: ['Financial Reporting: Expert in IFRS and GAAP compliance', 'Team Leadership: Managed cross-functional teams of 5+ members', 'Process Improvement: Streamlined close cycles reducing turnaround by 30%'],
  interests: ['Mentoring upcoming accountants', 'Financial literacy in rural communities'],
};

/* ─── Shared HTML escape ────────────────────────────────── */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

/* ─── Standalone preview HTML builder (accepts data as params) ─── */
function buildPreviewHTMLFromData(
  t: Template,
  data: {
    name: string; professionalTitle: string; email: string; phone: string;
    location: string; linkedin: string; portfolio: string; summary: string;
    experience: Experience[]; education: Education[]; skills: string[];
    careerStrengths: string[]; certifications: Certification[];
    languages: Language[]; referees: Referee[]; interests: string[];
  }
) {
  const ts: Record<Template, string> = {
    modern: 'h1{color:#0d9488}h2{border-bottom-color:#7c3aed;color:#7c3aed}.skill-tag{background:#f5f3ff;color:#7c3aed;border-color:#ede9fe}',
    classic: 'h1{color:#1a1a1a}h2{border-bottom-color:#374151;color:#374151}.skill-tag{background:#f3f4f6;color:#374151;border-color:#d1d5db}',
    minimal: 'h1{color:#6b7280;font-weight:300}h2{border-bottom-color:#d1d5db;color:#6b7280;font-weight:400;letter-spacing:2px}.skill-tag{background:#f9fafb;color:#6b7280;border-color:#e5e7eb}',
  };
  const cp: string[] = [];
  if (data.email) cp.push(`<span>${esc(data.email)}</span>`);
  if (data.phone) cp.push(`<span>${esc(data.phone)}</span>`);
  if (data.location) cp.push(`<span>${esc(data.location)}</span>`);
  let h = `<style>${ts[t]}</style>`;
  h += `<h1>${esc(data.name) || 'Your Name'}</h1>`;
  if (data.professionalTitle) h += `<p style="margin:0 0 8px;font-size:14px;color:#666;font-weight:500">${esc(data.professionalTitle)}</p>`;
  if (data.linkedin) cp.push(`<span>${esc(data.linkedin)}</span>`);
  if (data.portfolio) cp.push(`<span>${esc(data.portfolio)}</span>`);
  if (cp.length) h += `<div class="contact">${cp.join('')}</div>`;
  if (data.summary) h += `<p style="margin-bottom:16px">${esc(data.summary).replace(/\n/g, '<br>')}</p>`;
  if (data.experience.length) {
    h += '<h2>Work Experience</h2>';
    data.experience.forEach((e) => { if (e.role || e.company) {
      const descHtml = e.description
        ? (() => {
            const lines = e.description.split(/\n/).filter(l => l.trim());
            const hasBulletChars = lines.some(l => /^[•·▪▸►→●\-*]\s/.test(l.trim()));
            const bulletItems = hasBulletChars
              ? lines.map(l => l.replace(/^[•·▪▸►→●\-*]\s*/, '').trim()).filter(Boolean)
              : lines;
            if (bulletItems.length > 1) {
              return '<ul style="margin:4px 0;padding-left:18px;list-style:disc">' +
                bulletItems.map(b => `<li style="font-size:13px;margin:1px 0">${esc(b)}</li>`).join('') +
                '</ul>';
            }
            return '<div class="exp-desc">' + esc(e.description).replace(/\n/g, '<br>') + '</div>';
          })()
        : '';
      h += `<div class="exp-item"><div class="exp-header">${esc(e.role) || 'Role'}</div><div class="exp-sub">${esc(e.company) || ''}${e.startDate ? ' | ' + esc(e.startDate) : ''}${e.endDate ? ' - ' + esc(e.endDate) : ''}${e.current ? ' - Present' : ''}</div>${descHtml}</div>`;
    } });
  }
  if (data.education.length) {
    h += '<h2>Education</h2>';
    data.education.forEach((e) => { if (e.institution || e.degree) h += `<div class="list-item"><strong>${esc(e.degree) || ''} ${e.field ? 'in ' + esc(e.field) : ''}</strong> ${e.startYear || e.endYear ? '| ' + esc(e.startYear || '') + (e.startYear && e.endYear ? ' – ' : '') + esc(e.endYear || '') + ' ' : ''}— ${esc(e.institution) || ''}</div>`; });
  }
  if (data.careerStrengths.length) {
    h += '<h2>Career Strengths</h2>';
    data.careerStrengths.forEach((cs) => {
      const sepIdx = cs.indexOf(': ');
      if (sepIdx > 0) {
        h += `<div class="list-item"><strong>${esc(cs.substring(0, sepIdx))}</strong>: ${esc(cs.substring(sepIdx + 2))}</div>`;
      } else {
        h += `<div class="list-item">${esc(cs)}</div>`;
      }
    });
  }
  if (data.skills.length) h += `<h2>Skills</h2><div class="skills">${data.skills.map((s) => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>`;
  if (data.certifications.length) { h += '<h2>Certifications</h2>'; data.certifications.forEach((c) => { if (c.name) h += `<div class="list-item"><strong>${esc(c.name)}</strong> — ${esc(c.issuer) || ''} ${c.year ? '(' + esc(c.year) + ')' : ''}</div>`; }); }
  if (data.languages.length) { h += '<h2>Languages</h2>'; data.languages.forEach((l) => { if (l.name) h += `<div class="list-item">${esc(l.name)}${l.proficiency ? ' — ' + esc(l.proficiency) : ''}</div>`; }); }
  if (data.referees.length) {
    h += '<h2>Referees</h2>';
    data.referees.forEach((r) => {
      if (r.name) {
        h += `<div class="list-item"><strong>${esc(r.name)}</strong>${r.title ? ' — ' + esc(r.title) : ''}${r.organization ? '<br>' + esc(r.organization) : ''}${r.email ? '<br>' + esc(r.email) : ''}${r.phone ? '<br>' + esc(r.phone) : ''}</div>`;
      }
    });
  }
  if (data.interests.length) h += `<h2>Interests</h2><div class="skills">${data.interests.map((i) => `<span class="skill-tag">${esc(i)}</span>`).join('')}</div>`;
  return h;
}

/* ─── Preview HTML base styles ──────────────────────────── */
const PREVIEW_BASE_STYLES = `
  .cv-preview{font-family:'Segoe UI',Tahoma,sans-serif;color:#1a1a1a;line-height:1.5}
  .cv-preview h1{font-size:22px;margin-bottom:2px}
  .cv-preview h2{font-size:15px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #0d9488;padding-bottom:4px;margin-top:18px;color:#0d9488}
  .cv-preview .contact{font-size:12px;color:#666;margin-bottom:14px}
  .cv-preview .contact span{margin-right:14px}
  .cv-preview .exp-item{margin-bottom:10px}
  .cv-preview .exp-header{font-size:13px;font-weight:600}
  .cv-preview .exp-sub{font-size:11px;color:#666}
  .cv-preview .exp-desc{font-size:12px;margin-top:4px;white-space:pre-line}
  .cv-preview .skills{display:flex;flex-wrap:wrap;gap:5px}
  .cv-preview .skill-tag{background:#f0fdfa;color:#0d9488;padding:2px 9px;border-radius:12px;font-size:11px;border:1px solid #ccfbf1}
  .cv-preview .list-item{font-size:12px;margin:2px 0}
`;

/* ─── Paywall Overlay Component ─────────────────────────── */
function PaywallOverlay({ onPaid }: { onPaid: () => void }) {
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cv_builder_paid') === 'true') {
      onPaid();
    }
  }, [onPaid]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const checkPaymentStatus = useCallback(async (checkoutId: string) => {
    try {
      const res = await fetch(`/api/mpesa/status?checkoutRequestId=${encodeURIComponent(checkoutId)}`);
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        if (pollRef.current) clearInterval(pollRef.current);
        localStorage.setItem('cv_builder_paid', 'true');
        toast.success('Payment successful! Welcome to the CV Builder.');
        onPaid();
      } else if (data.status === 'FAILED') {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        setError(data.resultDesc || 'Payment failed. Please try again.');
      }
    } catch {
      // Silently retry on next poll
    }
  }, [onPaid]);

  const startPolling = useCallback((checkoutId: string) => {
    setPolling(true);
    setCheckoutRequestId(checkoutId);
    checkPaymentStatus(checkoutId);
    pollRef.current = setInterval(() => {
      checkPaymentStatus(checkoutId);
    }, 3000);
  }, [checkPaymentStatus]);

  const handlePay = async () => {
    const cleaned = phone.replace(/[\s\-]/g, '');
    if (!cleaned || cleaned.length < 10) {
      setError('Enter a valid phone number (e.g. 0712345678)');
      return;
    }

    setError('');
    setPaying(true);

    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned, amount: 299, purpose: 'cv_builder_access' }),
      });
      const data = await res.json();

      if (data.success && data.checkoutRequestId) {
        toast.success('STK Push sent! Check your phone and enter your PIN.');
        startPolling(data.checkoutRequestId);
      } else {
        setError(data.error || 'Failed to initiate payment. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleCheckStatus = () => {
    if (checkoutRequestId) {
      checkPaymentStatus(checkoutRequestId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-3">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Build Your Professional CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Get access to our AI-powered CV builder with ATS optimization, professional templates, and expert suggestions.
          </p>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <span className="text-3xl font-bold text-teal-700">KES 299</span>
            <p className="text-xs text-teal-600 mt-1">One-time payment</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpesa-phone" className="text-sm font-medium">
              M-Pesa Phone Number
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="mpesa-phone"
                type="tel"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                className="pl-10"
                disabled={paying || polling}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {polling && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Waiting for M-Pesa confirmation... Check your phone.</span>
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={paying || polling || !phone.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-5 text-base"
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Initiating...
              </>
            ) : polling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              'Pay with M-Pesa'
            )}
          </Button>

          {polling && checkoutRequestId && (
            <Button
              variant="outline"
              onClick={handleCheckStatus}
              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Payment Status
            </Button>
          )}

          <p className="text-[11px] text-gray-400 text-center mt-2">
            Secure payment via Safaricom M-Pesa. Your CV data remains private.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Landing Page View ─────────────────────────────────── */
function LandingPage({ onBuildMyCV }: { onBuildMyCV: () => void }) {
  const [landingTemplate, setLandingTemplate] = useState<Template>('modern');

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-6 px-4 py-1.5 text-sm font-medium">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered CV Builder for Kenyan Professionals
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Build a Professional CV That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600">
                Gets You Hired
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Create ATS-optimized CVs in minutes with our AI-powered builder. Choose from professional templates, get intelligent suggestions, and download a print-ready PDF.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onBuildMyCV}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-6 text-base shadow-lg shadow-teal-600/25 transition-all hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5"
              >
                Build My CV
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <span className="text-sm text-gray-500">
                KES 299 one-time payment
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Stand Out</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our CV builder combines professional design with AI intelligence to help you create a CV that passes ATS filters and impresses recruiters.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Layout, title: 'ATS-Optimized Templates', desc: '3 professionally designed templates crafted to pass Applicant Tracking Systems used by Kenyan employers.', color: 'text-teal-600', bg: 'bg-teal-50' },
              { icon: Bot, title: 'AI-Powered Suggestions', desc: 'AI improves your professional summary, suggests relevant skills, and refines your bullet points for impact.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: FileUp, title: 'Import from Existing CV', desc: 'Already have a CV? Upload your PDF or DOCX and our system auto-fills all the fields for you.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Monitor, title: 'Real-Time Preview', desc: 'See exactly how your CV will look as you type. No surprises — what you see is what you get.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: FileDown, title: 'Download as PDF', desc: 'Export a clean, print-ready PDF anytime. Perfect for email applications or printing.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: ShieldCheck, title: 'ATS Score Checker', desc: 'Check your CV\'s ATS compatibility score before applying to ensure maximum visibility to recruiters.', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Preview Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See Your Future CV</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Preview exactly how your CV will look with each template. This is a live demo — your CV will look just like this.
            </p>
          </div>

          {/* Template Switcher */}
          <div className="flex justify-center gap-3 mb-8">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => setLandingTemplate(t.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  landingTemplate === t.key
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Preview Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-teal-600 to-purple-600 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-white/30" />
                      <div className="w-3 h-3 rounded-full bg-white/30" />
                      <div className="w-3 h-3 rounded-full bg-white/30" />
                    </div>
                  </div>
                  <span className="text-white/80 text-xs font-medium">{TEMPLATES.find(t => t.key === landingTemplate)?.label} Template Preview</span>
                  <span className="text-white/60 text-xs">Jane Wanjiku — CPA-K</span>
                </div>
                <div className="p-6 md:p-10 max-h-[700px] overflow-y-auto">
                  <div className="cv-preview" dangerouslySetInnerHTML={{
                    __html: buildPreviewHTMLFromData(landingTemplate, DEMO)
                  }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={onBuildMyCV}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-6 text-base shadow-lg shadow-teal-600/25"
            >
              Start Building Your CV
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, One-Time Pricing</h2>
            <p className="text-gray-600 text-lg">No subscriptions. Pay once and build unlimited CVs.</p>
          </div>

          <Card className="max-w-lg mx-auto shadow-xl border-2 border-teal-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-purple-600 px-8 py-6 text-center">
              <h3 className="text-xl font-bold text-white mb-1">CV Builder — Full Access</h3>
              <p className="text-teal-100 text-sm">One-time payment, lifetime access</p>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">KES 299</span>
                <p className="text-gray-500 text-sm mt-1">Pay with M-Pesa</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '3 professional ATS-optimized templates',
                  'AI-powered summary & skill suggestions',
                  'Import from PDF or DOCX',
                  'Real-time live preview',
                  'Download as PDF anytime',
                  'ATS compatibility score checker',
                  'Save & edit your CV later',
                  'No recurring charges',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onBuildMyCV}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-5 text-base shadow-lg shadow-teal-600/25"
              >
                Get Started — KES 299
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure payment via Safaricom M-Pesa
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-purple-600 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of Kenyan professionals who have used our CV builder to create winning CVs.
          </p>
          <Button
            onClick={onBuildMyCV}
            size="lg"
            className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8 py-6 text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Build My CV Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ─── Builder View Component ────────────────────────────── */
function BuilderView() {
  const { data: session } = useSession();
  const user = session?.user;

  // Paywall state
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Check localStorage for existing access on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cv_builder_paid') === 'true') {
      setHasAccess(true);
    }
    setAccessChecked(true);
  }, []);

  const isPreview = !hasAccess;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [summary, setSummary] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [referees, setReferees] = useState<Referee[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [careerStrengths, setCareerStrengths] = useState<string[]>([]);
  const [careerStrengthInput, setCareerStrengthInput] = useState('');
  const [suggestingSummary, setSuggestingSummary] = useState(false);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [template, setTemplate] = useState<Template>('modern');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load demo data in preview mode after access check
  useEffect(() => {
    if (!accessChecked) return;
    if (!hasAccess) {
      setName(DEMO.name); setEmail(DEMO.email); setPhone(DEMO.phone);
      setLocation(DEMO.location); setLinkedin(DEMO.linkedin); setPortfolio(DEMO.portfolio);
      setSummary(DEMO.summary); setProfessionalTitle(DEMO.professionalTitle);
      setExperience(DEMO.experience); setEducation(DEMO.education);
      setSkills(DEMO.skills); setCertifications(DEMO.certifications);
      setLanguages(DEMO.languages); setReferees(DEMO.referees);
      setCareerStrengths(DEMO.careerStrengths); setInterests(DEMO.interests);
    }
  }, [accessChecked, hasAccess]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true, summary: true, experience: true, education: true,
    skills: true, careerStrengths: true, certifications: true, languages: true, referees: true, interests: true,
  });

  // Import CV from file — uses local extraction (no AI required)
  const handleImportCV = useCallback(async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      toast.error('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum 5 MB.');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const parseRes = await fetch('/api/cv-parse', { method: 'POST', body: formData });
      const parseData = await parseRes.json();
      if (!parseData.success) {
        toast.error(parseData.error || 'Failed to parse file.');
        setImporting(false);
        return;
      }

      const d = extractCVFields(parseData.text);

      if (d.name) setName(d.name);
      if (d.professionalTitle) setProfessionalTitle(d.professionalTitle);
      if (d.email) setEmail(d.email);
      if (d.phone) setPhone(d.phone);
      if (d.location) setLocation(d.location);
      if (d.linkedin) setLinkedin(d.linkedin);
      if (d.portfolio) setPortfolio(d.portfolio);
      if (d.summary) setSummary(d.summary);

      if (d.experience.length > 0) {
        setExperience(d.experience.map((e) => ({
          id: uid(), company: e.company || '', role: e.role || '',
          startDate: e.startDate || '', endDate: e.endDate || '',
          current: e.current || false, description: e.description || '',
        })));
      }
      if (d.education.length > 0) {
        setEducation(d.education.map((e) => ({
          id: uid(), institution: e.institution || '',
          degree: e.degree || '', field: e.field || '',
          startYear: e.startYear || '', endYear: e.endYear || '',
        })));
      }
      if (d.skills.length > 0) {
        setSkills((prev) => {
          const merged = [...prev, ...d.skills.filter((s) => !prev.includes(s))];
          return [...new Set(merged)];
        });
      }
      if (d.certifications.length > 0) {
        setCertifications(d.certifications.map((c) => ({
          id: uid(), name: c.name || '', issuer: c.issuer || '', year: c.year || '',
        })));
      }
      if (d.languages.length > 0) {
        setLanguages(d.languages.map((l) => ({
          id: uid(), name: l.name || '', proficiency: l.proficiency || '',
        })));
      }
      if (d.referees.length > 0) {
        setReferees(d.referees.map((r) => ({
          id: uid(), name: r.name || '', title: r.title || '',
          organization: r.organization || '', phone: r.phone || '', email: r.email || '',
        })));
      }

      if (d.careerStrengths && d.careerStrengths.length > 0) {
        setCareerStrengths((prev) => {
          const merged = [...prev, ...d.careerStrengths.filter((s) => !prev.includes(s))];
          return [...new Set(merged)];
        });
      }
      const filled = [d.name, d.email, d.phone, d.location, d.summary, ...d.skills, ...d.careerStrengths, ...d.experience.map(e => e.role || e.company), ...d.education.map(e => e.institution || e.degree)].filter(Boolean).length;
      toast.success(`CV imported from "${decodeURIComponent(file.name)}" — ${filled} fields detected. Review and use AI buttons to refine.`);
    } catch {
      toast.error('Import failed. Please try again or paste your CV manually.');
    } finally {
      setImporting(false);
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Load saved data
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch('/api/career-documents?type=CV');
        const data = await res.json();
        if (data.success && data.documents && data.documents.length > 0) {
          const doc = data.documents[0];
          try {
            const content = JSON.parse(doc.content);
            if (content.name) setName(content.name);
            if (content.email) setEmail(content.email);
            if (content.phone) setPhone(content.phone);
            if (content.location) setLocation(content.location);
            if (content.linkedin) setLinkedin(content.linkedin);
            if (content.portfolio) setPortfolio(content.portfolio);
            if (content.summary) setSummary(content.summary);
            if (Array.isArray(content.experience)) setExperience(content.experience);
            if (Array.isArray(content.education)) setEducation(content.education);
            if (Array.isArray(content.skills)) setSkills(content.skills);
            if (Array.isArray(content.certifications)) setCertifications(content.certifications);
            if (Array.isArray(content.languages)) setLanguages(content.languages);
            if (content.professionalTitle) setProfessionalTitle(content.professionalTitle);
            if (Array.isArray(content.referees)) setReferees(content.referees);
            if (Array.isArray(content.interests)) setInterests(content.interests);
            if (Array.isArray(content.careerStrengths)) setCareerStrengths(content.careerStrengths);
            if (content.template) setTemplate(content.template);
          } catch { /* not parseable */ }
        }
      } catch { /* ignore */ }
    }
    loadSaved();
  }, []);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.success && data.profile) {
          if (!name && data.profile.title) setName(data.profile.title);
          if (!summary && data.profile.summary) setSummary(data.profile.summary);
          if (skills.length === 0 && data.profile.skills) {
            try { const parsed = JSON.parse(data.profile.skills); if (Array.isArray(parsed)) setSkills(parsed); } catch {}
          }
          if (data.profile.location && !location) setLocation(data.profile.location);
          if (experience.length === 0 && data.profile.experience) {
            try {
              const parsed = JSON.parse(typeof data.profile.experience === 'string' ? data.profile.experience : JSON.stringify(data.profile.experience));
              if (Array.isArray(parsed)) {
                setExperience(parsed.map((e: any) => ({
                  id: uid(), company: e.company || '', role: e.role || e.position || '',
                  startDate: e.startDate || e.duration?.split('-')[0]?.trim() || '',
                  endDate: e.endDate || e.duration?.split('-')[1]?.trim() || '',
                  current: false, description: e.description || '',
                })));
              }
            } catch {}
          }
        }
      } catch {}
    }
    loadProfile();
  }, []);

  const addExperience = () => {
    setExperience([...experience, { id: uid(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' }]);
  };
  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const removeExperience = (id: string) => { setExperience(experience.filter((e) => e.id !== id)); };

  const addEducation = () => {
    setEducation([...education, { id: uid(), institution: '', degree: '', field: '', startYear: '', endYear: '' }]);
  };
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const removeEducation = (id: string) => { setEducation(education.filter((e) => e.id !== id)); };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
  };
  const removeSkill = (s: string) => { setSkills(skills.filter((sk) => sk !== s)); };

  const suggestSkills = async () => {
    if (requireAccess()) return;
    if (!roleInput.trim()) { toast.error('Please enter your job role title.'); return; }
    setSuggestingSkills(true);
    try {
      const res = await fetch('/api/ai/suggest-skills', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleInput.trim() }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.skills)) {
        const newSkills = data.skills.filter((s: string) => !skills.includes(s));
        setSkills([...skills, ...newSkills]);
        toast.success(`Added ${newSkills.length} suggested skills.`);
      } else { toast.error('Could not suggest skills.'); }
    } catch { toast.error('Network error.'); }
    setSuggestingSkills(false);
  };

  const addCertification = () => { setCertifications([...certifications, { id: uid(), name: '', issuer: '', year: '' }]); };
  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };
  const removeCertification = (id: string) => { setCertifications(certifications.filter((c) => c.id !== id)); };

  const addLanguage = () => { setLanguages([...languages, { id: uid(), name: '', proficiency: 'Intermediate' }]); };
  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setLanguages(languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };
  const removeLanguage = (id: string) => { setLanguages(languages.filter((l) => l.id !== id)); };

  const addReferee = () => {
    setReferees([...referees, { id: uid(), name: '', title: '', organization: '', phone: '', email: '' }]);
  };
  const updateReferee = (id: string, field: keyof Referee, value: string) => {
    setReferees(referees.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const removeReferee = (id: string) => { setReferees(referees.filter((r) => r.id !== id)); };

  const addInterest = () => {
    const i = interestInput.trim();
    if (i && !interests.includes(i)) { setInterests([...interests, i]); setInterestInput(''); }
  };
  const removeInterest = (i: string) => { setInterests(interests.filter((int) => int !== i)); };

  const addCareerStrength = () => {
    const cs = careerStrengthInput.trim();
    if (cs && !careerStrengths.includes(cs)) { setCareerStrengths([...careerStrengths, cs]); setCareerStrengthInput(''); }
  };
  const removeCareerStrength = (cs: string) => { setCareerStrengths(careerStrengths.filter((s) => s !== cs)); };

  const suggestSummary = async () => {
    if (requireAccess()) return;
    const ctx: string[] = [];
    if (experience.length > 0) ctx.push(experience.slice(0, 2).map((e) => `${e.role} at ${e.company}`).join(', '));
    if (skills.length > 0) ctx.push(`Skills: ${skills.slice(0, 5).join(', ')}`);
    setSuggestingSummary(true);
    try {
      const res = await fetch('/api/ai/cv-suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'Professional Summary', text: summary || 'No summary provided.', context: ctx.join('. ') }),
      });
      const data = await res.json();
      if (data.success && data.improvedText) { setSummary(data.improvedText); toast.success('Summary improved by AI.'); }
      else { toast.error('Could not improve summary.'); }
    } catch { toast.error('Network error.'); }
    setSuggestingSummary(false);
  };

  const improveBullet = async (expId: string, description: string) => {
    try {
      const res = await fetch('/api/ai/cv-suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'Work Experience Description', text: description }),
      });
      const data = await res.json();
      if (data.success && data.improvedText) { updateExperience(expId, 'description', data.improvedText); toast.success('Description improved.'); }
    } catch { toast.error('Could not improve description.'); }
  };

  const saveCV = async () => {
    if (!session?.user?.id) { toast.error('You must be logged in.'); return; }
    setSaving(true);
    try {
      const content = JSON.stringify({ name, professionalTitle, email, phone, location, linkedin, portfolio, summary, experience, education, skills, careerStrengths, certifications, languages, referees, interests, template });
      const existingRes = await fetch('/api/career-documents?type=CV');
      const existingData = await existingRes.json();
      if (existingData.success && existingData.documents && existingData.documents.length > 0) {
        await fetch(`/api/career-documents/${existingData.documents[0].id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, title: `${name || 'My'} - CV` }),
        });
      } else {
        await fetch('/api/career-documents', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'CV', title: `${name || 'My'} - CV`, content }),
        });
      }
      toast.success('CV saved successfully!');
    } catch { toast.error('Failed to save CV.'); }
    setSaving(false);
  };

  const downloadPDF = () => {
    const pw = window.open('', '_blank');
    if (!pw) return;
    pw.document.title = name || 'CV';
    pw.document.write(`<!DOCTYPE html><html><head><title>${name || 'CV'}</title>
      <style>
        body{font-family:'Segoe UI',Tahoma,sans-serif;margin:40px;color:#1a1a1a;line-height:1.5}
        h1{font-size:24px;margin-bottom:2px}
        h2{font-size:16px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #0d9488;padding-bottom:4px;margin-top:20px;color:#0d9488}
        .contact{font-size:13px;color:#666;margin-bottom:16px}.contact span{margin-right:16px}
        .exp-item{margin-bottom:12px}.exp-header{font-size:14px;font-weight:600}.exp-sub{font-size:12px;color:#666}.exp-desc{font-size:13px;margin-top:4px;white-space:pre-line}
        .skills{display:flex;flex-wrap:wrap;gap:6px}.skill-tag{background:#f0fdfa;color:#0d9488;padding:2px 10px;border-radius:12px;font-size:12px;border:1px solid #ccfbf1}
        .list-item{font-size:13px;margin:2px 0}
        .referee-item{margin-bottom:10px;font-size:12px}.referee-name{font-weight:600;font-size:13px}.referee-detail{color:#555}
        @page{margin:15mm 20mm;size:A4}
        @media print{
          body{margin:0}
          @page{margin:15mm 20mm;size:A4}
          @page { header: none; footer: none; }
        }
      </style></head><body>${buildPreviewHTMLFromData(template, { name, professionalTitle, email, phone, location, linkedin, portfolio, summary, experience, education, skills, careerStrengths, certifications, languages, referees, interests })}<script>window.onload=()=>window.print()</script></body></html>`);
    pw.document.close();
  };

  const runATSCheck = async () => {
    const cvText = [name, email, phone, location, summary, ...experience.map((e) => `${e.role} at ${e.company}\n${e.description}`), ...education.map((e) => `${e.degree} in ${e.field} from ${e.institution}`), skills.join(', ')].filter(Boolean).join('\n');
    if (cvText.length < 50) { toast.error('Add more content before checking.'); return; }
    try {
      toast.loading('Submitting to ATS Checker...');
      const res = await fetch('/api/cv-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });
      const data = await res.json();
      toast.dismiss();
      if (data.success && data.scanId) {
        window.location.href = `/cv-checker/result?id=${data.scanId}`;
      } else {
        toast.error(data.error || 'ATS check failed. Please try from the CV Checker page.');
      }
    } catch {
      toast.dismiss();
      toast.error('Network error. Please try again.');
    }
  };

  const isOpen = (key: string) => openSections[key] !== false;

  const requireAccess = () => {
    if (!hasAccess) { setShowPaywall(true); return true; }
    return false;
  };

  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1280px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Preview Mode Banner */}
        {isPreview && (
          <div className="bg-gradient-to-r from-teal-600 to-purple-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">You&apos;re previewing the CV Builder</p>
                <p className="text-xs text-teal-100">Explore templates, fill in details, and see your live preview. Unlock to save, download & use AI features.</p>
              </div>
            </div>
            <Button onClick={() => setShowPaywall(true)} className="bg-white text-teal-700 hover:bg-teal-50 font-semibold text-sm px-6 flex-shrink-0">
              <Lock className="w-4 h-4 mr-1.5" /> Unlock — KES 299
            </Button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
            <p className="text-gray-500 text-sm mt-1">Build your ATS-friendly CV with AI assistance</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportCV(f); if (fileInputRef.current) fileInputRef.current.value = ''; }} />
            <Button variant="outline" size="sm" onClick={() => { if (requireAccess()) return; fileInputRef.current?.click(); }} disabled={importing} className="text-sm border-teal-200 text-teal-700 hover:bg-teal-50">
              {importing ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Upload className="w-4 h-4 mr-1.5" />}
              {importing ? 'Importing...' : 'Import CV'}
            </Button>
            <span className="text-xs text-gray-400 self-center">Upload PDF or DOCX</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel */}
          <div className="flex-1 lg:max-w-[60%] space-y-1">
            {/* Template Selector */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-600">Template:</span>
              <div className="flex gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.key} onClick={() => setTemplate(t.key)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${template === t.key ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('personal')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-teal-600" /><span className="text-sm font-semibold text-gray-800">Personal Information</span></div>
                {isOpen('personal') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen('personal') && <div className="p-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label className="text-xs">Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="text-sm" placeholder="John Kamau" /></div>
                  <div><Label className="text-xs">Professional Title</Label><Input value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} className="text-sm" placeholder="Certified Public Accountant" /></div>
                  <div><Label className="text-xs">Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm" placeholder="john@email.com" /></div>
                  <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm" placeholder="+254 700 000 000" /></div>
                  <div><Label className="text-xs">Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} className="text-sm" placeholder="Nairobi, Kenya" /></div>
                  <div><Label className="text-xs">LinkedIn URL</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="text-sm" placeholder="https://linkedin.com/in/..." /></div>
                  <div className="sm:col-span-2"><Label className="text-xs">Portfolio URL</Label><Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="text-sm" placeholder="https://..." /></div>
                </div>
              </div>}
            </div>

            {/* Summary */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('summary')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600" /><span className="text-sm font-semibold text-gray-800">Professional Summary</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { if (requireAccess()) return; suggestSummary(); }} disabled={suggestingSummary} className="text-xs text-teal-600 hover:text-teal-700">{suggestingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Suggest</Button>
                  {isOpen('summary') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isOpen('summary') && <div className="p-4">
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Write a 2-3 line professional summary highlighting your key achievements..." className="min-h-[100px] text-sm" />
              </div>}
            </div>

            {/* Experience */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('experience')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-teal-600" /><span className="text-sm font-semibold text-gray-800">Work Experience</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addExperience} className="text-xs text-teal-600"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  {isOpen('experience') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isOpen('experience') && <div className="p-4 space-y-3">
                {experience.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No experience added yet. Click &quot;Add&quot; to get started.</p>}
                {experience.map((exp) => (
                  <div key={exp.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-gray-700">{exp.role || 'New Experience'}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { if (requireAccess()) return; improveBullet(exp.id, exp.description); }} className="text-xs text-purple-600 h-6"><Wand2 className="w-3 h-3 mr-1" /> AI</Button>
                        <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 mb-2">
                      <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company" className="text-xs" />
                      <Input value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} placeholder="Job Title" className="text-xs" />
                      <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Start (e.g. Jan 2022)" className="text-xs" />
                      <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="End or Present" className="text-xs" disabled={exp.current} />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-500 mb-2"><input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded" /> Currently here</label>
                    <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Responsibilities & achievements (• Led team of 5...)" className="min-h-[80px] text-xs" />
                  </div>
                ))}
              </div>}
            </div>

            {/* Education */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('education')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-teal-600" /><span className="text-sm font-semibold text-gray-800">Education</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addEducation} className="text-xs text-teal-600"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  {isOpen('education') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isOpen('education') && <div className="p-4 space-y-3">
                {education.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No education added yet.</p>}
                {education.map((edu) => (
                  <div key={edu.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex justify-end mb-2"><button onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="Institution" className="text-xs" />
                      <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Degree (e.g. BSc)" className="text-xs" />
                      <Input value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} placeholder="Field of Study" className="text-xs" />
                      <div className="flex gap-2">
                        <Input value={edu.startYear} onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)} placeholder="Start" className="text-xs" />
                        <Input value={edu.endYear} onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)} placeholder="End" className="text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>}
            </div>

            {/* Career Strengths */}
            {careerStrengths.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('careerStrengths')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /><span className="text-sm font-semibold text-gray-800">Career Strengths</span></div>
                {isOpen('careerStrengths') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen('careerStrengths') && <div className="p-4">
                <div className="space-y-2 mb-3">
                  {careerStrengths.map((cs) => {
                    const sepIdx = cs.indexOf(': ');
                    const hasCategory = sepIdx > 0;
                    return (
                      <div key={cs} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                        <div className="flex-1 min-w-0">
                          {hasCategory ? (
                            <>
                              <span className="text-xs font-semibold text-amber-800">{cs.substring(0, sepIdx)}</span>
                              <span className="text-xs text-gray-600 ml-1">{cs.substring(sepIdx + 2)}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-700">{cs}</span>
                          )}
                        </div>
                        <button onClick={() => removeCareerStrength(cs)} className="text-red-400 hover:text-red-600 p-0.5 flex-shrink-0"><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input value={careerStrengthInput} onChange={(e) => setCareerStrengthInput(e.target.value)} placeholder='Add strength (e.g. "Leadership: Great at...")' className="text-xs flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCareerStrength(); } }} />
                  <Button variant="outline" size="sm" onClick={addCareerStrength} className="text-xs"><Plus className="w-3 h-3" /></Button>
                </div>
              </div>}
            </div>
            )}

            {/* Skills */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('skills')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-600" /><span className="text-sm font-semibold text-gray-800">Skills</span></div>
                {isOpen('skills') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen('skills') && <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-3">{skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs gap-1 pr-1">{s}<button onClick={() => removeSkill(s)} className="hover:text-red-500"><X className="w-3 h-3" /></button></Badge>
                ))}</div>
                <div className="flex gap-2 mb-2">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Type skill + Enter" className="text-xs flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                  <Button variant="outline" size="sm" onClick={addSkill} className="text-xs"><Plus className="w-3 h-3" /></Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input value={roleInput} onChange={(e) => setRoleInput(e.target.value)} placeholder="Job role for AI suggestions" className="text-xs flex-1" />
                  <Button variant="outline" size="sm" onClick={suggestSkills} disabled={suggestingSkills} className="text-xs text-purple-600 border-purple-200">{suggestingSkills ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} AI Suggest</Button>
                </div>
              </div>}
            </div>

            {/* Certifications */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('certifications')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /><span className="text-sm font-semibold text-gray-800">Certifications</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addCertification} className="text-xs text-teal-600"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  {isOpen('certifications') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isOpen('certifications') && <div className="p-4 space-y-2">
                {certifications.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No certifications added.</p>}
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex gap-2 items-end">
                    <Input value={cert.name} onChange={(e) => updateCertification(cert.id, 'name', e.target.value)} placeholder="Name" className="text-xs flex-1" />
                    <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)} placeholder="Issuer" className="text-xs" />
                    <Input value={cert.year} onChange={(e) => updateCertification(cert.id, 'year', e.target.value)} placeholder="Year" className="text-xs w-20" />
                    <button onClick={() => removeCertification(cert.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>}
            </div>

            {/* Languages */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('languages')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-teal-600" /><span className="text-sm font-semibold text-gray-800">Languages</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addLanguage} className="text-xs text-teal-600"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  {isOpen('languages') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isOpen('languages') && <div className="p-4 space-y-2">
                {languages.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No languages added.</p>}
                {languages.map((lang) => (
                  <div key={lang.id} className="flex gap-2 items-end">
                    <Input value={lang.name} onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)} placeholder="Language" className="text-xs flex-1" />
                    <Select value={lang.proficiency} onValueChange={(v) => updateLanguage(lang.id, 'proficiency', v)}>
                      <SelectTrigger className="text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Fluent">Fluent</SelectItem>
                        <SelectItem value="Native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                    <button onClick={() => removeLanguage(lang.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>}
            </div>

            {/* Referees */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('referees')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-teal-600" /><span className="text-sm font-semibold text-gray-800">Referees</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addReferee} className="text-xs text-teal-600"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  {isOpen('referees') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isOpen('referees') && <div className="p-4 space-y-3">
                {referees.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No referees added yet.</p>}
                {referees.map((ref) => (
                  <div key={ref.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex justify-end mb-2"><button onClick={() => removeReferee(ref.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input value={ref.name} onChange={(e) => updateReferee(ref.id, 'name', e.target.value)} placeholder="Full Name" className="text-xs" />
                      <Input value={ref.title} onChange={(e) => updateReferee(ref.id, 'title', e.target.value)} placeholder="Title / Position" className="text-xs" />
                      <Input value={ref.organization} onChange={(e) => updateReferee(ref.id, 'organization', e.target.value)} placeholder="Organization" className="text-xs" />
                      <Input value={ref.phone} onChange={(e) => updateReferee(ref.id, 'phone', e.target.value)} placeholder="Phone" className="text-xs" />
                      <div className="sm:col-span-2"><Input value={ref.email} onChange={(e) => updateReferee(ref.id, 'email', e.target.value)} placeholder="Email" className="text-xs" /></div>
                    </div>
                  </div>
                ))}
              </div>}
            </div>

            {/* Interests */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <button onClick={() => toggleSection('interests')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-600" /><span className="text-sm font-semibold text-gray-800">Interests</span></div>
                {isOpen('interests') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen('interests') && <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-3">{interests.map((i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">{i}<button onClick={() => removeInterest(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button></Badge>
                ))}</div>
                <div className="flex gap-2">
                  <Input value={interestInput} onChange={(e) => setInterestInput(e.target.value)} placeholder="Type interest + Enter" className="text-xs flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }} />
                  <Button variant="outline" size="sm" onClick={addInterest} className="text-xs"><Plus className="w-3 h-3" /></Button>
                </div>
              </div>}
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 z-10 shadow-lg mt-4">
              <Button onClick={() => { if (requireAccess()) return; saveCV(); }} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white text-sm">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save</Button>
              <Button variant="outline" onClick={() => { if (requireAccess()) return; downloadPDF(); }} className="text-sm"><Download className="w-4 h-4 mr-1" /> Download PDF</Button>
              <Button variant="outline" onClick={() => { if (requireAccess()) return; runATSCheck(); }} className="text-sm text-purple-600 border-purple-200"><Scan className="w-4 h-4 mr-1" /> Run ATS Check</Button>
            </div>
          </div>

          {/* Right Panel: Live Preview */}
          <div className="lg:w-[40%]">
            <div className="lg:sticky lg:top-20">
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border border-gray-100 rounded-lg p-6 min-h-[600px] shadow-inner">
                    <style dangerouslySetInnerHTML={{ __html: PREVIEW_BASE_STYLES }} />
                    <div dangerouslySetInnerHTML={{ __html: buildPreviewHTMLFromData(template, { name, professionalTitle, email, phone, location, linkedin, portfolio, summary, experience, education, skills, careerStrengths, certifications, languages, referees, interests }) }} className="cv-preview" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Overlay */}
      {showPaywall && (
        <PaywallOverlay onPaid={() => { setHasAccess(true); setShowPaywall(false); }} />
      )}
    </>
  );
}

/* ─── Main Page Component (Two-View Router) ─────────────── */
export default function CVBuilderPage() {
  const { data: session, status } = useSession();
  const [showPaywall, setShowPaywall] = useState(false);
  const [userRequestedBuilder, setUserRequestedBuilder] = useState(false);

  // Determine if the user should see the builder directly (paid + authenticated)
  const isSessionReady = status !== 'loading';
  const isPaid = typeof window !== 'undefined' && localStorage.getItem('cv_builder_paid') === 'true';
  const showBuilder = userRequestedBuilder || (isSessionReady && !!session?.user && isPaid);

  const handleBuildMyCV = useCallback(() => {
    // 1. Not logged in → redirect to login
    if (!session?.user) {
      signIn(undefined, { callbackUrl: '/cv-builder' });
      return;
    }
    // 2. Logged in but not paid → show paywall
    if (!isPaid) {
      setShowPaywall(true);
      return;
    }
    // 3. Logged in AND paid → go to builder
    setUserRequestedBuilder(true);
  }, [session, isPaid]);

  // Show loading until session is resolved
  if (!isSessionReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Builder view (paid + authenticated)
  if (showBuilder) {
    return (
      <>
        <BuilderView />
        {showPaywall && (
          <PaywallOverlay onPaid={() => { setShowPaywall(false); }} />
        )}
      </>
    );
  }

  // Landing view (default for everyone)
  return (
    <>
      <LandingPage onBuildMyCV={handleBuildMyCV} />
      {showPaywall && (
        <PaywallOverlay onPaid={() => {
          setShowPaywall(false);
          setUserRequestedBuilder(true);
        }} />
      )}
    </>
  );
}
