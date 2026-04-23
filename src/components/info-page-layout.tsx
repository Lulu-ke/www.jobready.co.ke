import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface InfoPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function InfoPageLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
}: InfoPageLayoutProps) {
  const defaultBreadcrumbs = [
    { label: 'Home', href: '/' },
    ...(breadcrumbs || [{ label: title }]),
  ];

  // If no custom breadcrumbs were provided, the page title is already included
  const crumbs = breadcrumbs
    ? [{ label: 'Home', href: '/' }, ...breadcrumbs]
    : defaultBreadcrumbs;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-5xl mx-auto px-4 py-3">
          <ol className="flex items-center gap-1.5 text-sm flex-wrap">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              if (isLast) {
                return (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    <span className="text-gray-700 font-medium">{crumb.label}</span>
                  </li>
                );
              }

              return (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-400 hover:text-[#1a56db] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-400">{crumb.label}</span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] text-white py-16 md:py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-1/3 -left-1/6 w-96 h-96 rounded-full bg-white/[0.03] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-5xl mx-auto py-12 px-4">
        {children}
      </main>
    </>
  );
}
