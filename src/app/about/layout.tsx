import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About JobReady Kenya - Our Mission',
  description:
    'Learn about JobReady Kenya, Kenya\'s fastest-growing job board connecting talent with opportunity. Discover our mission, team, and commitment to empowering Kenyan job seekers.',
  alternates: { canonical: `${SITE.url}/about` },
  openGraph: {
    title: 'About JobReady Kenya - Our Mission',
    description:
      "Learn about JobReady Kenya, Kenya's fastest-growing job board connecting talent with opportunity.",
    url: `${SITE.url}/about`,
    siteName: SITE.name,
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
