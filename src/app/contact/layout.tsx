import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact JobReady Kenya',
  description:
    'Get in touch with JobReady Kenya. We\'re here to help job seekers and employers with questions about listings, accounts, partnerships, and more.',
  alternates: { canonical: `${SITE.url}/contact` },
  openGraph: {
    title: 'Contact JobReady Kenya',
    description:
      "Get in touch with JobReady Kenya. We're here to help job seekers and employers.",
    url: `${SITE.url}/contact`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
