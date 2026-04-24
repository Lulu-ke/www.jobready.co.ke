import type { Metadata } from 'next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import LegalPageLayout from '@/components/legal-page-layout';

export const metadata: Metadata = {
  title: 'Refund Policy | JobReady Kenya',
  description: 'Learn about JobReady Kenya\'s refund policy for CV writing and career services.',
  alternates: { canonical: 'https://www.jobready.co.ke/refunds' },
};

const sections = [
  {
    id: 'overview',
    title: '1. Refund Policy Overview',
    content: (
      <p>
        At JobReady.co.ke, we are committed to delivering high-quality services. If you are not satisfied with our CV writing service, we offer a transparent refund process outlined below. This Refund Policy applies to all paid services purchased through our platform, including CV writing, cover letter writing, and LinkedIn optimization services.
      </p>
    ),
  },
  {
    id: 'cv-services',
    title: '2. CV Writing Services',
    content: (
      <p>
        Our CV writing services include professional CV preparation, cover letter writing, LinkedIn profile optimization, and related career document services. Each service package is clearly described on our{' '}
        <a href="/cv-services" className="text-[#1a56db] underline hover:text-blue-700">CV Services page</a>, including pricing, deliverables, and revision terms. All services are subject to the refund terms described in this policy.
      </p>
    ),
  },
  {
    id: 'eligibility',
    title: '3. Refund Eligibility',
    content: (
      <div className="space-y-4">
        <p>You may be eligible for a refund under the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>The service has not been delivered within the stated timeframe and no alternative delivery date has been agreed upon</li>
          <li>The final document contains significant errors or does not meet the quality standards described in your service package</li>
          <li>You were charged incorrectly due to a technical or billing error</li>
          <li>The service was not rendered due to a fault on our end</li>
        </ul>
        <p>
          Refund requests must be submitted within <strong>7 calendar days</strong> of receiving the final deliverable or, if no deliverable was provided, within 7 days of the original payment date.
        </p>
      </div>
    ),
  },
  {
    id: 'process',
    title: '4. How to Request a Refund',
    content: (
      <div className="space-y-4">
        <p>To request a refund, please follow these steps:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Send an email to <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a> with the subject line &quot;Refund Request — [Your Order Number]&quot;</li>
          <li>Include your full name, phone number, and the email address used during your order</li>
          <li>Describe the reason for your refund request in detail</li>
          <li>Attach any relevant supporting documents (e.g., the received CV, payment confirmation)</li>
        </ol>
        <p>
          Our team will review your request and respond within <strong>3 business days</strong>. You may also contact us via WhatsApp at +254 786 090 635 for faster assistance.
        </p>
      </div>
    ),
  },
  {
    id: 'timeline',
    title: '5. Refund Processing Timeline',
    content: (
      <div className="space-y-4">
        <p>Approved refunds are processed as follows:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>M-Pesa refunds:</strong> Processed within 3–5 business days and returned to the M-Pesa number used for payment</li>
          <li><strong>Bank transfer refunds:</strong> Processed within 5–10 business days to the original bank account</li>
        </ul>
        <p>You will receive a confirmation email once the refund has been initiated. Processing times are subject to your payment provider&apos;s policies and may vary.
        </p>
      </div>
    ),
  },
  {
    id: 'exceptions',
    title: '6. Non-Refundable Situations',
    content: (
      <div className="space-y-4">
        <p>The following situations are not eligible for a refund:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>More than 7 calendar days have passed since delivery of the final document</li>
          <li>You provided inaccurate or incomplete information during the order process</li>
          <li>The refund request is based on employer rejection or failure to secure an interview</li>
          <li>You requested a format or style change that was not part of the original service agreement</li>
          <li>The service has already been revised according to the package revision terms</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'partial',
    title: '7. Partial Refunds',
    content: (
      <p>
        In some cases, we may offer a partial refund at our discretion. This applies when the service has been partially delivered or when only some aspects of the deliverable are disputed. Partial refund amounts will be calculated based on the portion of the service that was not satisfactorily completed. We will communicate the partial refund amount and reasoning before processing.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '8. Contact Us',
    content: (
      <div className="space-y-2">
        <p>If you have any questions about our Refund Policy, please contact us:</p>
        <ul className="list-none space-y-1">
          <li><strong>Email:</strong> <a href="mailto:support@jobready.co.ke" className="text-[#1a56db] underline hover:text-blue-700">support@jobready.co.ke</a></li>
          <li><strong>Phone / WhatsApp:</strong> +254 786 090 635</li>
          <li><strong>Address:</strong> Nairobi, Kenya</li>
        </ul>
      </div>
    ),
  },
];

export default function RefundsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LegalPageLayout
          title="Refund Policy"
          lastUpdated="April 2026"
          sections={sections}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
