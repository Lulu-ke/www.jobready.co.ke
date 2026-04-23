import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Career Advice & Insights | JobReady Kenya',
  description:
    'Expert career tips, guides, and resources for job seekers and professionals in Kenya. Learn CV writing, interview preparation, salary negotiation, and career development strategies.',
  alternates: { canonical: `${SITE.url}/career-advice` },
  openGraph: {
    title: 'Career Advice & Insights | JobReady Kenya',
    description:
      'Expert career tips, guides, and resources for career development in Kenya.',
    url: `${SITE.url}/career-advice`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
