import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Browse Jobs in Kenya | JobReady Kenya',
  description:
    'Search and apply for the latest jobs in Kenya. Filter by category, location, county, job type, and salary. Find full-time, part-time, internship, and remote jobs.',
  alternates: { canonical: `${SITE.url}/jobs` },
  openGraph: {
    title: 'Browse Jobs in Kenya | JobReady Kenya',
    description:
      'Search and apply for the latest jobs across Kenya. 2,500+ active vacancies from top employers.',
    url: `${SITE.url}/jobs`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
