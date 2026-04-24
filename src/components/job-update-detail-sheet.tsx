'use client';

import { X, ExternalLink, Share2, Building2, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';

interface JobUpdate {
  id: string;
  title: string;
  slug: string;
  type: string;
  sourceName: string;
  sourceUrl?: string;
  content?: string;
  publishedAt: string;
}

interface JobUpdateDetailSheetProps {
  update: JobUpdate | null;
  open: boolean;
  onClose: () => void;
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

export default function JobUpdateDetailSheet({ update, open, onClose }: JobUpdateDetailSheetProps) {
  if (!update) return null;

  const paragraphs = update.content
    ? update.content.split('\n\n').filter((p) => p.trim())
    : [];

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(update.publishedAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  })();

  const formattedDate = (() => {
    try {
      return format(new Date(update.publishedAt), 'MMMM d, yyyy');
    } catch {
      return '';
    }
  })();

  const shareWhatsApp = () => {
    const text = `${update.title} – Read more on JobReady Kenya!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0 [&>button]:hidden bg-white">
        {/* Sticky header */}
        <SheetHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-base font-semibold text-gray-900 truncate flex-1 min-w-0">
              {update.title}
            </SheetTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getUpdateTypeBadge(update.type)}`}
            >
              {getUpdateTypeLabel(update.type)}
            </span>
            <span className="text-sm text-gray-500 truncate">
              {update.sourceName}
            </span>
          </div>
        </SheetHeader>

        <div className="px-5 py-5 space-y-6">
          {/* Source & Date Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-400" />
              {update.sourceName}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              {formattedDate} · {timeAgo}
            </span>
          </div>

          <Separator />

          {/* Content paragraphs */}
          <div>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm text-gray-600 leading-relaxed mb-5">
                  {paragraph.trim()}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">
                No additional details available.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {update.sourceUrl && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4">
              <a
                href={update.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-semibold rounded-xl">
                  View Official Document
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Button
                variant="outline"
                className="flex-1 py-3 text-base rounded-xl border-gray-200"
                onClick={shareWhatsApp}
              >
                <Share2 className="w-4 h-4 mr-2 text-green-600" />
                Share via WhatsApp
              </Button>
            </div>
          )}

          {/* WhatsApp share only (when no sourceUrl) */}
          {!update.sourceUrl && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4">
              <Button
                variant="outline"
                className="flex-1 py-3 text-base rounded-xl border-gray-200"
                onClick={shareWhatsApp}
              >
                <Share2 className="w-4 h-4 mr-2 text-green-600" />
                Share via WhatsApp
              </Button>
            </div>
          )}

          {/* View Full Page link */}
          <div className="pt-1 pb-4 border-t border-gray-100">
            <a
              href={`/updates/${update.slug}`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View Full Page
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
