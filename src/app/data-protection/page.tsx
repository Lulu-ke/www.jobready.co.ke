import type { Metadata } from 'next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import LegalPageLayout from '@/components/legal-page-layout';

export const metadata: Metadata = {
  title: 'Data Protection Policy | JobReady Kenya',
  description: 'How JobReady Kenya handles and protects your personal data in compliance with Kenya\'s data protection laws.',
  alternates: { canonical: 'https://www.jobready.co.ke/data-protection' },
};

const sections = [
  {
    id: 'odpc',
    title: '1. ODPC Registration',
    content: (
      <p>
        JobReady.co.ke is registered with the Office of the Data Protection Commissioner (ODPC) of Kenya as required under the Data Protection Act, 2019. Our registration as a data controller demonstrates our commitment to processing personal data lawfully, transparently, and in accordance with the rights of data subjects. You may verify our registration status at{' '}
        <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-[#1a56db] underline hover:text-blue-700">www.odpc.go.ke</a>.
      </p>
    ),
  },
  {
    id: 'controller',
    title: '2. Data Controller Details',
    content: (
      <div className="space-y-2">
        <p>As the data controller, JobReady.co.ke determines the purposes and means of processing your personal data. Our data controller details are as follows:</p>
        <ul className="list-none space-y-1">
          <li><strong>Organization:</strong> JobReady.co.ke</li>
          <li><strong>Email:</strong> <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a></li>
          <li><strong>Phone:</strong> +254 786 090 635</li>
          <li><strong>Address:</strong> Nairobi, Kenya</li>
          <li><strong>Data Protection Officer:</strong> You may reach our DPO through the contact details above</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'legal-basis',
    title: '3. Legal Basis for Processing',
    content: (
      <div className="space-y-4">
        <p>We process your personal data only when we have a lawful basis to do so under the Data Protection Act, 2019. Our legal bases include:</p>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Consent:</strong> Where you have given us explicit consent to process your personal data, such as for receiving job alerts, marketing communications, or newsletter subscriptions. You may withdraw consent at any time.
          </li>
          <li>
            <strong>Contractual Necessity:</strong> Where processing is necessary for the performance of a contract with you, such as providing job board services, processing CV writing orders, or facilitating job applications.
          </li>
          <li>
            <strong>Legitimate Interest:</strong> Where processing is necessary for our legitimate business interests, such as improving our platform, preventing fraud, and ensuring network security, provided such interests are not overridden by your rights and freedoms.
          </li>
          <li>
            <strong>Legal Obligation:</strong> Where processing is necessary to comply with Kenyan law, including tax regulations, anti-money laundering requirements, and lawful requests from public authorities.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'data-collected',
    title: '4. Data We Collect & Process',
    content: (
      <div className="space-y-4">
        <p>We collect and process the following categories of personal data:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Identity Data:</strong> Name, email address, phone number, and physical location</li>
          <li><strong>Professional Data:</strong> Employment history, education, skills, CV content, and cover letters</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
          <li><strong>Usage Data:</strong> Pages visited, search queries, click patterns, and session duration</li>
          <li><strong>Communication Data:</strong> Support tickets, emails, and WhatsApp messages</li>
          <li><strong>Payment Data:</strong> M-Pesa transaction references and payment confirmation details</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'your-rights',
    title: '5. Your Data Protection Rights',
    content: (
      <div className="space-y-4">
        <p>Under the Kenya Data Protection Act, 2019, you have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Right to be Informed:</strong> You have the right to know how and why we process your data</li>
          <li><strong>Right of Access:</strong> You may request a copy of the personal data we hold about you</li>
          <li><strong>Right to Rectification:</strong> You may request correction of any inaccurate or incomplete data</li>
          <li><strong>Right to Erasure:</strong> You may request deletion of your data (&quot;right to be forgotten&quot;)</li>
          <li><strong>Right to Restrict Processing:</strong> You may request that we limit how we use your data</li>
          <li><strong>Right to Data Portability:</strong> You may request your data in a structured, machine-readable format</li>
          <li><strong>Right to Object:</strong> You may object to processing based on legitimate interests or for direct marketing</li>
          <li><strong>Rights Related to Automated Decision-Making:</strong> You have the right not to be subject to decisions based solely on automated processing</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a>. We will respond to your request within 30 days as required by law.
        </p>
      </div>
    ),
  },
  {
    id: 'retention',
    title: '6. Data Retention Periods',
    content: (
      <div className="space-y-4">
        <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account Data:</strong> Retained while your account is active and for 12 months after last activity</li>
          <li><strong>Job Applications:</strong> Retained for 12 months after the application submission date</li>
          <li><strong>CV Documents:</strong> Retained for 24 months from the date of service delivery unless you request earlier deletion</li>
          <li><strong>Payment Records:</strong> Retained for 7 years in compliance with Kenyan financial regulations</li>
          <li><strong>Analytics Data:</strong> Anonymized after 26 months and retained in aggregate form</li>
          <li><strong>Communication Records:</strong> Retained for 12 months after the communication is closed</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'breach',
    title: '7. Data Breach Notification',
    content: (
      <p>
        In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the Office of the Data Protection Commissioner within 72 hours of becoming aware of the breach. Where the breach is likely to result in a high risk to your rights and freedoms, we will also notify you directly without undue delay. Our breach response procedures include immediate containment, investigation, remediation, and communication with affected parties.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '8. Contact & Complaints',
    content: (
      <div className="space-y-2">
        <p>
          If you have any questions about this Data Protection Notice or wish to exercise your data protection rights, please contact us:
        </p>
        <ul className="list-none space-y-1">
          <li><strong>Email:</strong> <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a></li>
          <li><strong>Phone / WhatsApp:</strong> +254 786 090 635</li>
          <li><strong>Address:</strong> Nairobi, Kenya</li>
        </ul>
        <p>
          If you are unsatisfied with our response to your data protection concerns, you have the right to lodge a complaint with the Office of the Data Protection Commissioner at{' '}
          <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-[#1a56db] underline hover:text-blue-700">www.odpc.go.ke</a>.
        </p>
      </div>
    ),
  },
];

export default function DataProtectionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LegalPageLayout
          title="Data Protection Notice"
          lastUpdated="April 2026"
          sections={sections}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
