'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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

const TEMPLATES: { key: Template; label: string }[] = [
  { key: 'modern', label: 'Modern' },
  { key: 'classic', label: 'Classic' },
  { key: 'minimal', label: 'Minimal' },
];

/* ─── Paywall Overlay Component ─────────────────────────── */
function PaywallOverlay({ onPaid }: { onPaid: () => void }) {
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cv_builder_paid') === 'true') {
      onPaid();
    }
  }, [onPaid]);

  // Cleanup polling on unmount
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
    // Check immediately
    checkPaymentStatus(checkoutId);
    // Then every 3 seconds
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

/* ─── Main Component ────────────────────────────────────── */
export default function CVBuilderPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Paywall state
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  // Check localStorage for existing access on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cv_builder_paid') === 'true') {
      setHasAccess(true);
    }
    setAccessChecked(true);
  }, []);

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
      // Step 1: Parse the file to text via server
      const formData = new FormData();
      formData.append('file', file);
      const parseRes = await fetch('/api/cv-parse', { method: 'POST', body: formData });
      const parseData = await parseRes.json();
      if (!parseData.success) {
        toast.error(parseData.error || 'Failed to parse file.');
        setImporting(false);
        return;
      }

      // Step 2: Extract fields locally using regex/rules (no AI needed)
      const d = extractCVFields(parseData.text);

      // Step 3: Populate form fields
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

      // Store career strengths separately (preserve category structure)
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
          /* Force hide browser headers/footers */
          @page { header: none; footer: none; }
        }
      </style></head><body>${buildPreviewHTML()}<script>window.onload=()=>window.print()</script></body></html>`);
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

  /** Escape HTML entities to prevent XSS in dangerouslySetInnerHTML */
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function buildPreviewHTML() {
    const ts: Record<Template, string> = {
      modern: 'h1{color:#0d9488}h2{border-bottom-color:#7c3aed;color:#7c3aed}.skill-tag{background:#f5f3ff;color:#7c3aed;border-color:#ede9fe}',
      classic: 'h1{color:#1a1a1a}h2{border-bottom-color:#374151;color:#374151}.skill-tag{background:#f3f4f6;color:#374151;border-color:#d1d5db}',
      minimal: 'h1{color:#6b7280;font-weight:300}h2{border-bottom-color:#d1d5db;color:#6b7280;font-weight:400;letter-spacing:2px}.skill-tag{background:#f9fafb;color:#6b7280;border-color:#e5e7eb}',
    };
    const cp: string[] = [];
    if (email) cp.push(`<span>${esc(email)}</span>`);
    if (phone) cp.push(`<span>${esc(phone)}</span>`);
    if (location) cp.push(`<span>${esc(location)}</span>`);
    let h = `<style>${ts[template]}</style>`;
    h += `<h1>${esc(name) || 'Your Name'}</h1>`;
    if (professionalTitle) h += `<p style="margin:0 0 8px;font-size:14px;color:#666;font-weight:500">${esc(professionalTitle)}</p>`;
    if (linkedin) cp.push(`<span>${esc(linkedin)}</span>`);
    if (portfolio) cp.push(`<span>${esc(portfolio)}</span>`);
    if (cp.length) h += `<div class="contact">${cp.join('')}</div>`;
    if (summary) h += `<p style="margin-bottom:16px">${esc(summary).replace(/\n/g, '<br>')}</p>`;
    if (experience.length) {
      h += '<h2>Work Experience</h2>';
      experience.forEach((e) => { if (e.role || e.company) {
        const descHtml = e.description
          ? (() => {
              // Normalize: split by \n first (new extractor format), then detect bullet chars
              const lines = e.description.split(/\n/).filter(l => l.trim());
              // Check if any line starts with a bullet character
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
    if (education.length) {
      h += '<h2>Education</h2>';
      education.forEach((e) => { if (e.institution || e.degree) h += `<div class="list-item"><strong>${esc(e.degree) || ''} ${e.field ? 'in ' + esc(e.field) : ''}</strong> ${e.startYear || e.endYear ? '| ' + esc(e.startYear || '') + (e.startYear && e.endYear ? ' – ' : '') + esc(e.endYear || '') + ' ' : ''}— ${esc(e.institution) || ''}</div>`; });
    }
    if (careerStrengths.length) {
      h += '<h2>Career Strengths</h2>';
      careerStrengths.forEach((cs) => {
        const sepIdx = cs.indexOf(': ');
        if (sepIdx > 0) {
          const cat = cs.substring(0, sepIdx);
          const desc = cs.substring(sepIdx + 2);
          h += `<div class="list-item"><strong>${esc(cat)}</strong>: ${esc(desc)}</div>`;
        } else {
          h += `<div class="list-item">${esc(cs)}</div>`;
        }
      });
    }
    if (skills.length) h += `<h2>Skills</h2><div class="skills">${skills.map((s) => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>`;
    if (certifications.length) { h += '<h2>Certifications</h2>'; certifications.forEach((c) => { if (c.name) h += `<div class="list-item"><strong>${esc(c.name)}</strong> — ${esc(c.issuer) || ''} ${c.year ? '(' + esc(c.year) + ')' : ''}</div>`; }); }
    if (languages.length) { h += '<h2>Languages</h2>'; languages.forEach((l) => { if (l.name) h += `<div class="list-item">${esc(l.name)}${l.proficiency ? ' — ' + esc(l.proficiency) : ''}</div>`; }); }
    if (referees.length) {
      h += '<h2>Referees</h2>';
      referees.forEach((r) => {
        if (r.name) {
          h += `<div class="list-item"><strong>${esc(r.name)}</strong>${r.title ? ' — ' + esc(r.title) : ''}${r.organization ? '<br>' + esc(r.organization) : ''}${r.email ? '<br>' + esc(r.email) : ''}${r.phone ? '<br>' + esc(r.phone) : ''}</div>`;
        }
      });
    }
    if (interests.length) h += `<h2>Interests</h2><div class="skills">${interests.map((i) => `<span class="skill-tag">${esc(i)}</span>`).join('')}</div>`;
    return h;
  }

  const isOpen = (key: string) => openSections[key] !== false;

  // Show nothing until we've checked localStorage
  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Show paywall if not paid
  if (!hasAccess) {
    return <PaywallOverlay onPaid={() => setHasAccess(true)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
          <p className="text-gray-500 text-sm mt-1">Build your ATS-friendly CV with AI assistance</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportCV(f); if (fileInputRef.current) fileInputRef.current.value = ''; }} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing} className="text-sm border-teal-200 text-teal-700 hover:bg-teal-50">
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
                <div><Label className="text-xs">Portfolio URL</Label><Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="text-sm" placeholder="https://..." /></div>
              </div>
            </div>}
          </div>

          {/* Summary */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
            <button onClick={() => toggleSection('summary')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600" /><span className="text-sm font-semibold text-gray-800">Professional Summary</span></div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={suggestSummary} disabled={suggestingSummary} className="text-xs text-teal-600 hover:text-teal-700">{suggestingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Suggest</Button>
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
                      <Button variant="ghost" size="sm" onClick={() => improveBullet(exp.id, exp.description)} className="text-xs text-purple-600 h-6"><Wand2 className="w-3 h-3 mr-1" /> AI</Button>
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
            <Button onClick={saveCV} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white text-sm">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save</Button>
            <Button variant="outline" onClick={downloadPDF} className="text-sm"><Download className="w-4 h-4 mr-1" /> Download PDF</Button>
            <Button variant="outline" onClick={runATSCheck} className="text-sm text-purple-600 border-purple-200"><Scan className="w-4 h-4 mr-1" /> Run ATS Check</Button>
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
                  <div dangerouslySetInnerHTML={{ __html: buildPreviewHTML() }} className="cv-preview" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
