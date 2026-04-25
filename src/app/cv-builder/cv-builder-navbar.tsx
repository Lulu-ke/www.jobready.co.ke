'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVBuilderNavbarProps {
  user: {
    name: string;
    email: string;
  };
}

export default function CVBuilderNavbar({ user }: CVBuilderNavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-purple-700">
            JK
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-gray-900">JobReady</span>
            <span className="text-[10px] text-gray-400 leading-none tracking-wider uppercase">Kenya</span>
          </div>
        </Link>

        {/* Right side: user info + sign out */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
          <span className="sm:hidden text-sm font-medium text-gray-900">{user.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
