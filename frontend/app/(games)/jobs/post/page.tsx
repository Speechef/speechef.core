'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };
const PAGE_COLOR = { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };

interface JobForm {
  title: string;
  company: string;
  description: string;
  location: string;
  remote: boolean;
  employment_type: string;
  job_rate: string;
  min_speechef_score: string;
  application_url: string;
  url: string;
}

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: '#141c52' }}>{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white';

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobForm>({
    title: '',
    company: '',
    description: '',
    location: '',
    remote: false,
    employment_type: 'full_time',
    job_rate: '',
    min_speechef_score: '',
    application_url: '',
    url: '',
  });

  const set = (field: keyof JobForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const postMutation = useMutation({
    mutationFn: () =>
      api.post('/jobs/create/', {
        title: form.title,
        company: form.company,
        description: form.description,
        location: form.remote ? '' : form.location,
        remote: form.remote,
        employment_type: form.employment_type,
        job_rate: form.job_rate ? parseInt(form.job_rate, 10) : null,
        min_speechef_score: form.min_speechef_score ? parseInt(form.min_speechef_score, 10) : null,
        application_url: form.application_url || null,
        url: form.url || '',
      }).then((r) => r.data),
    onSuccess: (data) => {
      if (data?.job_id) {
        router.push(`/jobs/${data.job_id}`);
      } else {
        router.push('/jobs');
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    postMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header — colored band */}
        <div className="rounded-2xl border overflow-hidden mb-8" style={{ borderColor: PAGE_COLOR.border }}>
          <div className="relative overflow-hidden px-7 py-6" style={{ background: PAGE_COLOR.bg }}>
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
              style={{ background: PAGE_COLOR.text, opacity: 0.1 }} />
            <div className="relative">
              <Link href="/jobs" className="text-xs font-medium mb-3 block hover:underline"
                style={{ color: PAGE_COLOR.text, opacity: 0.8 }}>← Back to Jobs</Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">💼</span>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: BRAND.primary }}>Post a Job</h1>
                  <p className="text-sm mt-0.5" style={{ color: PAGE_COLOR.text }}>
                    Reach candidates with verified Speechef communication scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">

          {/* Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: PAGE_COLOR.bg, color: PAGE_COLOR.text }}>📋</span>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>Job Details</p>
            </div>
            <div className="space-y-4">
              <Field label="Job Title *">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Customer Success Manager"
                  required
                />
              </Field>

              <Field label="Company Name *">
                <input
                  className={inputClass}
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </Field>

              <Field label="Description *" hint="Describe the role, responsibilities, and requirements.">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Role overview, key responsibilities, must-haves..."
                  required
                />
              </Field>
            </div>
          </div>

          {/* Location & Type */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#d1fae5', color: '#065f46' }}>📍</span>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>Location & Type</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => set('remote', !form.remote)}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                      form.remote ? 'justify-end' : 'justify-start'
                    }`}
                    style={{ backgroundColor: form.remote ? '#141c52' : '#e5e7eb' }}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Remote position</span>
                </label>
              </div>

              {!form.remote && (
                <Field label="Location">
                  <input
                    className={inputClass}
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. New York, NY"
                  />
                </Field>
              )}

              <Field label="Employment Type">
                <select
                  className={inputClass}
                  value={form.employment_type}
                  onChange={(e) => set('employment_type', e.target.value)}
                >
                  {EMPLOYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Compensation & Requirements */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef3c7', color: '#78350f' }}>💰</span>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>Compensation & Requirements</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Annual Salary (USD)" hint="Optional">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={form.job_rate}
                  onChange={(e) => set('job_rate', e.target.value)}
                  placeholder="e.g. 85000"
                />
              </Field>
              <Field label="Min. Speechef Score" hint="0–100, optional">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  value={form.min_speechef_score}
                  onChange={(e) => set('min_speechef_score', e.target.value)}
                  placeholder="e.g. 75"
                />
              </Field>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#ede9fe', color: '#6d28d9' }}>🔗</span>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>Links</p>
            </div>
            <div className="space-y-4">
              <Field label="Application URL" hint="Where should candidates apply?">
                <input
                  className={inputClass}
                  type="url"
                  value={form.application_url}
                  onChange={(e) => set('application_url', e.target.value)}
                  placeholder="https://yourcompany.com/careers/..."
                />
              </Field>
              <Field label="Job Listing URL" hint="Link to the original posting (optional)">
                <input
                  className={inputClass}
                  type="url"
                  value={form.url}
                  onChange={(e) => set('url', e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </div>

          {/* Score requirement callout */}
          {form.min_speechef_score && (
            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#f0f4ff', color: BRAND.primary }}>
              <p className="font-semibold">Score requirement set: ≥ {form.min_speechef_score}</p>
              <p className="text-xs mt-0.5 text-gray-500">
                Candidates with a Speechef score of {form.min_speechef_score}+ will see a green match badge on your listing.
              </p>
            </div>
          )}

          {/* Error */}
          {postMutation.isError && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              Failed to post job. Please check the form and try again.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={postMutation.isPending || !form.title || !form.company || !form.description}
            className="w-full py-3 rounded-full text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            {postMutation.isPending ? 'Posting…' : 'Post Job →'}
          </button>
        </form>

        {/* Employer value prop */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { emoji: '✅', label: 'Verified candidates', sub: 'With real speech scores' },
            { emoji: '🆓', label: 'Free to post', sub: 'No listing fees' },
            { emoji: '🎯', label: 'Score-matched', sub: 'Right fit, faster' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl mb-1">{item.emoji}</p>
              <p className="text-xs font-bold" style={{ color: '#141c52' }}>{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
