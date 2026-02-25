'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserBadge {
  id: number;
  badge: { badge_type: string; name: string; description: string; emoji: string };
  earned_at: string;
}

interface AnalysisSession {
  id: number;
  status: string;
  created_at: string;
  result?: { overall_score: number; fluency_score: number; vocabulary_score: number };
}

interface Review {
  id: number;
  review_type: string;
  status: 'submitted' | 'assigned' | 'in_review' | 'delivered';
  submitted_at: string;
}

interface MentorSession {
  id: number;
  mentor_name: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
}

const REVIEW_TYPE_LABELS: Record<string, string> = {
  general: 'General Feedback',
  ielts_speaking: 'IELTS Speaking',
  job_interview: 'Job Interview',
  toefl: 'TOEFL Speaking',
  business: 'Business English',
  presentation: 'Presentation',
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  submitted: { color: '#92400e', bg: '#fef3c7' },
  assigned: { color: '#1e40af', bg: '#dbeafe' },
  in_review: { color: '#5b21b6', bg: '#ede9fe' },
  delivered: { color: '#166534', bg: '#dcfce7' },
};

function ScoreTrend({ sessions }: { sessions: AnalysisSession[] }) {
  const done = sessions
    .filter((s) => s.status === 'done' && s.result?.overall_score != null)
    .slice(0, 8)
    .reverse();

  if (done.length < 2) return null;

  const scores = done.map((s) => s.result!.overall_score);
  const min = Math.max(0, Math.min(...scores) - 10);
  const max = Math.min(100, Math.max(...scores) + 10);
  const range = max - min || 1;
  const W = 200;
  const H = 50;

  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - ((s - min) / range) * H;
    return `${x},${y}`;
  });

  const latest = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const delta = latest - prev;

  return (
    <div className="flex items-center gap-4">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0">
        <polyline
          fill="none"
          stroke="#FADB43"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
        />
        {scores.map((s, i) => {
          const x = (i / (scores.length - 1)) * W;
          const y = H - ((s - min) / range) * H;
          return (
            <circle key={i} cx={x} cy={y} r={i === scores.length - 1 ? 4 : 2.5}
              fill={i === scores.length - 1 ? '#fe9940' : '#FADB43'} />
          );
        })}
      </svg>
      <div className="text-right">
        <p className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{latest}</p>
        <p className={`text-xs font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading: profileLoading, refetch } = useProfile();
  const [form, setForm] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) setForm({ username: user.username, email: user.email });
  }, [user]);

  const { data: sessions = [] } = useQuery<AnalysisSession[]>({
    queryKey: ['profile-sessions'],
    queryFn: async () => {
      const { data } = await api.get('/analysis/sessions/');
      // fetch results for done sessions
      const done = data.filter((s: AnalysisSession) => s.status === 'done').slice(0, 8);
      const withResults = await Promise.all(
        done.map(async (s: AnalysisSession) => {
          try {
            const r = await api.get(`/analysis/${s.id}/results/`);
            return { ...s, result: r.data };
          } catch {
            return s;
          }
        })
      );
      return withResults;
    },
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['profile-reviews'],
    queryFn: () => api.get('/review/my/').then((r) => r.data),
  });

  const { data: mentorSessions = [] } = useQuery<MentorSession[]>({
    queryKey: ['profile-mentor-sessions'],
    queryFn: () => api.get('/mentors/sessions/my/').then((r) => r.data).catch(() => []),
  });

  const { data: userBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ['profile-badges'],
    queryFn: () => api.get('/auth/badges/').then((r) => r.data).catch(() => []),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/auth/profile/', form);
      setMessage('Profile updated.');
      refetch();
    } catch {
      setMessage('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  const recentSessions = sessions.slice(0, 5);
  const recentReviews = reviews.slice(0, 3);
  const recentMentorSessions = mentorSessions.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Account ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>Your Profile</h1>
            {user?.username && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-sm font-semibold px-4 py-1.5 rounded-full border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: '#141c52', color: '#141c52' }}
              >
                {copied ? '✓ Copied!' : '🔗 Share Profile'}
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Analyses',       value: sessions.length,        emoji: '🎤' },
              { label: 'Expert Reviews', value: reviews.length,         emoji: '🎓' },
              { label: 'Mentor Sessions',value: mentorSessions.length,  emoji: '📅' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg">{emoji}</p>
                <p className="text-xl font-extrabold" style={{ color: '#141c52' }}>{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            {message && (
              <p className={`text-sm px-3 py-2 rounded-lg ${
                message.includes('Failed') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'
              }`}>
                {message}
              </p>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="w-full rounded-full font-medium text-[#141c52]"
              style={{ backgroundColor: '#FADB43' }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </div>

        {/* ── Score History ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: '#141c52' }}>Score History</h2>
            <Link href="/analyze" className="text-xs font-semibold text-indigo-600 hover:underline">
              + New Analysis
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🎤</p>
              <p className="text-sm">No analyses yet.</p>
              <Link href="/analyze"
                className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                Analyze Your Speech →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <ScoreTrend sessions={sessions} />
              </div>
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <Link key={s.id} href="/analyze"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#141c52' }}>
                        Analysis #{s.id}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {s.result?.overall_score != null ? (
                      <span className="text-lg font-extrabold" style={{ color: '#141c52' }}>
                        {s.result.overall_score}
                        <span className="text-xs font-normal text-gray-400"> /100</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 capitalize">{s.status}</span>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Recent Expert Reviews ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: '#141c52' }}>Expert Reviews</h2>
            <Link href="/review/my" className="text-xs font-semibold text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🎓</p>
              <p className="text-sm">No reviews yet.</p>
              <Link href="/review"
                className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                Submit for Expert Review →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReviews.map((r) => {
                const cfg = STATUS_COLORS[r.status];
                return (
                  <Link key={r.id} href={`/review/${r.id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#141c52' }}>
                        {REVIEW_TYPE_LABELS[r.review_type] ?? r.review_type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: cfg?.color, backgroundColor: cfg?.bg }}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Mentor Sessions ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: '#141c52' }}>Mentor Sessions</h2>
            <Link href="/mentors/sessions" className="text-xs font-semibold text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>

          {mentorSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🧑‍🏫</p>
              <p className="text-sm">No mentor sessions yet.</p>
              <Link href="/mentors"
                className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                Browse Mentors →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMentorSessions.map((s) => (
                <div key={s.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#141c52' }}>
                      Session with {s.mentor_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(s.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}{s.duration_minutes} min
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Badges & Achievements ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-lg mb-4" style={{ color: '#141c52' }}>Badges & Achievements</h2>

          {userBadges.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🏅</p>
              <p className="text-sm">No badges yet.</p>
              <p className="text-xs mt-1">Complete analyses, keep streaks, and hit score milestones to earn badges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {userBadges.map((ub) => (
                <div key={ub.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  title={ub.badge.description}>
                  <span className="text-2xl">{ub.badge.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#141c52' }}>{ub.badge.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(ub.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
