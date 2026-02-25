'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email: identifier });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>
            Reset your password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email or username and we&apos;ll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-4">📬</p>
            <p className="font-semibold text-sm mb-2" style={{ color: '#141c52' }}>
              Check your inbox
            </p>
            <p className="text-gray-500 text-sm">
              If an account with that email exists, a reset link has been sent.
              Check your server logs if you&apos;re running locally.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm font-medium hover:underline"
              style={{ color: '#141c52' }}
            >
              ← Back to Log in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                required
                autoComplete="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full font-medium text-[#141c52]"
              style={{ backgroundColor: '#FADB43' }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="font-medium hover:underline" style={{ color: '#141c52' }}>
                ← Back to Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
