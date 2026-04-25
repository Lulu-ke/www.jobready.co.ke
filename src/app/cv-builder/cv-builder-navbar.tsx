'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function CVBuilderNavbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#5B21B6] shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 lg:px-8 max-w-[1280px] mx-auto">
        {/* Left: Back link + Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0D9488] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <div className="w-px h-6 bg-gray-200 hidden sm:block" />
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="JobReady Kenya" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:inline">
                {session.user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link
              href="/login?callbackUrl=/cv-builder"
              className="text-sm font-medium text-[#5B21B6] hover:text-[#4a1a94] transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
