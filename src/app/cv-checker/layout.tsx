import type { Metadata } from 'next';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Free ATS CV Checker - Is Your CV Ready? | JobReady Kenya',
  description:
    'Check your CV against ATS algorithms for free. Get instant scores for keyword match, formatting, section completeness, and readability. Trusted by 23,000+ Kenyan job seekers.',
  alternates: {
    canonical: 'https://www.jobready.co.ke/cv-checker',
  },
  openGraph: {
    title: 'Free ATS CV Checker - Is Your CV Ready? | JobReady Kenya',
    description:
      'Check your CV against ATS algorithms for free. Get instant scores for keyword match, formatting, section completeness, and readability. Trusted by 23,000+ Kenyan job seekers.',
    url: 'https://www.jobready.co.ke/cv-checker',
    type: 'website',
    siteName: 'JobReady Kenya',
    images: [
      {
        url: 'https://www.jobready.co.ke/og-cv-checker.png',
        width: 1200,
        height: 630,
        alt: 'Free ATS CV Checker - JobReady Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free ATS CV Checker - Is Your CV Ready? | JobReady Kenya',
    description:
      'Check your CV against ATS algorithms for free. Instant scores for keyword match, formatting, and readability.',
    images: ['https://www.jobready.co.ke/og-cv-checker.png'],
  },
};

export default function CVCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.jobready.co.ke',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'CV Checker',
                item: 'https://www.jobready.co.ke/cv-checker',
              },
            ],
          }),
        }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
