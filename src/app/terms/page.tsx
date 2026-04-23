import type { Metadata } from 'next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import LegalPageLayout from '@/components/legal-page-layout';

export const metadata: Metadata = {
  title: 'Terms of Service | JobReady Kenya',
  description: 'Review the terms and conditions for using JobReady Kenya\'s job board and career services.',
  alternates: { canonical: 'https://www.jobready.co.ke/terms' },
};

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: (
      <p>
        By accessing and using JobReady.co.ke, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform. These terms apply to all visitors, users, and others who access or use our services.
      </p>
    ),
  },
  {
    id: 'description',
    title: '2. Description of Service',
    content: (
      <p>
        JobReady.co.ke provides an online job board connecting job seekers with employers in Kenya. Our services include job listings, career resources, CV writing services, company profiles, and job alert notifications. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: '3. User Accounts & Registration',
    content: (
      <p>
        You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration. You agree to notify us immediately of any unauthorized use of your account.
      </p>
    ),
  },
  {
    id: 'user-content',
    title: '4. User Content & Responsibilities',
    content: (
      <div className="space-y-4">
        <p>
          You are responsible for the accuracy of all content you submit, including your CV, profile information, and job applications. You agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Post fake or misleading job listings</li>
          <li>Impersonate any person or entity</li>
          <li>Upload malicious content</li>
          <li>Scrape or collect data from our platform without permission</li>
          <li>Use our services for any unlawful purpose</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'job-listings',
    title: '5. Job Listings & Applications',
    content: (
      <p>
        We act as an intermediary between job seekers and employers. We do not guarantee employment or the accuracy of job listings. Applications you submit are shared directly with the listing employer. We are not responsible for employer responses or hiring decisions.
      </p>
    ),
  },
  {
    id: 'cv-services',
    title: '6. CV Writing Services',
    content: (
      <p>
        Our CV writing service includes professional CV preparation, cover letter writing, and LinkedIn optimization. Pricing, delivery timelines, and revision policies are as described on our CV Services page. All CV content is treated as confidential.
      </p>
    ),
  },
  {
    id: 'payment',
    title: '7. Payment Terms',
    content: (
      <p>
        Prices are listed in Kenya Shillings (KSh). Payment is processed via M-Pesa (Safaricom) and bank transfer. Orders are confirmed upon successful payment. Our refund policy is available at{' '}
        <a href="/refunds" className="text-[#1a56db] underline hover:text-blue-700">/refunds</a>.
      </p>
    ),
  },
  {
    id: 'ip',
    title: '8. Intellectual Property',
    content: (
      <p>
        All content on JobReady.co.ke, including text, graphics, logos, and software, is our property or licensed to us. Users retain ownership of their own CVs and profile content. You grant us a license to display your CV to potential employers.
      </p>
    ),
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: (
      <p>
        JobReady.co.ke shall not be liable for any indirect, incidental, special, consequential, or punitive damages. We are not liable for any lost opportunities, employment decisions, or data loss. Our total liability shall not exceed the fees paid by you in the preceding 12 months.
      </p>
    ),
  },
  {
    id: 'indemnification',
    title: '10. Indemnification',
    content: (
      <p>
        You agree to indemnify and hold harmless JobReady.co.ke, its directors, employees, and agents from any claims, damages, or expenses arising from your use of our services or violation of these terms.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: '11. Governing Law',
    content: (
      <p>
        These Terms of Service are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in accordance with Kenyan law.
      </p>
    ),
  },
  {
    id: 'dispute',
    title: '12. Dispute Resolution',
    content: (
      <p>
        Any disputes shall first be attempted to be resolved through good faith negotiation. If unresolved within 30 days, parties agree to mediation. If mediation fails, disputes shall be resolved in the courts of Nairobi, Kenya.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '13. Changes to Terms',
    content: (
      <p>
        We reserve the right to update these terms at any time. We will notify users of material changes via email or platform notification. Continued use after changes constitutes acceptance.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '14. Contact Information',
    content: (
      <p>
        For questions about these Terms, contact us at{' '}
        <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a> or visit{' '}
        <a href="/contact" className="text-[#1a56db] underline hover:text-blue-700">/contact</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LegalPageLayout
          title="Terms of Service"
          lastUpdated="April 2026"
          sections={sections}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
