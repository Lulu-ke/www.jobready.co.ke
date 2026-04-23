import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import LegalPageLayout from '@/components/legal-page-layout';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: (
      <p>
        JobReady.co.ke (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy in accordance with the Kenya Data Protection Act, 2019. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. We are registered with the Office of the Data Protection Commissioner (ODPC) as a data controller.
      </p>
    ),
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: (
      <div className="space-y-4">
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Personal Information:</strong> When you create an account, we collect your name, email address, phone number, and location. When you upload a CV, we collect your employment history, education, skills, and professional summary.
          </li>
          <li>
            <strong>Usage Data:</strong> We automatically collect information about how you interact with our platform, including pages visited, search queries, time spent on pages, browser type, device information, and IP address.
          </li>
          <li>
            <strong>Job Application Data:</strong> When you apply for jobs, we collect your application details, cover letters, and any additional documents you submit to employers.
          </li>
          <li>
            <strong>Communication Data:</strong> We record your communications with us, including support tickets, email correspondence, and WhatsApp messages.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: (
      <p>
        We use the information we collect to: provide and maintain our job board services; match you with relevant job opportunities; send you job alerts and notifications you have subscribed to; process your CV writing service orders; communicate with you about your account, applications, and our services; improve our platform and user experience; comply with legal obligations; detect, prevent, and address technical issues and security threats; and analyze usage patterns to improve our services.
      </p>
    ),
  },
  {
    id: 'information-sharing',
    title: '4. Information Sharing',
    content: (
      <div className="space-y-4">
        <p>We may share your information with:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Employers and recruiters to whom you submit job applications</li>
          <li>CV writing service providers who assist in preparing your documents</li>
          <li>Service providers who help us operate our platform (hosting, analytics, email delivery)</li>
          <li>Law enforcement authorities when required by Kenyan law</li>
          <li>Business partners only with your explicit consent</li>
        </ul>
        <p><strong>We do NOT sell your personal information to third parties.</strong></p>
      </div>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies and Tracking Technologies',
    content: (
      <p>
        We use cookies and similar technologies to: remember your preferences and login session; analyze website traffic and usage patterns; deliver personalized job recommendations; measure the effectiveness of our marketing campaigns. You can control cookie settings through your browser. Please refer to our <a href="/cookies" className="text-[#1a56db] underline hover:text-blue-700">Cookie Policy</a> for more details.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: (
      <p>
        We retain your personal information for as long as your account is active or as needed to provide our services. Job application data is retained for 12 months after submission. CV documents are retained for 24 months unless you request earlier deletion. You can request deletion of your data at any time by contacting us at{' '}
        <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a>.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: '7. Your Rights Under the Data Protection Act',
    content: (
      <div className="space-y-4">
        <p>Under the Kenya Data Protection Act, 2019, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Be informed about the collection and use of your personal data</li>
          <li>Access your personal data held by us</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>Request deletion of your data (right to be forgotten)</li>
          <li>Restrict or object to processing of your data</li>
          <li>Data portability — receive your data in a structured format</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with the Office of the Data Protection Commissioner</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'data-security',
    title: '8. Data Security',
    content: (
      <div className="space-y-4">
        <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>SSL/TLS encryption for all data in transit</li>
          <li>Encrypted storage for sensitive data</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Access controls limiting data access to authorized personnel</li>
          <li>Secure data backup and disaster recovery procedures</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "9. Children's Privacy",
    content: (
      <p>
        Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 18, we will take steps to delete that information promptly.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: (
      <div className="space-y-2">
        <p>For any privacy-related questions or to exercise your data protection rights, please contact us at:</p>
        <ul className="list-none space-y-1">
          <li><strong>Email:</strong> <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a></li>
          <li><strong>Phone:</strong> +254 786 090 635</li>
          <li><strong>Address:</strong> Nairobi, Kenya</li>
        </ul>
        <p>You may also lodge a complaint with the Office of the Data Protection Commissioner at{' '}
          <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-[#1a56db] underline hover:text-blue-700">www.odpc.go.ke</a>.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LegalPageLayout
          title="Privacy Policy"
          lastUpdated="April 2026"
          sections={sections}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
