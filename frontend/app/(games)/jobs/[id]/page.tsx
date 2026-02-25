'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface JobDetail {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  remote: boolean;
  employment_type: string;
  job_rate: number | null;
  min_speechef_score: number | null;
  required_languages: string[];
  is_featured: boolean;
  date: string;
  url: string;
  application_url: string | null;
  application_count: number;
}

interface JobSummary {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  employment_type: string;
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  freelance: 'Freelance',
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [coverNote, setCoverNote] = useState('');
  const [applied, setApplied] = useState(false);

  const { data: job, isLoading } = useQuery<JobDetail>({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}/`).then((r) => r.data),
  });

  const { data: allJobs = [] } = useQuery<JobSummary[]>({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs/').then((r) => r.data),
  });

  const { data: latestScore } = useQuery<number | null>({
    queryKey: ['latest-score'],
    enabled: isLoggedIn,
    queryFn: async () => {
      try {
        const { data } = await api.get('/analysis/sessions/');
        const done = data.find((s: { status: string }) => s.status === 'done');
        if (!done) return null;
        const { data: result } = await api.get(`/analysis/${done.id}/results/`);
        return result.overall_score ?? null;
      } catch { return null; }
    },
  });

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${id}/apply/`, {
      cover_note: coverNote,
      speechef_score: latestScore,
    }),
    onSuccess: () => setApplied(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Job not found.</p>
        <Link href="/jobs" className="text-sm font-semibold" style={{ color: '#141c52' }}>← Back to Jobs</Link>
      </div>
    );
  }

  const qualifies = latestScore !== null && job.min_speechef_score !== null
    ? latestScore >= job.min_speechef_score
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 inline-block">
          ← Back to Jobs
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-xl flex-shrink-0"
              style={{ backgroundColor: '#141c52' }}
            >
              {job.company?.[0] ?? '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>{job.title}</h1>
              <p className="text-gray-500 mt-0.5">{job.company}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-400">
                <span>{job.remote ? '🌍 Remote' : `📍 ${job.location}`}</span>
                {job.employment_type && <span>· {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}</span>}
                {job.job_rate && <span>· ${job.job_rate.toLocaleString()}/yr</span>}
              </div>
            </div>
            {job.is_featured && (
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Featured
              </span>
            )}
          </div>

          {/* Score requirement */}
          {job.min_speechef_score && (
            <div
              className="rounded-xl p-4 mb-6"
              style={{
                backgroundColor: qualifies === true ? '#f0fdf4' : qualifies === false ? '#fffbeb' : '#f9fafb',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: qualifies === true ? '#86efac' : qualifies === false ? '#fcd34d' : '#e5e7eb',
              }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: '#141c52' }}>
                Communication Score Required: {job.min_speechef_score}/100
              </p>
              {isLoggedIn && latestScore !== null ? (
                <p className="text-sm">
                  {qualifies
                    ? `✅ Your score (${latestScore}) meets the requirement.`
                    : `⚠️ Your score (${latestScore}) is ${job.min_speechef_score - latestScore} points below the requirement.`}
                  {!qualifies && (
                    <> <Link href="/practice" className="font-semibold underline ml-1">Practice to improve →</Link></>
                  )}
                </p>
              ) : !isLoggedIn ? (
                <p className="text-sm text-gray-500">
                  <Link href="/login" className="font-semibold underline">Log in</Link> to check if your score qualifies.
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  No score yet. <Link href="/analyze" className="font-semibold underline">Analyze a speech</Link> to get your score.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-3">Job Description</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
          </div>

          {/* Required languages */}
          {job.required_languages?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-2">Required Languages</h2>
              <div className="flex flex-wrap gap-2">
                {job.required_languages.map((lang) => (
                  <span key={lang} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* Apply section */}
          <div className="border-t border-gray-100 pt-6">
            {applied ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-bold text-lg" style={{ color: '#141c52' }}>Application submitted!</p>
                <p className="text-sm text-gray-500 mt-1">The employer will review your Speechef profile and score.</p>
                <Link href="/jobs" className="inline-block mt-4 text-sm font-semibold underline" style={{ color: '#141c52' }}>
                  Browse more jobs
                </Link>
              </div>
            ) : job.application_url ? (
              <div>
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  Apply on Company Site →
                </a>
              </div>
            ) : isLoggedIn ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-600">Cover Note (optional)</label>
                    <span className={`text-xs ${coverNote.length > 450 ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                      {coverNote.length} / 500
                    </span>
                  </div>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Briefly introduce yourself and why you're a great fit..."
                    className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#FADB43' } as React.CSSProperties}
                  />
                </div>
                {latestScore !== null && (
                  <p className="text-xs text-gray-400">
                    Your current Speechef score ({latestScore}/100) will be attached to your application.
                  </p>
                )}
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="w-full py-3 rounded-xl font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  {applyMutation.isPending ? 'Submitting…' : 'Apply with Speechef Profile →'}
                </button>
                {applyMutation.isError && (
                  <p className="text-sm text-red-500 text-center">
                    {(applyMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Something went wrong. Try again.'}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  Log in to Apply →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* More Jobs */}
        {(() => {
          const more = allJobs.filter((j) => String(j.id) !== id).slice(0, 3);
          if (more.length === 0) return null;
          return (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-3">More Jobs</h2>
              <div className="space-y-3">
                {more.map((j) => (
                  <Link key={j.id} href={`/jobs/${j.id}`}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:shadow-sm transition-shadow">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ backgroundColor: '#141c52' }}>
                      {j.company?.[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#141c52' }}>{j.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {j.company} · {j.remote ? 'Remote' : j.location}
                        {j.employment_type ? ` · ${EMPLOYMENT_LABELS[j.employment_type] ?? j.employment_type}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
