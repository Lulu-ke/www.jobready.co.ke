'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, Bell, Calendar, Building2, ExternalLink, Share2, ChevronRight, Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import NewsletterSection from '@/components/newsletter-section';

interface UpdateDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  sourceUrl: string | null;
  sourceName: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateDetailClientProps {
  update: UpdateDetail;
}

function getUpdateTypeBadge(type: string): string {
  const badges: Record<string, string> = {
    SHORTLISTED: 'bg-red-100 text-red-700 border-red-200',
    INTERVIEW_SCHEDULE: 'bg-purple-100 text-purple-700 border-purple-200',
    CLOSING_EXTENDED: 'bg-amber-100 text-amber-700 border-amber-200',
    CORRIGENDUM: 'bg-orange-100 text-orange-700 border-orange-200',
    GENERAL: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return badges[type] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getUpdateTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SHORTLISTED: 'Shortlisted',
    INTERVIEW_SCHEDULE: 'Interview Schedule',
    CLOSING_EXTENDED: 'Closing Extended',
    CORRIGENDUM: 'Corrigendum',
    GENERAL: 'Update',
  };
  return labels[type] || type;
}

export default function UpdateDetailClient({ update }: UpdateDetailClientProps) {
  const router = useRouter();

  // Split content by \n\n for paragraphs
  const paragraphs = update.content.split('\n\n').filter((p) => p.trim());

  const shareWhatsApp = () => {
    const text = `${update.title} – Read more on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1 text-sm text-gray-500">
              <button onClick={() => router.push('/')} className="hover:text-gray-700 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push('/updates')} className="hover:text-gray-700">
                Job Updates
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-[300px]">
                {update.title}
              </span>
            </nav>
          </div>
        </div>

        <article className="py-8 lg:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back button */}
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 -ml-2 mb-6"
              onClick={() => router.push('/updates')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Updates
            </Button>

            {/* Update Header */}
            <header className="mb-8">
              {/* Type Badge */}
              <Badge
                variant="secondary"
                className={`text-[10px] mb-4 border ${getUpdateTypeBadge(update.type)}`}
              >
                <Bell className="w-3 h-3 mr-1" />
                {getUpdateTypeLabel(update.type)}
              </Badge>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {update.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {update.sourceName}
                </span>
                <span className="flex items-center gap-1.5" suppressHydrationWarning>
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {format(new Date(update.createdAt), 'MMMM d, yyyy')}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.ceil(update.content.length / 1000)} min read
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-gray-600"
                  onClick={shareWhatsApp}
                >
                  <Share2 className="w-4 h-4 mr-1.5 text-green-600" />
                  Share via WhatsApp
                </Button>
              </div>

              <Separator className="mt-6" />
            </header>

            {/* Content paragraphs */}
            <div className="prose-custom">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-5 text-[15px]">
                  {paragraph.trim()}
                </p>
              ))}
            </div>

            {/* Source Document Button */}
            {update.sourceUrl && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-base font-semibold rounded-xl sm:w-auto sm:px-8">
                    View Official Document
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            )}

            {/* Footer */}
            <Separator className="my-8" />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:text-teal-600"
                onClick={() => router.push('/updates')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Updates
              </Button>
              <span className="text-xs text-gray-400" suppressHydrationWarning>
                Published {format(new Date(update.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </article>

        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
