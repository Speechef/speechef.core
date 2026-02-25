'use client';

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
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export default function MyApplicationsPage() {
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/jobs/my-applications/').then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>My Applications</h1>
            <p className="text-gray-500 mt-1">Track the status of your job applications.</p>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-medium hover:underline"
            style={{ color: '#141c52' }}
          >
            ← Browse Jobs
          </Link>
        </div>

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
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4"
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
              </div>
            ))}

            <p className="text-center text-xs text-gray-400 pt-2">
              {applications.length} application{applications.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
