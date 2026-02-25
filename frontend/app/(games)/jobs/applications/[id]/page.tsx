'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface Application {
  id: number;
  job_title: string;
  company: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'withdrawn';
  applied_at: string;
  speechef_score_at_apply: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-100 text-blue-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-600',
  withdrawn:   'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  applied:     'Applied',
  shortlisted: 'Shortlisted',
  rejected:    'Rejected',
  withdrawn:   'Withdrawn',
};

const STATUS_ICONS: Record<string, string> = {
  applied:     '📬',
  shortlisted: '⭐',
  rejected:    '✕',
  withdrawn:   '↩',
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

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{app.company}</p>
              <h1 className="text-2xl font-bold truncate" style={{ color: '#141c52' }}>{app.job_title}</h1>
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
          <h2 className="text-sm font-bold mb-4" style={{ color: '#141c52' }}>Application Status</h2>
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
            {(app.status === 'rejected' || app.status === 'withdrawn') && (
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: app.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                    color: app.status === 'rejected' ? '#991b1b' : '#6b7280',
                  }}
                >
                  {STATUS_ICONS[app.status]}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={app.status === 'rejected' ? { color: '#991b1b' } : { color: '#6b7280' }}>
                    {STATUS_LABELS[app.status]}
                  </p>
                  <p className="text-xs text-gray-400">Final status</p>
                </div>
              </div>
            )}
          </div>
        </div>

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
