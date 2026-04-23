'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setName('');
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 lg:p-14"
        >
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-sm mb-4">
              <Bell className="w-4 h-4" />
              Stay Updated
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Never Miss a Job Opportunity
            </h2>
            <p className="text-teal-100 mb-8 max-w-lg mx-auto text-sm sm:text-base">
              Get the latest jobs, scholarships, and career tips delivered straight to your inbox. Join 50,000+ Kenyan job seekers.
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 text-white text-lg"
              >
                <CheckCircle className="w-6 h-6 text-green-300" />
                You&apos;re subscribed! Check your inbox for a welcome email.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/30 h-11 rounded-full"
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/30 h-11 rounded-full"
                />
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-white text-teal-700 hover:bg-white/90 font-semibold px-6 h-11 rounded-full shadow-lg"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-red-200 text-sm mt-2">Something went wrong. Please try again.</p>
            )}

            <p className="text-xs text-teal-200/80 mt-4">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
