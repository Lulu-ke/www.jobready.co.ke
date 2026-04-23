import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import LegalPageLayout from '@/components/legal-page-layout';

const sections = [
  {
    id: 'general',
    title: '1. General Disclaimer',
    content: (
      <p>
        The information provided on JobReady.co.ke is for general informational purposes only. While we strive to keep all job listings, career advice, and resources accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, services, or related graphics contained on this website for any particular purpose.
      </p>
    ),
  },
  {
    id: 'no-guarantee',
    title: '2. No Guarantee of Employment',
    content: (
      <p>
        JobReady.co.ke does not guarantee employment, job interviews, or any specific outcomes from using our platform. Job listings are provided by third-party employers, and we act solely as an intermediary. The inclusion of a job listing does not constitute an endorsement of the employer or a guarantee of the accuracy of the job details. Users are encouraged to independently verify all job information before applying.
      </p>
    ),
  },
  {
    id: 'third-party',
    title: '3. Third-Party Content & Links',
    content: (
      <p>
        Our website may contain links to third-party websites, resources, or services that are not owned or controlled by JobReady.co.ke. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. The inclusion of any link does not imply endorsement by us. We strongly advise you to review the terms and policies of any third-party site you visit.
      </p>
    ),
  },
  {
    id: 'professional-advice',
    title: '4. Not Professional Advice',
    content: (
      <p>
        The career advice, salary information, interview tips, and other resources published on JobReady.co.ke are intended for general guidance only and do not constitute professional career counseling, legal advice, tax advice, or any other form of professional advice. You should not rely solely on this information when making career or financial decisions. We recommend consulting with a qualified professional for advice specific to your circumstances.
      </p>
    ),
  },
  {
    id: 'limitation',
    title: '5. Limitation of Liability',
    content: (
      <p>
        In no event shall JobReady.co.ke, its directors, employees, or agents be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, arising from the use of this website or the information contained herein. Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '6. Changes to This Disclaimer',
    content: (
      <p>
        We reserve the right to modify this Disclaimer at any time. Changes will be effective immediately upon posting on this page with an updated revision date. We encourage you to review this page periodically for the latest information. If you have any questions about this Disclaimer, please contact us at{' '}
        <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a>.
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LegalPageLayout
          title="Disclaimer"
          lastUpdated="April 2026"
          sections={sections}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
