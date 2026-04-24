'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="text-center pb-2">
        {sent ? (
          <>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Check your email</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              We sent a password reset link to <strong className="text-slate-700">{email}</strong>
            </CardDescription>
          </>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Forgot password?</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              If an account exists with that email, you will receive a password reset link shortly.
              The link expires in 1 hour.
            </p>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-medium"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              Try a different email
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t pt-6">
        <Link
          href="/login"
          className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
