'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface MentorSession {
  id: number;
  mentor: { id: number; name: string };
  scheduled_at: string;
  duration_minutes: number;
  price: string;
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  meeting_url: string | null;
  homework: string | null;
  student_rating: number | null;
  student_review: string | null;
  mentor_reply: string | null;
  mentor_replied_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  refund_amount: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: '#92400e', bg: '#fef3c7' },
  confirmed: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe' },
  completed: { label: 'Completed', color: '#166534', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' },
  no_show: { label: 'No Show', color: '#6b7280', bg: '#f3f4f6' },
};

function RatingModal({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const qc = useQueryClient();

  const rateMutation = useMutation({
    mutationFn: () => api.post(`/mentors/sessions/${sessionId}/rate/`, { rating, review }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-sessions'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-lg mb-4" style={{ color: '#141c52' }}>Rate This Session</h2>
        <div className="flex gap-2 mb-4 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} onClick={() => setRating(i + 1)}>
              <svg className={`w-8 h-8 ${i < rating ? 'text-amber-400' : 'text-gray-200'} transition-colors`}
                fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <textarea value={review} onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience (optional)…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none mb-4 focus:outline-none focus:border-indigo-400" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
          <button onClick={() => rateMutation.mutate()} disabled={rating === 0 || rateMutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            {rateMutation.isPending ? 'Saving…' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ session, onClose }: { session: MentorSession; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const qc = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/mentors/sessions/${session.id}/cancel/`, { reason }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-sessions'] });
      onClose();
    },
  });

  const sessionDate = new Date(session.scheduled_at);
  const hoursUntil = (sessionDate.getTime() - Date.now()) / 3600000;
  const refundPct = hoursUntil >= 24 ? 100 : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-lg mb-2" style={{ color: '#141c52' }}>Cancel Session</h2>
        <p className="text-sm text-gray-500 mb-4">
          Session with <strong>{session.mentor.name}</strong> on{' '}
          {sessionDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}.
        </p>
        <div className="bg-amber-50 rounded-xl p-3 mb-4 text-sm text-amber-700">
          Refund policy: you&apos;ll receive a <strong>{refundPct}% refund</strong>
          {hoursUntil < 24 ? ' (less than 24h before session)' : ''}.
        </div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none mb-4 focus:outline-none focus:border-red-300" />
        {cancelMutation.isError && (
          <p className="text-xs text-red-500 mb-3">Something went wrong. Please try again.</p>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
            Keep Session
          </button>
          <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: '#fee2e2', color: '#991b1b' }}>
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

const SESSION_TABS = [
  { id: 'all',      label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past',     label: 'Past' },
];

export default function MySessionsPage() {
  const [ratingSession, setRatingSession] = useState<number | null>(null);
  const [cancelSession, setCancelSession] = useState<MentorSession | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data: sessions = [], isLoading } = useQuery<MentorSession[]>({
    queryKey: ['mentor-sessions'],
    queryFn: () => api.get('/mentors/sessions/my/').then((r) => r.data),
  });

  const upcoming = sessions.filter((s) => ['pending_payment', 'confirmed'].includes(s.status));
  const past = sessions.filter((s) => ['completed', 'cancelled', 'no_show'].includes(s.status));

  const showUpcoming = activeTab === 'all' || activeTab === 'upcoming';
  const showPast = activeTab === 'all' || activeTab === 'past';

  return (
    <>
      {ratingSession !== null && (
        <RatingModal sessionId={ratingSession} onClose={() => setRatingSession(null)} />
      )}
      {cancelSession !== null && (
        <CancelModal session={cancelSession} onClose={() => setCancelSession(null)} />
      )}

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>My Sessions</h1>
              <p className="text-gray-500 text-sm mt-1">Track your upcoming and past mentor sessions.</p>
            </div>
            <Link href="/mentors"
              className="text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors hover:bg-indigo-50"
              style={{ borderColor: '#141c52', color: '#141c52' }}>
              Find Mentors →
            </Link>
          </div>

          {/* Tab filter */}
          {!isLoading && sessions.length > 0 && (
            <div className="flex gap-2 mb-7">
              {SESSION_TABS.map((t) => {
                const count = t.id === 'all' ? sessions.length : t.id === 'upcoming' ? upcoming.length : past.length;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={activeTab === t.id
                      ? { backgroundColor: '#141c52', color: '#fff' }
                      : { backgroundColor: '#e5e7eb', color: '#374151' }}
                  >
                    {t.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === t.id ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📅</p>
              <p className="font-semibold">No sessions yet</p>
              <p className="text-sm mt-1">Book your first session with a mentor to get started.</p>
              <Link href="/mentors" className="inline-block mt-5 text-sm font-bold px-6 py-2.5 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                Find a Mentor →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming */}
              {showUpcoming && upcoming.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Upcoming</h2>
                  <div className="space-y-3">
                    {upcoming.map((s) => {
                      const cfg = STATUS_CONFIG[s.status];
                      return (
                        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-base" style={{ color: '#141c52' }}>{s.mentor.name}</p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {new Date(s.scheduled_at).toLocaleString()} · {s.duration_minutes} min
                              </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                              style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            {s.meeting_url && s.status === 'confirmed' && (
                              <a href={s.meeting_url} target="_blank" rel="noopener noreferrer"
                                className="text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
                                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                                Join Session →
                              </a>
                            )}
                            {s.status === 'confirmed' && (
                              <button
                                onClick={() => setCancelSession(s)}
                                className="text-sm text-red-400 hover:text-red-600 transition-colors">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past */}
              {showPast && past.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Past Sessions</h2>
                  <div className="space-y-3">
                    {past.map((s) => {
                      const cfg = STATUS_CONFIG[s.status];
                      return (
                        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-bold" style={{ color: '#141c52' }}>{s.mentor.name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(s.scheduled_at).toLocaleDateString()} · {s.duration_minutes} min
                              </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                              style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                              {cfg.label}
                            </span>
                          </div>

                          {/* Cancellation info */}
                          {s.status === 'cancelled' && s.cancellation_reason && (
                            <p className="text-xs text-gray-400 mb-2">Reason: {s.cancellation_reason}</p>
                          )}
                          {s.status === 'cancelled' && s.refund_amount && parseFloat(s.refund_amount) > 0 && (
                            <p className="text-xs text-green-600 mb-2">Refund: ${parseFloat(s.refund_amount).toFixed(2)}</p>
                          )}

                          {s.homework && (
                            <div className="bg-amber-50 rounded-xl p-3 mb-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">📚 Homework</p>
                              <p className="text-sm text-amber-800">{s.homework}</p>
                            </div>
                          )}

                          {s.status === 'completed' && s.student_rating === null && (
                            <button onClick={() => setRatingSession(s.id)}
                              className="text-sm font-semibold text-indigo-600 hover:underline">
                              ★ Rate this session
                            </button>
                          )}

                          {s.student_rating !== null && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < (s.student_rating ?? 0) ? 'text-amber-400' : 'text-gray-200'}`}
                                    fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-xs text-gray-400 ml-1">You rated {s.student_rating}/5</span>
                              </div>
                              {s.student_review && (
                                <p className="text-xs text-gray-500 italic">&ldquo;{s.student_review}&rdquo;</p>
                              )}
                              {s.mentor_reply && (
                                <div className="bg-indigo-50 rounded-xl p-3 mt-1">
                                  <p className="text-xs font-semibold text-indigo-700 mb-1">Mentor response</p>
                                  <p className="text-xs text-indigo-800">{s.mentor_reply}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
