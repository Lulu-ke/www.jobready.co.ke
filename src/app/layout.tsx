import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SITE } from "@/lib/constants";
import AuthProvider from "@/components/auth-provider";
import CookieConsent from "@/components/cookie-consent";
import BackToTop from "@/components/back-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobReady Kenya - Find Jobs, Internships & Scholarships in Kenya",
  description: "Kenya's #1 job board. Browse 2,500+ jobs from top employers including Safaricom, Equity Bank, KCB, and more. Find your dream career today.",
  keywords: ["jobs in Kenya", "Kenyan jobs", "job board Kenya", "careers Kenya", "Safaricom jobs", "NGO jobs Kenya", "government jobs Kenya", "scholarships Kenya", "internships Kenya"],
  authors: [{ name: "JobReady Kenya" }],
  alternates: {
    canonical: 'https://www.jobready.co.ke',
  },
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "JobReady Kenya - Find Jobs, Internships & Scholarships",
    description: "Kenya's #1 job board. Browse 2,500+ jobs from top employers. Find your dream career today.",
    siteName: "JobReady Kenya",
    locale: "en_KE",
    type: "website",
    url: 'https://www.jobready.co.ke',
    images: [{ url: 'https://www.jobready.co.ke/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobReady Kenya - Find Jobs & Careers",
    description: "Browse 2,500+ jobs from top Kenyan employers. Find your dream career today.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'JobReady Kenya',
              url: SITE.url,
              description: SITE.description,
              publisher: {
                '@type': 'Organization',
                name: 'JobReady Kenya',
                url: SITE.url,
                logo: `${SITE.url}/logo.png`,
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE.url}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <link rel="alternate" type="application/rss+xml" title="JobReady Kenya RSS Feed" href="https://www.jobready.co.ke/feed.xml" />
        <AuthProvider>
          {children}
        </AuthProvider>
        <BackToTop />
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
