import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional CV Writing Services in Kenya | JobReady',
  description: 'Expert CV writing services in Kenya from KSh 500. ATS-optimized CVs, cover letters, and LinkedIn profiles. 92% interview success rate.',
  alternates: { canonical: 'https://www.jobready.co.ke/cv-services' },
  openGraph: {
    title: 'Professional CV Writing Services in Kenya | JobReady',
    description: 'Expert CV writing from KSh 500. 92% interview success rate. ATS-optimized for Kenyan recruiters.',
    url: 'https://www.jobready.co.ke/cv-services',
    type: 'website',
  },
};

export default function CVServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How long does it take to get my CV?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Delivery depends on the package you choose. Our Basic CV is delivered within 48 hours, Professional CV + Cover Letter within 24 hours, and Premium Package within 12 hours. Rush delivery is also available upon request.',
                },
              },
              {
                '@type': 'Question',
                name: 'What information do you need from me?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We need your current CV (if you have one), details about your work experience, education, skills, and the type of job you are targeting. The more information you provide, the better the result.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do you offer revisions?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! Our Basic package includes 1 free revision, Professional includes 2 free revisions, and Premium includes unlimited revisions for 30 days.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my payment secure?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Absolutely. We process payments through M-Pesa, the most trusted mobile payment platform in Kenya. Your financial information is never stored on our servers.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can you write a CV for a specific industry?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! Our writers specialize in various industries including IT, finance, healthcare, engineering, education, government, and more.',
                },
              },
              {
                '@type': 'Question',
                name: 'What makes JobReady CVs different?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our CVs are written by Kenyan market experts who understand what local recruiters and ATS systems look for. With a 92% interview success rate, our track record speaks for itself.',
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
