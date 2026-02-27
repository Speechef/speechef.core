'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  applied:     { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  viewed:      { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
  shortlisted: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  rejected:    { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
};

interface Application {
  id: number;
  job_title: string;
  company: string;
  status: 'applied' | 'viewed' | 'shortlisted' | 'rejected';
  applied_at: string;
  speechef_score_at_apply: number | null;
  cover_note: string;
}

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-100 text-blue-700',
  viewed:      'bg-purple-100 text-purple-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  applied:     'Applied',
  viewed:      'Viewed',
  shortlisted: 'Shortlisted',
  rejected:    'Rejected',
};

const STATUS_ICONS: Record<string, string> = {
  applied:     '📬',
  viewed:      '👁',
  shortlisted: '⭐',
  rejected:    '✕',
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const appId = Number(id);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/jobs/my-applications/').then((r) => r.data),
  });

  const app = applications.find((a) => a.id === appId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center pt-16">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-semibold text-lg mb-1" style={{ color: '#141c52' }}>Application not found</p>
          <p className="text-gray-400 text-sm mb-6">This application may have been removed.</p>
          <Link
            href="/jobs/applications"
            className="inline-block px-6 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            ← My Applications
          </Link>
        </div>
      </div>
    );
  }

  const appliedDate = new Date(app.applied_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const sc = STATUS_COLORS[app.status] ?? STATUS_COLORS.applied;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link
          href="/jobs/applications"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6"
        >
          ← My Applications
        </Link>

        {/* Header card — status-colored band */}
        <div className="rounded-2xl border overflow-hidden mb-4" style={{ borderColor: sc.border }}>
          <div className="relative overflow-hidden px-6 py-5" style={{ background: sc.bg }}>
            <div className="absolute top-[-16px] right-[-16px] w-20 h-20 rounded-full"
              style={{ background: sc.text, opacity: 0.1 }} />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: sc.text }}>{app.company}</p>
                <h1 className="text-2xl font-bold truncate" style={{ color: BRAND.primary }}>{app.job_title}</h1>
              </div>
              <span
                className={`text-sm font-semibold px-3 py-1.5 rounded-full shrink-0 ${
                  STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-500'
                }`}
              >
                {STATUS_ICONS[app.status]} {STATUS_LABELS[app.status] ?? app.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Applied on</p>
            <p className="text-sm font-semibold" style={{ color: '#141c52' }}>{appliedDate}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Speechef score at apply</p>
            {app.speechef_score_at_apply !== null ? (
              <p className="text-2xl font-extrabold" style={{ color: '#141c52' }}>
                {app.speechef_score_at_apply}
                <span className="text-sm font-normal text-gray-400"> / 100</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">Not recorded</p>
            )}
          </div>
        </div>

        {/* Status timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: sc.bg, color: sc.text }}>📬</span>
            <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: BRAND.primary }}>Application Status</h2>
          </div>
          <div className="space-y-3">
            {(['applied', 'shortlisted'] as const).map((step) => {
              const reached =
                step === 'applied' ||
                (step === 'shortlisted' && app.status === 'shortlisted');
              const isCurrent = app.status === step;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={
                      reached
                        ? { background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }
                        : { backgroundColor: '#e5e7eb', color: '#9ca3af' }
                    }
                  >
                    {reached ? '✓' : '·'}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isCurrent ? '' : 'text-gray-400'}`}
                      style={isCurrent ? { color: '#141c52' } : {}}>
                      {STATUS_LABELS[step]}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-400">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
            {app.status === 'rejected' && (
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                >
                  {STATUS_ICONS[app.status]}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>
                    {STATUS_LABELS[app.status]}
                  </p>
                  <p className="text-xs text-gray-400">Final status</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cover note */}
        {app.cover_note && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Your Cover Note</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{app.cover_note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Link
            href="/jobs"
            className="flex-1 text-center py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Browse More Jobs →
          </Link>
        </div>
      </div>
    </div>
  );
}
