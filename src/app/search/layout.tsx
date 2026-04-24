import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | JobReady Kenya',
  description: 'Search jobs, companies, scholarships, and career advice on JobReady Kenya.',
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
