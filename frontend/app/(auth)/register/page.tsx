'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
          {(['username', 'email', 'password', 'password2'] as const).map((key) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>
                {key === 'password2' ? 'Confirm password' : key.charAt(0).toUpperCase() + key.slice(1)}
              </Label>
              <Input
                id={key}
                type={key.includes('password') ? 'password' : key === 'email' ? 'email' : 'text'}
                required
                value={form[key]}
                onChange={field(key)}
              />
              {errors[key] && (
                <p className="text-xs text-red-600">{errors[key]}</p>
              )}
            </div>
          ))}

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
