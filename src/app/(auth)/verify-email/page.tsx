'use client';

import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">Email verified</CardTitle>
        <CardDescription className="text-gray-500 mt-1">
          Your email has been successfully verified
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 leading-relaxed">
              Your account is now active and ready to use. You can start browsing jobs,
              saving your favourites, and building your professional profile.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-11 rounded-xl font-medium"
            >
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
