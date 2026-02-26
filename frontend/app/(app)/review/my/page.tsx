'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface Review {
  id: number;
  review_type: string;
  status: 'submitted' | 'assigned' | 'in_review' | 'delivered';
  submitted_at: string;
  deadline_at: string | null;
  delivered_at: string | null;
  feedback_rating: number | null;
  expert: { name: string } | null;
}

const REVIEW_TYPE_LABELS: Record<string, string> = {
  general: 'General Feedback',
  ielts_speaking: 'IELTS Speaking',
  job_interview: 'Job Interview',
  toefl: 'TOEFL Speaking',
  business: 'Business English',
  presentation: 'Presentation',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Submitted', color: '#92400e', bg: '#fef3c7' },
  assigned: { label: 'Assigned', color: '#1e40af', bg: '#dbeafe' },
  in_review: { label: 'In Review', color: '#5b21b6', bg: '#ede9fe' },
  delivered: { label: 'Delivered', color: '#166534', bg: '#dcfce7' },
};

const STATUS_TABS = [
  { value: '',           label: 'All' },
  { value: 'submitted',  label: 'Submitted' },
  { value: 'assigned',   label: 'Assigned' },
  { value: 'in_review',  label: 'In Review' },
  { value: 'delivered',  label: 'Delivered' },
];

export default function MyReviewsPage() {
  const [filterStatus, setFilterStatus] = useState('');

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['my-reviews'],
    queryFn: () => api.get('/review/my/').then((r) => r.data),
  });

  const displayed = filterStatus
    ? reviews.filter((r) => r.status === filterStatus)
    : reviews;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>My Expert Reviews</h1>
            <p className="text-gray-500 text-sm mt-1">Track your submitted reviews and access delivered feedback.</p>
          </div>
          <Link href="/review"
            className="text-sm font-bold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            + New Review
          </Link>
        </div>

        {/* Status filter tabs */}
        {!isLoading && reviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((t) => {
              const count = t.value
                ? reviews.filter((r) => r.status === t.value).length
                : reviews.length;
              return (
                <button
                  key={t.value}
                  onClick={() => setFilterStatus(t.value)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                  style={filterStatus === t.value
                    ? { backgroundColor: '#141c52', color: '#fff' }
                    : { backgroundColor: '#e5e7eb', color: '#374151' }}
                >
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    filterStatus === t.value ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🎙️</p>
            <p className="font-semibold">No reviews yet</p>
            <p className="text-sm mt-1">Submit a recording for expert feedback — delivered within 48 hours.</p>
            <Link href="/review"
              className="inline-block mt-5 text-sm font-bold px-6 py-2.5 rounded-full"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Submit for Expert Review →
            </Link>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-gray-600">No {STATUS_TABS.find((t) => t.value === filterStatus)?.label.toLowerCase()} reviews</p>
            <p className="text-sm mt-1">Nothing matches this filter.</p>
            <button
              onClick={() => setFilterStatus('')}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
            >
              View all reviews
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((r) => {
              const cfg = STATUS_CONFIG[r.status];
              return (
                <Link key={r.id} href={`/review/${r.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-base" style={{ color: '#141c52' }}>
                        {REVIEW_TYPE_LABELS[r.review_type] ?? r.review_type}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {r.expert && ` · ${r.expert.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.status === 'delivered' && r.feedback_rating && (
                        <span className="text-xs text-amber-500">★ {r.feedback_rating}/5</span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {r.status !== 'delivered' && r.deadline_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Due by {new Date(r.deadline_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
