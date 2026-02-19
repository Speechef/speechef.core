'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { data: user, isLoading, refetch } = useProfile();
  const [form, setForm] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, email: user.email });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/auth/profile/', form);
      setMessage('Profile updated.');
      refetch();
    } catch {
      setMessage('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#141c52' }}>
          Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm px-3 py-2 rounded-lg ${
                message.includes('Failed')
                  ? 'text-red-600 bg-red-50'
                  : 'text-green-700 bg-green-50'
              }`}
            >
              {message}
            </p>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="w-full rounded-full font-medium text-[#141c52]"
            style={{ backgroundColor: '#FADB43' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
