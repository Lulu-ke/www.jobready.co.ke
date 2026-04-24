'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Briefcase, Mail, Lock, User, Loader2, ArrowRight, X, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'login' | 'register';
  title?: string;
  subtitle?: string;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  defaultTab = 'login',
  title = 'Sign in to continue',
  subtitle = 'Save jobs, track applications, and get personalized recommendations',
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(
          result.error === 'CredentialsSignin'
            ? 'Invalid email or password'
            : result.error
        );
      } else {
        router.refresh();
        onSuccess?.();
        onClose();
      }
    } catch {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters');
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });

      if (result?.error) {
        // Account created but sign-in failed — still count as success
        onSuccess?.();
        onClose();
      } else {
        router.refresh();
        onSuccess?.();
        onClose();
      }
    } catch {
      setRegError('Something went wrong. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: window.location.pathname });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-gray-200 gap-0">
        {/* Header */}
        <DialogHeader className="text-center pt-6 pb-2 px-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center mb-3">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800">{title}</DialogTitle>
          <DialogDescription className="text-gray-500 text-sm mt-1">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
            <TabsList className="w-full grid grid-cols-2 mb-4 h-10 rounded-xl bg-gray-100 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-700"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="login" className="space-y-4 mt-0">
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm font-medium rounded-xl border-gray-200 hover:bg-gray-50"
                onClick={handleGoogleSignIn}
                disabled={loginLoading}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-medium">Or continue with email</span>
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="auth-login-email" className="text-sm font-medium text-slate-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="auth-login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-gray-200 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                      required
                      disabled={loginLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-login-password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <a
                      href="/forgot-password"
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="auth-login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-gray-200 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                      required
                      disabled={loginLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                  {!loginLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="register" className="space-y-4 mt-0">
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm font-medium rounded-xl border-gray-200 hover:bg-gray-50"
                onClick={handleGoogleSignIn}
                disabled={regLoading}
              >
                <GoogleIcon />
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-medium">Or register with email</span>
                </div>
              </div>

              {regError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="auth-reg-name" className="text-sm font-medium text-slate-700">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="auth-reg-name"
                      type="text"
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      required
                      disabled={regLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="auth-reg-email" className="text-sm font-medium text-slate-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="auth-reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      required
                      disabled={regLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="auth-reg-password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="auth-reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 rounded-xl border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      required
                      minLength={8}
                      disabled={regLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="auth-reg-confirm" className="text-sm font-medium text-slate-700">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="auth-reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 rounded-xl border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      required
                      minLength={8}
                      disabled={regLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                  disabled={regLoading}
                >
                  {regLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                  {!regLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
