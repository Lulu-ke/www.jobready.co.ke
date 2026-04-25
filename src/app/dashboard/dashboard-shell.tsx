'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Bookmark,
  Briefcase,
  Bell,
  BellRing,
  LogOut,
  Menu,
  ChevronRight,
  Mail,
  FilePlus2,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface DashboardContextType {
  user: DashboardUser;
}

export const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboardUser() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardUser must be used within DashboardShell');
  return ctx.user;
}

interface DashboardShellProps {
  user: DashboardUser;
  children: React.ReactNode;
}

const navLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/cover-letter', label: 'Cover Letter', icon: Mail },
  { href: '/dashboard/cv', label: 'My CV', icon: FileText },
  { href: '/dashboard/saved', label: 'Saved Jobs', icon: Bookmark },
  { href: '/dashboard/applications', label: 'Applications', icon: Briefcase },
  { href: '/dashboard/alerts', label: 'Job Alerts', icon: BellRing },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/cv-builder', label: 'Build CV', icon: FilePlus2, external: true },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="bg-teal-600 text-white text-sm font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = !link.external && isActive(link.href);
          const isExternal = 'external' in link && link.external;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-teal-600 text-white shadow-sm'
                  : isExternal
                    ? 'text-teal-600 hover:bg-teal-50 hover:text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
              {isExternal && <ExternalLink className="w-3.5 h-3.5 ml-auto" />}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <DashboardContext.Provider value={{ user }}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
          {/* Logo */}
          <div className="p-4 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-purple-700">
                JK
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight text-gray-900">JobReady</span>
                <span className="text-[10px] text-gray-400 leading-none tracking-wider uppercase">Kenya</span>
              </div>
            </Link>
          </div>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:pl-72">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-40 lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SheetHeader className="p-4 border-b border-gray-100">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-purple-700">
                        JK
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold leading-tight text-gray-900">JobReady</span>
                        <span className="text-[10px] text-gray-400 leading-none tracking-wider uppercase">Kenya</span>
                      </div>
                    </div>
                  </SheetHeader>
                  {sidebarContent}
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Dashboard</span>
              </div>

              <Link href="/dashboard/notifications" className="relative p-2">
                <Bell className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
