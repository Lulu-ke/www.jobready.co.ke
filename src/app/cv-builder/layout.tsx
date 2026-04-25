import CVBuilderNavbar from './cv-builder-navbar';

export default function CVBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CVBuilderNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
