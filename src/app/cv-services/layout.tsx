import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Professional CV Writing Services in Kenya | JobReady Kenya',
  description:
    'Get a professional CV, cover letter, and LinkedIn profile written by experts. Boost your job search with our career services. ATS-optimised resumes tailored for the Kenyan job market.',
  alternates: { canonical: `${SITE.url}/cv-services` },
  openGraph: {
    title: 'Professional CV Writing Services in Kenya | JobReady Kenya',
    description:
      'Get a professional CV, cover letter, and LinkedIn profile written by experts. Boost your job search with our career services.',
    url: `${SITE.url}/cv-services`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function CVServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
