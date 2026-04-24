import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Job Updates Kenya - Shortlists, Interviews & Deadlines | JobReady Kenya',
  description:
    'Stay informed with the latest job shortlists, interview schedules, deadline extensions, and government job announcements in Kenya. Never miss an important update.',
  alternates: { canonical: `${SITE.url}/updates` },
  openGraph: {
    title: 'Job Updates Kenya - Shortlists, Interviews & Deadlines | JobReady Kenya',
    description:
      'Stay informed with shortlists, interview schedules, deadline extensions, and government announcements.',
    url: `${SITE.url}/updates`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
