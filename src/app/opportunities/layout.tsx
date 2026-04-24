import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Scholarships, Internships & Funding in Kenya | JobReady Kenya',
  description:
    'Discover scholarships, bursaries, internships, fellowships, and professional certifications for Kenyan students and professionals. Fund your education and advance your career.',
  alternates: { canonical: `${SITE.url}/opportunities` },
  openGraph: {
    title: 'Scholarships, Internships & Funding in Kenya | JobReady Kenya',
    description:
      'Discover the latest scholarships, internships, and funding opportunities for Kenyan students and professionals.',
    url: `${SITE.url}/opportunities`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
