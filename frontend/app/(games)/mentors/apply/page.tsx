'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ApplicationStatus {
  has_applied: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const SPECIALTY_OPTIONS = [
  'Job Interviews', 'Pronunciation', 'Business English', 'Accent Reduction',
  'IELTS Speaking', 'TOEFL', 'Public Speaking', 'Debate', 'Presentation Skills',
  'Fluency', 'Vocabulary Building', 'Conversational English', 'Academic Writing',
  'Storytelling', 'Grammar', 'Leadership Communication',
];

const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Punjabi', 'Gujarati', 'Bengali', 'Tamil',
  'Mandarin', 'Arabic', 'Spanish', 'French', 'German', 'Japanese',
];

const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .form-reveal { animation: fadeSlideUp .6s ease both; }
  .form-reveal-2 { animation: fadeSlideUp .6s .1s ease both; }
  .form-reveal-3 { animation: fadeSlideUp .6s .2s ease both; }
`;

// ─── Status display ────────────────────────────────────────────────────────────

function ApplicationStatusCard({ data }: { data: ApplicationStatus }) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      label: 'Under Review',
      description: "We've received your application and our team is reviewing it. We'll email you once a decision has been made.",
      bgColor: '#fef9ee',
      borderColor: '#fde68a',
      textColor: '#78350f',
      badgeBg: '#fef3c7',
    },
    approved: {
      icon: '🎉',
      label: 'Approved!',
      description: 'Congratulations! Your application has been approved. Your mentor profile is now live on Speechef.',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      textColor: '#065f46',
      badgeBg: '#dcfce7',
    },
    rejected: {
      icon: '❌',
      label: 'Not Approved',
      description: "Unfortunately we couldn't approve your application at this time.",
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      badgeBg: '#fee2e2',
    },
  };

  const s = statusConfig[data.status ?? 'pending'];

  return (
    <div
      className="rounded-3xl p-8 border-2"
      style={{ background: s.bgColor, borderColor: s.borderColor }}
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{s.icon}</span>
        <div>
          <span
            className="text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: s.badgeBg, color: s.textColor }}
          >
            {s.label}
          </span>
          <p className="text-sm font-semibold mt-1.5" style={{ color: s.textColor }}>
            Application #{data.status}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: s.textColor }}>
        {s.description}
      </p>
      {data.reviewer_notes && (
        <div className="p-4 rounded-2xl mt-3" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: s.textColor }}>Reviewer Notes</p>
          <p className="text-sm" style={{ color: s.textColor }}>{data.reviewer_notes}</p>
        </div>
      )}
      {data.created_at && (
        <p className="text-xs mt-4 opacity-60" style={{ color: s.textColor }}>
          Submitted: {new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
      {data.status === 'approved' && (
        <Link
          href="/mentors"
          className="mt-5 inline-block px-6 py-3 rounded-2xl text-sm font-extrabold transition-all hover:opacity-90"
          style={{ background: BRAND.gradient, color: BRAND.primary }}
        >
          View Your Profile →
        </Link>
      )}
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────────

export default function MentorApplyPage() {
  const { isLoggedIn } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    credentials: '',
    specialties: [] as string[],
    languages: [] as string[],
    hourly_rate: '',
    experience_years: '',
    why_mentor: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: statusData, isLoading: statusLoading } = useQuery<ApplicationStatus>({
    queryKey: ['mentor-apply-status'],
    queryFn: () => api.get('/mentors/apply/status/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  const submitMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/mentors/apply/', {
        ...data,
        hourly_rate: parseFloat(data.hourly_rate),
        experience_years: parseInt(data.experience_years, 10),
      }).then((r) => r.data),
    onSuccess: () => setSubmitted(true),
  });

  function toggleChip(field: 'specialties' | 'languages', value: string) {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  const hasApplied = statusData?.has_applied;

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Page header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#141c52 0%,#1e2d78 100%)' }}
      >
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'white' }} />
        <div className="max-w-3xl mx-auto px-6 py-14 relative z-10">
          <Link href="/mentors" className="inline-flex items-center gap-2 text-xs font-semibold mb-6 transition-opacity hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            ← Back to Mentors
          </Link>
          <div className="form-reveal">
            <span
              className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-4"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Become a Mentor
            </span>
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Share Your Expertise.<br />
              <span style={{
                backgroundImage: BRAND.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Inspire Others.
              </span>
            </h1>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Apply to join our community of certified English coaches. All applications are manually reviewed and usually processed within 2–3 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Not logged in */}
        {!isLoggedIn && (
          <div className="form-reveal rounded-3xl p-10 bg-white border border-gray-100 shadow-sm text-center">
            <p className="text-4xl mb-4">🔒</p>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: BRAND.primary }}>Sign in to apply</h2>
            <p className="text-sm text-gray-500 mb-6">You need to be logged in to submit a mentor application.</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 rounded-2xl text-sm font-extrabold transition-all hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Already applied */}
        {isLoggedIn && !statusLoading && hasApplied && (
          <div className="form-reveal">
            <ApplicationStatusCard data={statusData!} />
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div className="form-reveal rounded-3xl p-10 bg-white border border-gray-100 shadow-sm text-center">
            <p className="text-5xl mb-4">🚀</p>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: BRAND.primary }}>Application Submitted!</h2>
            <p className="text-sm text-gray-500 mb-2">
              Thank you for applying. Our team will review your application and get back to you within 2–3 business days.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              You&apos;ll receive an email at <strong>{form.email}</strong> once a decision has been made.
            </p>
            <Link
              href="/mentors"
              className="inline-block px-8 py-3 rounded-2xl text-sm font-extrabold transition-all hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Browse Mentors
            </Link>
          </div>
        )}

        {/* Application form */}
        {isLoggedIn && !statusLoading && !hasApplied && !submitted && (
          <form
            onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(form); }}
            className="space-y-8"
          >
            {/* Basic info */}
            <div className="form-reveal rounded-3xl p-8 bg-white border border-gray-100 shadow-sm">
              <h2 className="text-lg font-extrabold mb-1" style={{ color: BRAND.primary }}>Personal Information</h2>
              <p className="text-xs text-gray-400 mb-6">Tell us about yourself</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Hourly Rate (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={5}
                      max={500}
                      value={form.hourly_rate}
                      onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                      placeholder="35"
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Years of Experience *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={50}
                    value={form.experience_years}
                    onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                    placeholder="3"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Bio + credentials */}
            <div className="form-reveal-2 rounded-3xl p-8 bg-white border border-gray-100 shadow-sm">
              <h2 className="text-lg font-extrabold mb-1" style={{ color: BRAND.primary }}>Background & Credentials</h2>
              <p className="text-xs text-gray-400 mb-6">Help us understand your expertise</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Professional Bio *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell students about your teaching approach, background, and what makes your sessions unique..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Credentials & Certifications *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.credentials}
                    onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                    placeholder="e.g. TESOL Certified · M.A. Applied Linguistics · IELTS 8.5 · 5 years at British Council"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Why do you want to be a Speechef Mentor? *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.why_mentor}
                    onChange={(e) => setForm({ ...form, why_mentor: e.target.value })}
                    placeholder="Tell us your motivation for joining as a mentor and how you plan to help students..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 bg-gray-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="form-reveal-3 rounded-3xl p-8 bg-white border border-gray-100 shadow-sm">
              <h2 className="text-lg font-extrabold mb-1" style={{ color: BRAND.primary }}>Specialties & Languages</h2>
              <p className="text-xs text-gray-400 mb-6">Select at least one specialty and one language</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                    Specialties * <span className="normal-case font-normal text-gray-400">({form.specialties.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((s) => {
                      const active = form.specialties.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleChip('specialties', s)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all"
                          style={active
                            ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                            : { background: '#f8f9ff', color: '#374151', borderColor: '#e5e7eb' }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                    Languages You Teach In * <span className="normal-case font-normal text-gray-400">({form.languages.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((l) => {
                      const active = form.languages.includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => toggleChip('languages', l)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all"
                          style={active
                            ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                            : { background: '#f8f9ff', color: '#374151', borderColor: '#e5e7eb' }}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {submitMutation.isError && (
              <div className="rounded-2xl p-4 bg-red-50 border border-red-100 text-sm text-red-700">
                {(submitMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                  'Something went wrong. Please try again.'}
              </div>
            )}

            {/* Validation hint */}
            {form.specialties.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                Please select at least one specialty.
              </p>
            )}
            {form.languages.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                Please select at least one language.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                submitMutation.isPending ||
                form.specialties.length === 0 ||
                form.languages.length === 0
              }
              className="w-full py-4 rounded-2xl text-sm font-extrabold tracking-wide transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{ background: BRAND.gradient, color: BRAND.primary, boxShadow: '0 6px 24px rgba(250,219,67,.3)' }}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Application →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By submitting, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
              Applications are reviewed within 2–3 business days.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
