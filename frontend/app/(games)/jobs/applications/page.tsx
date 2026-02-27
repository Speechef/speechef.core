'use client';
import { Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

interface Application {
  id: number;
  job_title: string;
  company: string;
  status: 'applied' | 'viewed' | 'shortlisted' | 'rejected';
  applied_at: string;
  speechef_score_at_apply: number | null;
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

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'viewed', label: 'Viewed' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'rejected', label: 'Rejected' },
];

function MyApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get('status') ?? '';
  function setFilterStatus(val: string) {
    const url = val ? `/jobs/applications?status=${val}` : '/jobs/applications';
    router.push(url);
  }

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/jobs/my-applications/').then((r) => r.data),
  });

  const displayed = filterStatus
    ? applications.filter((a) => a.status === filterStatus)
    : applications;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Browse Jobs</Link>
          <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#fe9940' }}>My Profile</p>
          <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Track the status of your job applications.</p>
        </div>

        {/* Status filter tabs */}
        {!isLoading && applications.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((tab) => {
              const count = tab.key
                ? applications.filter((a) => a.status === tab.key).length
                : applications.length;
              const isActive = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border"
                  style={
                    isActive
                      ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                  }
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20' : 'bg-white text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="font-semibold text-lg mb-1" style={{ color: '#141c52' }}>
              No applications yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Browse open roles and apply with your Speechef score.
            </p>
            <Link
              href="/jobs"
              className="inline-block px-6 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              Browse Jobs →
            </Link>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold">No {STATUS_LABELS[filterStatus]} applications</p>
            <button onClick={() => setFilterStatus('')}
              className="mt-3 text-sm font-semibold underline"
              style={{ color: '#141c52' }}>
              View all applications
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((app) => (
              <Link
                key={app.id}
                href={`/jobs/applications/${app.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: '#141c52' }}>
                    {app.job_title}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{app.company}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {app.speechef_score_at_apply !== null && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Score</p>
                      <p className="text-sm font-bold" style={{ color: '#141c52' }}>
                        {app.speechef_score_at_apply}
                      </p>
                    </div>
                  )}

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>

                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(app.applied_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}

            <p className="text-center text-xs text-gray-400 pt-2">
              {displayed.length}{filterStatus ? ` ${STATUS_LABELS[filterStatus].toLowerCase()}` : ''} application{displayed.length !== 1 ? 's' : ''}{filterStatus ? ` · ${applications.length} total` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyApplicationsPage() {
  return (
    <Suspense>
      <MyApplicationsContent />
    </Suspense>
  );
}
