import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CVBuilderNavbar from './cv-builder-navbar';

export default async function CVBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/cv-builder');
  }

  const user = {
    name: session.user.name || 'User',
    email: session.user.email || '',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CVBuilderNavbar user={user} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
