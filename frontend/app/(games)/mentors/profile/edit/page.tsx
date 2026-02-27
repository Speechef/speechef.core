'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface MentorProfileData {
  bio: string;
  credentials: string;
  specialties: string[];
  languages: string[];
  hourly_rate: string;
  timezone: string;
  offers_intro_call: boolean;
  intro_video_key: string | null;
}

const SPECIALTY_OPTIONS = [
  'IELTS', 'TOEFL', 'Business English', 'Public Speaking',
  'Accent Reduction', 'Interview Prep',
];
const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Mandarin', 'Arabic', 'Spanish', 'French',
];

function MultiCheckbox({
  label, options, selected, onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold mb-2" style={{ color: '#141c52' }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="text-xs px-3 py-1.5 rounded-full font-medium border transition-colors"
              style={
                active
                  ? { background: '#141c52', color: 'white', borderColor: '#141c52' }
                  : { background: 'white', color: '#374151', borderColor: '#d1d5db' }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MentorProfileEditPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError } = useQuery<MentorProfileData>({
    queryKey: ['mentor-profile-edit'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/mentors/profile/').then((r) => r.data),
    retry: false,
  });

  const [form, setForm] = useState<MentorProfileData | null>(null);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
    if (isError) router.replace('/mentors/dashboard');
  }, [isLoggedIn, isError, router]);

  const update = useMutation({
    mutationFn: (payload: Partial<MentorProfileData>) =>
      api.patch('/mentors/profile/', payload).then((r) => r.data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      qc.invalidateQueries({ queryKey: ['mentor-profile-edit'] });
      qc.invalidateQueries({ queryKey: ['mentor-dashboard'] });
    },
  });

  if (!isLoggedIn || isError) return null;

  if (isLoading || !form) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-xl mx-auto animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-2xl" />
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      </div>
    );
  }

  function field(key: Exclude<keyof MentorProfileData, 'specialties' | 'languages' | 'offers_intro_call' | 'intro_video_key'>) {
    return {
      value: form![key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => f ? { ...f, [key]: e.target.value } : f),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form) update.mutate(form);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>Edit Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Update your mentor profile information.</p>
          </div>
          <Link
            href="/mentors/dashboard"
            className="text-sm font-semibold hover:underline"
            style={{ color: '#141c52' }}
          >
            ← Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: '#141c52' }}>
              Bio
            </label>
            <textarea
              {...field('bio')}
              rows={4}
              placeholder="Tell students about yourself, your teaching approach and experience…"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Credentials */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: '#141c52' }}>
              Credentials
            </label>
            <textarea
              {...field('credentials')}
              rows={3}
              placeholder="Certifications, degrees, years of experience…"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Specialties + Languages */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
            <MultiCheckbox
              label="Specialties"
              options={SPECIALTY_OPTIONS}
              selected={form.specialties}
              onChange={(v) => setForm((f) => f ? { ...f, specialties: v } : f)}
            />
            <MultiCheckbox
              label="Languages"
              options={LANGUAGE_OPTIONS}
              selected={form.languages}
              onChange={(v) => setForm((f) => f ? { ...f, languages: v } : f)}
            />
          </div>

          {/* Rate + Timezone */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#141c52' }}>
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field('hourly_rate')}
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#141c52' }}>
                Timezone
              </label>
              <input
                type="text"
                {...field('timezone')}
                placeholder="e.g. Asia/Kolkata"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Intro video key */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-semibold mb-1" style={{ color: '#141c52' }}>
              Intro Video Key
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Cloudflare R2 key of your intro video (e.g. <span className="font-mono">videos/intro-abc.mp4</span>). Leave blank if you have no intro video.
            </p>
            <input
              type="text"
              value={form.intro_video_key ?? ''}
              onChange={(e) => setForm((f) => f ? { ...f, intro_video_key: e.target.value || null } : f)}
              placeholder="videos/your-intro.mp4"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Intro call toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#141c52' }}>Offer Free Intro Call</p>
              <p className="text-xs text-gray-400 mt-0.5">15-minute intro call for new students (free)</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => f ? { ...f, offers_intro_call: !f.offers_intro_call } : f)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: form.offers_intro_call ? '#141c52' : '#d1d5db' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: form.offers_intro_call ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
              />
            </button>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={update.isPending}
              className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              {update.isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
            </button>
            <Link
              href="/mentors/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Link>
          </div>

          {update.isError && (
            <p className="text-sm text-red-600 text-center">
              Failed to save changes. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
