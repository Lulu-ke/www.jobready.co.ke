import type { Metadata } from 'next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import LegalPageLayout from '@/components/legal-page-layout';

export const metadata: Metadata = {
  title: 'Cookie Policy | JobReady Kenya',
  description: 'Learn how JobReady Kenya uses cookies and tracking technologies to improve your browsing experience.',
  alternates: { canonical: 'https://www.jobready.co.ke/cookies' },
};

const sections = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies',
    content: (
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences, improve your browsing experience, and provide usage analytics. Similar technologies include pixel tags, web beacons, and local storage, which function in comparable ways.
      </p>
    ),
  },
  {
    id: 'types',
    title: '2. Types of Cookies We Use',
    content: (
      <div className="space-y-4">
        <p>We use the following categories of cookies on JobReady.co.ke:</p>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Essential Cookies:</strong> Required for the basic functionality of the website, including session management and security features. These cannot be disabled.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous usage data.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your preferences and settings to provide a more personalized experience.
          </li>
          <li>
            <strong>Advertising Cookies:</strong> Used to deliver relevant advertisements and measure campaign effectiveness.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'essential',
    title: '3. Essential Cookies',
    content: (
      <p>
        These cookies are necessary for the operation of our website. They enable core features such as user authentication, secure login sessions, and protection against cross-site request forgery (CSRF). Essential cookies are set automatically and cannot be opted out of, as the website cannot function properly without them.
      </p>
    ),
  },
  {
    id: 'analytics',
    title: '4. Analytics Cookies',
    content: (
      <p>
        We use analytics cookies, primarily from Google Analytics, to collect information about how visitors use our platform. This includes pages visited, time spent on each page, navigation patterns, and device information. The data collected is anonymized and used solely to improve our website performance and user experience. We do not use analytics cookies to track individual users across other websites.
      </p>
    ),
  },
  {
    id: 'how-used',
    title: '5. How We Use Cookies',
    content: (
      <div className="space-y-4">
        <p>Cookies on JobReady.co.ke serve the following purposes:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Keeping you logged in during your browsing session</li>
          <li>Remembering your job search preferences and filters</li>
          <li>Analyzing website traffic to improve content and navigation</li>
          <li>Delivering personalized job recommendations</li>
          <li>Measuring the effectiveness of marketing campaigns</li>
          <li>Detecting and preventing fraudulent activity</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'managing',
    title: '6. Managing Your Cookie Preferences',
    content: (
      <p>
        You can manage or disable cookies through your browser settings. Most browsers allow you to block or delete cookies. Please note that disabling certain cookies may affect the functionality of our website. For detailed instructions on managing cookies in your specific browser, visit the help section of your browser&apos;s settings. You can also opt out of Google Analytics tracking by installing the{' '}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#1a56db] underline hover:text-blue-700">Google Analytics Opt-out Browser Add-on</a>.
      </p>
    ),
  },
  {
    id: 'third-party',
    title: '7. Third-Party Cookies',
    content: (
      <p>
        Our website may include content and integrations from third-party services such as Google Analytics, social media platforms, and advertising networks. These third parties may set their own cookies on your device when you interact with their content. We do not control these third-party cookies and recommend reviewing the privacy policies of these providers for more information about their cookie practices.
      </p>
    ),
  },
  {
    id: 'updates-contact',
    title: '8. Updates & Contact',
    content: (
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our practices or applicable regulations. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date. If you have any questions about our use of cookies, please contact us at{' '}
        <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a>.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LegalPageLayout
          title="Cookie Policy"
          lastUpdated="April 2026"
          sections={sections}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
