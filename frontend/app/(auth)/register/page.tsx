'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getStrength(pw: string): { label: string; color: string; pct: number } | null {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Weak',   color: '#ef4444', pct: 25  },
    { label: 'Fair',   color: '#f97316', pct: 50  },
    { label: 'Good',   color: '#eab308', pct: 75  },
    { label: 'Strong', color: '#22c55e', pct: 100 },
  ];
  return levels[Math.max(score - 1, 0)];
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showPw2, setShowPw2]     = useState(false);

  const strength = getStrength(form.password);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register/', form);
      router.replace('/login');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (data) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors(flat);
      } else {
        setErrors({ non_field_errors: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>
            Create an account
          </h1>
          <p className="text-gray-500 text-sm mt-1">Start mastering communication today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" required value={form.username} onChange={field('username')} />
            {errors.username && <p className="text-xs text-red-600">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={field('email')} />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={form.password}
                onChange={field('password')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength bar */}
            {strength && (
              <div className="mt-1.5">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="password2">Confirm password</Label>
            <div className="relative">
              <Input
                id="password2"
                type={showPw2 ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={form.password2}
                onChange={field('password2')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw2((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                tabIndex={-1}
              >
                {showPw2 ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password2 && <p className="text-xs text-red-600">{errors.password2}</p>}
          </div>

          {errors.non_field_errors && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {errors.non_field_errors}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full font-medium text-[#141c52]"
            style={{ backgroundColor: '#FADB43' }}
          >
            {loading ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#141c52' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
