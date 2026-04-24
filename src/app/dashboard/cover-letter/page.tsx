'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Loader2,
  RefreshCw,
  Save,
  Download,
  Sparkles,
  FileText,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDashboardUser } from '@/app/dashboard/dashboard-shell';

interface SavedLetter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const user = useDashboardUser();
  const router = useRouter();

  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Load saved cover letters
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch('/api/career-documents?type=COVER_LETTER');
        const data = await res.json();
        if (data.success && Array.isArray(data.documents)) {
          setSavedLetters(data.documents);
        }
      } catch {
        // ignore
      }
      setLoadingSaved(false);
    }
    loadSaved();
  }, []);

  const generateCoverLetter = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in.');
      return;
    }
    if (jobDescription.trim().length < 20) {
      toast.error('Please provide a more detailed job description (at least 20 characters).');
      return;
    }

    setLoading(true);
    setCoverLetter('');

    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          jobDescription: jobDescription.trim(),
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.coverLetter) {
        setCoverLetter(data.coverLetter);
        toast.success('Cover letter generated!');
      } else {
        toast.error(data.error || 'Failed to generate cover letter.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }

    setLoading(false);
  };

  const saveCoverLetter = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in.');
      return;
    }
    if (coverLetter.trim().length < 20) {
      toast.error('Nothing to save. Generate a cover letter first.');
      return;
    }

    setSaving(true);
    try {
      const jobTitle = jobDescription
        .split('\n')[0]
        .trim()
        .slice(0, 60) || 'Untitled Position';

      await fetch('/api/career-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'COVER_LETTER',
          title: `Cover Letter - ${jobTitle}`,
          content: coverLetter.trim(),
        }),
      });

      toast.success('Cover letter saved!');
      // Reload saved letters
      const res = await fetch('/api/career-documents?type=COVER_LETTER');
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        setSavedLetters(data.documents);
      }
    } catch {
      toast.error('Failed to save cover letter.');
    }
    setSaving(false);
  };

  const deleteSavedLetter = async (id: string) => {
    try {
      await fetch(`/api/career-documents/${id}`, { method: 'DELETE' });
      setSavedLetters(savedLetters.filter((l) => l.id !== id));
      toast.success('Deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const loadSavedLetter = (letter: SavedLetter) => {
    setCoverLetter(letter.content);
    toast.info('Cover letter loaded for editing.');
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Cover Letter</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 60px 80px; color: #1a1a1a; line-height: 1.7; max-width: 700px; }
        h1 { font-size: 20px; color: #0d9488; margin-bottom: 4px; }
        .contact { font-size: 12px; color: #888; margin-bottom: 24px; }
        .letter { font-size: 14px; white-space: pre-line; }
        @media print { body { margin: 40px; } }
      </style></head><body>
      <h1>${user?.name || 'Your Name'}</h1>
      <div class="contact">${user?.email || ''} | Cover Letter</div>
      <div class="letter">${coverLetter.replace(/\n/g, '<br>')}</div>
      <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-teal-600" />
          Cover Letter Generator
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate a professional cover letter with AI
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Left Panel: Input ─── */}
        <div className="lg:max-w-[55%] space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here. The more detail you provide, the better your cover letter will be..."
                  className="min-h-[200px] text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="Confident">Confident</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={generateCoverLetter}
                disabled={loading || jobDescription.trim().length < 20}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Edit Panel */}
          {coverLetter && (
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Edit Cover Letter</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateCoverLetter}
                  disabled={loading}
                  className="text-xs text-purple-600"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="min-h-[300px] text-sm"
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={saveCoverLetter}
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-sm"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" onClick={downloadPDF} className="text-sm">
                    <Download className="w-4 h-4 mr-1" /> Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Cover Letters */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Saved Cover Letters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSaved ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              ) : savedLetters.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No saved cover letters yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedLetters.map((letter) => (
                    <div
                      key={letter.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => loadSavedLetter(letter)}
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {letter.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(letter.updatedAt).toLocaleDateString('en-KE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSavedLetter(letter.id)}
                        className="text-gray-300 hover:text-red-500 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Panel: Preview ─── */}
        <div className="lg:flex-1">
          <div className="lg:sticky lg:top-20">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-100 rounded-lg p-6 min-h-[500px] shadow-inner">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      <p className="text-sm text-gray-400">
                        Generating your cover letter...
                      </p>
                    </div>
                  ) : coverLetter ? (
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-bold text-teal-700 mb-1">
                        {user?.name || 'Your Name'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">{user?.email}</p>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {coverLetter}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Mail className="w-12 h-12 text-gray-200 mb-3" />
                      <p className="text-gray-400 text-sm">
                        Your generated cover letter will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
