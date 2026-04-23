import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Top Employers in Kenya - Company Directory | JobReady Kenya',
  description:
    'Browse top employers hiring in Kenya — from innovative startups to established corporates and government agencies. Explore company profiles, open positions, and company culture.',
  alternates: { canonical: `${SITE.url}/companies` },
  openGraph: {
    title: 'Top Employers in Kenya - Company Directory | JobReady Kenya',
    description:
      'Browse top employers hiring in Kenya from startups to government agencies. Explore company profiles and open positions.',
    url: `${SITE.url}/companies`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
