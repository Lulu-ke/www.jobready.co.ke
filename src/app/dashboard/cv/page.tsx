'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileCheck,
  Trash2,
  CloudUpload,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useDashboardUser } from '../dashboard-shell';

interface CvInfo {
  cvUrl: string;
  cvFileName: string;
  updatedAt: string;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function CvManagementPage() {
  useDashboardUser();

  const [cv, setCv] = useState<CvInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCv = useCallback(async () => {
    try {
      const res = await fetch('/api/cv');
      const data = await res.json();
      if (data.success && data.data) {
        setCv(data.data);
      } else {
        setCv(null);
      }
    } catch (error) {
      console.error('Failed to fetch CV:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCv();
  }, [fetchCv]);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return 'Invalid file type. Only PDF, DOC, and DOCX are allowed.';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 5MB.';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        toast.success('CV uploaded successfully!');
        setTimeout(() => {
          fetchCv();
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } else {
        toast.error(data.error || 'Failed to upload CV');
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Failed to upload CV:', error);
      toast.error('Failed to upload CV');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/cv', { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('CV deleted successfully');
        setCv(null);
      } else {
        toast.error(data.error || 'Failed to delete CV');
      }
    } catch (error) {
      console.error('Failed to delete CV:', error);
      toast.error('Failed to delete CV');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Card className="rounded-2xl"><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My CV</h1>
        <p className="text-gray-500 mt-1">Upload and manage your curriculum vitae</p>
      </div>

      {/* Current CV */}
      {cv && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{cv.cvFileName}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded {format(new Date(cv.updatedAt), 'MMM d, yyyy')}
                </p>
                <a
                  href={cv.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 hover:text-teal-700 mt-1 inline-block"
                >
                  View CV →
                </a>
              </div>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {deleting ? 'Deleting...' : 'Delete CV'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{cv ? 'Replace CV' : 'Upload CV'}</CardTitle>
          <CardDescription>
            Accepted formats: PDF, DOC, DOCX. Maximum size: 5MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-teal-400 bg-teal-50'
                : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
            } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-3">
                <CloudUpload className="w-10 h-10 text-teal-500 mx-auto" />
                <p className="text-sm text-gray-600">Uploading...</p>
                <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                <p className="text-xs text-gray-400">{uploadProgress}%</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drag and drop your CV here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="rounded-2xl border-0 shadow-sm bg-amber-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Tips for a great CV</p>
              <ul className="mt-1 space-y-1 text-amber-700 text-xs">
                <li>• Keep your CV concise (1-2 pages maximum)</li>
                <li>• Include relevant keywords from job descriptions</li>
                <li>• Use a clean, professional format</li>
                <li>• Proofread carefully before uploading</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
