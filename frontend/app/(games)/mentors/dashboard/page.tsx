'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ── Types ──────────────────────────────────────────────────────────────────

interface DashboardSession {
  id: number;
  student_name: string;
  student_initial: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  meeting_url: string | null;
}

interface Stats {
  total_sessions: number;
  rating_avg: number;
  monthly_earnings: number;
  pending_payout: number | null;
}

interface RecentStudent {
  student_id: number;
  student_name: string;
  student_initial: string;
  last_session_at: string;
  session_count: number;
}

interface DashboardData {
  upcoming_sessions: DashboardSession[];
  today_sessions: DashboardSession[];
  stats: Stats;
  recent_students: RecentStudent[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Avatar({ initial, size = 'md' }: { initial: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}
    >
      {initial}
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm font-semibold ml-1 text-gray-700">{value.toFixed(1)}</span>
    </span>
  );
}

function useJoinEnabled(scheduledAt: string, durationMinutes: number) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    function check() {
      const start = new Date(scheduledAt).getTime();
      const end   = start + durationMinutes * 60 * 1000;
      const now   = Date.now();
      setEnabled(now >= start - 5 * 60 * 1000 && now <= end);
    }
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [scheduledAt, durationMinutes]);
  return enabled;
}

// ── Session card ───────────────────────────────────────────────────────────

function UpcomingSessionCard({ session }: { session: DashboardSession }) {
  const joinEnabled = useJoinEnabled(session.scheduled_at, session.duration_minutes);
  const date = new Date(session.scheduled_at);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <Avatar initial={session.student_initial} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-tight" style={{ color: '#141c52' }}>
          {session.student_name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          {' · '}
          {session.duration_minutes} min
        </p>
      </div>
      {session.meeting_url ? (
        <a
          href={session.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!joinEnabled}
          onClick={(e) => { if (!joinEnabled) e.preventDefault(); }}
          className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-opacity ${
            joinEnabled ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'
          }`}
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
        >
          Join →
        </a>
      ) : (
        <span className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{ background: '#dbeafe', color: '#1e40af' }}>
          Confirmed
        </span>
      )}
    </div>
  );
}

// ── Today's timeline ───────────────────────────────────────────────────────

function TodaySchedule({ sessions }: { sessions: DashboardSession[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Today</h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No sessions today — enjoy your day</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const t = new Date(s.scheduled_at);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-12 flex-shrink-0">
                  {t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#141c52' }} />
                <span className="text-sm font-medium text-gray-700 truncate">{s.student_name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{s.duration_minutes}m</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Sessions delivered', value: stats.total_sessions.toString() },
    { label: 'Average rating',     value: <StarRating value={stats.rating_avg} /> },
    { label: 'Earnings this month', value: `$${stats.monthly_earnings.toFixed(0)}` },
    { label: 'Pending payout',     value: stats.pending_payout != null ? `$${stats.pending_payout}` : '—' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map(({ label, value }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <div className="text-xl font-bold" style={{ color: '#141c52' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Recent students ────────────────────────────────────────────────────────

function RecentStudents({ students }: { students: RecentStudent[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Recent Students</h2>
      {students.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No students yet</p>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <div key={s.student_id} className="flex items-center gap-3">
              <Avatar initial={s.student_initial} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#141c52' }}>{s.student_name}</p>
                <p className="text-xs text-gray-400">
                  {s.session_count} session{s.session_count !== 1 ? 's' : ''} · last{' '}
                  {new Date(s.last_session_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quick actions ──────────────────────────────────────────────────────────

function QuickActions() {
  const actions = [
    { label: 'Update Availability →', href: '/mentors/dashboard/availability' },
    { label: 'View Earnings →',       href: '/mentors/earnings' },
    { label: 'Edit Profile →',        href: '/mentors/profile/edit' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="block text-sm font-semibold py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors"
            style={{ color: '#141c52' }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-4 lg:space-y-0">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="space-y-4">
          <div className="h-36 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MentorDashboardPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['mentor-dashboard'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/mentors/dashboard/').then((r) => r.data),
    retry: false,
  });

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return; }
    if (isError)     { router.replace('/mentors'); }
  }, [isLoggedIn, isError, router]);

  if (!isLoggedIn || isError) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>Mentor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Your schedule, students, and performance at a glance.</p>
          </div>
          <Link href="/mentors/sessions"
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors hover:bg-indigo-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}>
            My Sessions →
          </Link>
        </div>

        {isLoading || !data ? (
          <Skeleton />
        ) : (
          <>
            {/* Stats bar */}
            <StatsBar stats={data.stats} />

            {/* Main layout: upcoming (2/3) + sidebar (1/3) */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">

              {/* Upcoming sessions */}
              <div className="lg:col-span-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Upcoming Sessions
                  {data.upcoming_sessions.length > 0 && (
                    <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold normal-case">
                      {data.upcoming_sessions.length}
                    </span>
                  )}
                </h2>
                {data.upcoming_sessions.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="text-sm text-gray-400">No upcoming sessions</p>
                    <p className="text-xs text-gray-300 mt-1">New bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.upcoming_sessions.map((s) => (
                      <UpcomingSessionCard key={s.id} session={s} />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <TodaySchedule sessions={data.today_sessions} />
                <RecentStudents students={data.recent_students} />
                <QuickActions />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
