'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ── Brand ─────────────────────────────────────────────────────────────────────

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const SCORE_COLOR = (s: number) =>
  s >= 80 ? { color: '#166534', bg: '#dcfce7' }
  : s >= 60 ? { color: '#92400e', bg: '#fef3c7' }
  : { color: '#991b1b', bg: '#fee2e2' };

const GAME_COLORS: Record<string, { bg: string; text: string; emoji: string; label: string }> = {
  blitz:         { bg: '#fef9c3', text: '#92400e', emoji: '⚡', label: 'Vocabulary Blitz' },
  guess:         { bg: '#ede9fe', text: '#6d28d9', emoji: '🧠', label: 'Guess the Word' },
  memory:        { bg: '#d1fae5', text: '#065f46', emoji: '🃏', label: 'Memory Match' },
  scramble:      { bg: '#dbeafe', text: '#1e40af', emoji: '🔤', label: 'Word Scramble' },
  sentence:      { bg: '#fce7f3', text: '#9d174d', emoji: '✍️', label: 'Sentence Builder' },
  daily:         { bg: '#fef3c7', text: '#78350f', emoji: '🔥', label: 'Daily Challenge' },
  pronunciation: { bg: '#fee2e2', text: '#991b1b', emoji: '🎙️', label: 'Pronunciation' },
};

const MODE_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  presentation:  'Presentation',
  debate:        'Debate',
  small_talk:    'Small Talk',
};

const PRIORITY_LINKS: Record<string, { label: string; href: string; emoji: string }> = {
  'filler words': { label: 'Pronunciation Challenge', href: '/practice/pronunciation-challenge', emoji: '🎙️' },
  'vocabulary':   { label: 'Vocabulary Blitz',        href: '/practice/vocabulary-blitz',        emoji: '⚡' },
  'pacing':       { label: 'Pronunciation Challenge', href: '/practice/pronunciation-challenge', emoji: '🎙️' },
  'grammar':      { label: 'Sentence Builder',        href: '/practice/sentence-builder',        emoji: '✍️' },
  'fluency':      { label: 'Role Play',               href: '/practice/roleplay',                emoji: '🎭' },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  profile: { image: string | null; current_streak: number; longest_streak: number };
}

interface AnalysisSession {
  id: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
  created_at: string;
  result?: { overall_score: number; fluency_score: number; vocabulary_score: number };
}

interface AnalysisDetailResult {
  improvement_priorities: string[];
}

interface Review {
  id: number;
  review_type: string;
  status: 'submitted' | 'assigned' | 'in_review' | 'delivered';
  submitted_at: string;
}

interface MentorSession {
  id: number;
  mentor: { id: number; name: string };
  scheduled_at: string;
  status: string;
  duration_minutes: number;
}

interface GameSession {
  id: number;
  game: string;
  score: number;
  played_at: string;
}

interface LearnPost {
  id: number;
  is_completed: boolean;
}

interface RolePlaySession {
  id: number;
  mode: string;
  topic: string;
  score: number | null;
  status: string;
  started_at: string;
}

interface UserBadge {
  id: number;
  badge: { badge_type: string; name: string; description: string; emoji: string };
  earned_at: string;
}

interface SavedWord {
  id: number;
  word: string;
  definition: string;
  note: string;
  saved_at: string;
}

// ── Review constants ───────────────────────────────────────────────────────────

const REVIEW_TYPE_LABELS: Record<string, string> = {
  general:       'General Feedback',
  ielts_speaking:'IELTS Speaking',
  job_interview: 'Job Interview',
  toefl:         'TOEFL Speaking',
  business:      'Business English',
  presentation:  'Presentation',
};

const REVIEW_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  submitted: { color: '#92400e', bg: '#fef3c7' },
  assigned:  { color: '#1e40af', bg: '#dbeafe' },
  in_review: { color: '#5b21b6', bg: '#ede9fe' },
  delivered: { color: '#166534', bg: '#dcfce7' },
};

// ── Contribution Graph ─────────────────────────────────────────────────────────

function ContributionGraph({ activityDates }: { activityDates: string[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start 52 full weeks ago aligned to Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  // Count map: 'YYYY-MM-DD' -> count
  const countMap = new Map<string, number>();
  for (const d of activityDates) {
    const key = d.slice(0, 10);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  type Cell = { date: Date; count: number };
  const weeks: Cell[][] = [];
  const cur = new Date(start);

  while (cur <= today) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const key = cur.toISOString().slice(0, 10);
      week.push({ date: new Date(cur), count: cur <= today ? (countMap.get(key) ?? 0) : -1 });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const COLOR = (count: number) =>
    count <= 0 ? '#e5e7eb'
    : count === 1 ? '#fde68a'
    : count === 2 ? '#fbbf24'
    : count <= 4 ? '#f97316'
    : '#ea580c';

  const totalActivities = activityDates.filter(d => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date >= start && date <= today;
  }).length;
  const activeDays = countMap.size;

  // Month labels: track first column index for each new month
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    if (!week[0]) return;
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        label: week[0].date.toLocaleDateString('en-US', { month: 'short' }),
        col: wi,
      });
      lastMonth = m;
    }
  });

  return (
    <div>
      {/* Legend row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{totalActivities}</span> activities ·{' '}
          <span className="font-semibold text-gray-600">{activeDays}</span> active days in the past year
        </p>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span>Less</span>
          {[0, 1, 2, 3, 5].map((l) => (
            <div key={l} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLOR(l) }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1" style={{ paddingLeft: 22 }}>
          {weeks.map((week, wi) => {
            const lbl = monthLabels.find(m => m.col === wi);
            return (
              <div key={wi} className="shrink-0" style={{ width: 11 }}>
                {lbl ? (
                  <span className="text-[9px] text-gray-400 whitespace-nowrap">{lbl.label}</span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Day labels + grid */}
        <div className="flex gap-[3px]">
          {/* Day of week labels */}
          <div className="flex flex-col gap-[3px] mr-1 shrink-0">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ width: 14, height: 11 }}
                className="text-[9px] text-gray-400 flex items-center justify-end pr-0.5">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] shrink-0">
              {Array.from({ length: 7 }, (_, di) => {
                const cell = week[di];
                if (!cell || cell.count === -1) {
                  return <div key={di} style={{ width: 11, height: 11 }} />;
                }
                return (
                  <div
                    key={di}
                    className="rounded-sm cursor-default hover:ring-1 hover:ring-gray-400 transition-all"
                    style={{ width: 11, height: 11, backgroundColor: COLOR(cell.count) }}
                    title={`${cell.date.toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })} — ${cell.count === 0 ? 'No activity' : `${cell.count} activit${cell.count !== 1 ? 'ies' : 'y'}`}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ScoreRing ──────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{score}</span>
        <span className="text-[10px] text-white/60">/100</span>
      </div>
    </div>
  );
}

// ── ScoreTrend sparkline ───────────────────────────────────────────────────────

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
  const W = 200, H = 50;
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - ((s - min) / range) * H;
    return `${x},${y}`;
  });
  const latest = scores[scores.length - 1];
  const prev   = scores[scores.length - 2];
  const delta  = latest - prev;
  return (
    <div className="flex items-center gap-4">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0">
        <polyline fill="none" stroke="#FADB43" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" points={points.join(' ')} />
        {scores.map((s, i) => {
          const x = (i / (scores.length - 1)) * W;
          const y = H - ((s - min) / range) * H;
          return <circle key={i} cx={x} cy={y} r={i === scores.length - 1 ? 4 : 2.5}
            fill={i === scores.length - 1 ? '#fe9940' : '#FADB43'} />;
        })}
      </svg>
      <div className="text-right">
        <p className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>{latest}</p>
        <p className={`text-xs font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: user, isLoading: profileLoading, refetch } = useProfile();
  const [form, setForm] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);

  useEffect(() => {
    if (user) setForm({ username: user.username, email: user.email });
  }, [user]);

  // Show login-streak bonus banner once per day
  useEffect(() => {
    const today = new Date().toDateString();
    const last = typeof window !== 'undefined' ? localStorage.getItem('speechef_login_bonus_date') : null;
    if (last !== today) {
      setShowLoginBanner(true);
      localStorage.setItem('speechef_login_bonus_date', today);
      const t = setTimeout(() => setShowLoginBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  // ── All queries (shared across tabs) ──────────────────────────────────────

  const { data: analysisSessions = [], isLoading: loadingAnalysis } = useQuery<AnalysisSession[]>({
    queryKey: ['profile-sessions'],
    queryFn: () => api.get('/analysis/sessions/').then((r) =>
      (r.data as AnalysisSession[]).filter((s) => s.status === 'done').slice(0, 8)
    ),
  });

  const { data: allAnalysis = [] } = useQuery<AnalysisSession[]>({
    queryKey: ['all-analysis-sessions'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data),
  });

  const doneSessions = allAnalysis.filter((s) => s.status === 'done' && s.result != null);
  const sortedDone = [...doneSessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const latestDoneId = sortedDone.length > 0 ? sortedDone[sortedDone.length - 1].id : null;

  const { data: latestResult } = useQuery<AnalysisDetailResult>({
    queryKey: ['analysis-result', latestDoneId],
    queryFn: () => api.get(`/analysis/${latestDoneId}/results/`).then((r) => r.data),
    enabled: latestDoneId != null,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['profile-reviews'],
    queryFn: () => api.get('/review/my/').then((r) => r.data),
  });

  const { data: mentorSessions = [] } = useQuery<MentorSession[]>({
    queryKey: ['profile-mentor-sessions'],
    queryFn: () => api.get('/mentors/sessions/my/').then((r) => r.data).catch(() => []),
  });

  const { data: gameSessions = [], isLoading: loadingGames } = useQuery<GameSession[]>({
    queryKey: ['game-sessions-all'],
    queryFn: () => api.get('/practice/sessions/', { params: { limit: 500 } }).then((r) => r.data),
  });

  const { data: learnPosts = [], isLoading: loadingLearn } = useQuery<LearnPost[]>({
    queryKey: ['learn-posts-progress'],
    queryFn: () => api.get('/learn/posts/', { params: { limit: 200 } }).then((r) => r.data),
  });

  const { data: roleplaySessions = [], isLoading: loadingRoleplay } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const { data: userBadges = [], isLoading: loadingBadges } = useQuery<UserBadge[]>({
    queryKey: ['profile-badges'],
    queryFn: () => api.get('/auth/badges/').then((r) => r.data).catch(() => []),
  });

  const { data: savedWords = [], isLoading: loadingSavedWords } = useQuery<SavedWord[]>({
    queryKey: ['profile-saved-words'],
    queryFn: () => api.get('/practice/saved-words/').then((r) => r.data).catch(() => []),
  });

  // ── Submit handler ─────────────────────────────────────────────────────────

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

  // ── Derived values for Progress tab ────────────────────────────────────────

  // Active for (days since account creation)
  const dateJoined = (user as ProfileData & { date_joined?: string })?.date_joined;
  const activeDaysCount = dateJoined
    ? Math.floor((Date.now() - new Date(dateJoined).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const currentStreak  = (user as ProfileData)?.profile?.current_streak ?? 0;
  const longestStreak  = (user as ProfileData)?.profile?.longest_streak ?? 0;

  const latestScore = sortedDone.length > 0 ? sortedDone[sortedDone.length - 1].result!.overall_score : null;
  const prevScore   = sortedDone.length > 1 ? sortedDone[sortedDone.length - 2].result!.overall_score : null;
  const delta       = latestScore != null && prevScore != null ? latestScore - prevScore : null;

  const avgFluency = doneSessions.length > 0
    ? Math.round(doneSessions.reduce((s, x) => s + (x.result?.fluency_score ?? 0), 0) / doneSessions.length)
    : null;
  const avgVocab = doneSessions.length > 0
    ? Math.round(doneSessions.reduce((s, x) => s + (x.result?.vocabulary_score ?? 0), 0) / doneSessions.length)
    : null;
  const avgOverall = doneSessions.length > 0
    ? Math.round(doneSessions.reduce((s, x) => s + (x.result?.overall_score ?? 0), 0) / doneSessions.length)
    : null;

  // Game stats
  const gameMap = new Map<string, { count: number; best: number }>();
  for (const s of gameSessions) {
    const ex = gameMap.get(s.game);
    if (ex) { ex.count += 1; ex.best = Math.max(ex.best, s.score); }
    else gameMap.set(s.game, { count: 1, best: s.score });
  }
  const gameEntries   = [...gameMap.entries()].sort((a, b) => b[1].count - a[1].count);
  const uniqueGames   = gameMap.size;
  const bestGameScore = gameSessions.length > 0 ? Math.max(...gameSessions.map((s) => s.score)) : 0;
  const totalGameScore = gameSessions.reduce((sum, s) => sum + s.score, 0);

  // Learn progress
  const totalLessons     = learnPosts.length;
  const completedLessons = learnPosts.filter((p) => p.is_completed).length;
  const learnPct         = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Roleplay stats
  const finishedRoleplay = roleplaySessions.filter((s) => s.status === 'finished' && s.score != null);
  const rpAvgScore = finishedRoleplay.length > 0
    ? Math.round(finishedRoleplay.reduce((s, x) => s + (x.score ?? 0), 0) / finishedRoleplay.length)
    : null;
  const bestMode = (() => {
    if (finishedRoleplay.length === 0) return null;
    const modeAvgs = new Map<string, { sum: number; count: number }>();
    for (const s of finishedRoleplay) {
      const m = modeAvgs.get(s.mode) ?? { sum: 0, count: 0 };
      m.sum += s.score ?? 0; m.count += 1;
      modeAvgs.set(s.mode, m);
    }
    let best: [string, number] | null = null;
    for (const [mode, { sum, count }] of modeAvgs) {
      const avg = sum / count;
      if (!best || avg > best[1]) best = [mode, avg];
    }
    return best ? MODE_LABELS[best[0]] ?? best[0] : null;
  })();

  // Sparkline for score trend
  const sparkScores = sortedDone.slice(-10).map((s) => s.result!.overall_score);
  const W = 320, H = 56, PAD = 6;
  const minS = sparkScores.length > 0 ? Math.max(0, Math.min(...sparkScores) - 5) : 0;
  const maxS = sparkScores.length > 0 ? Math.min(100, Math.max(...sparkScores) + 5) : 100;
  const sRange = Math.max(maxS - minS, 1);
  const xStep = sparkScores.length > 1 ? (W - PAD * 2) / (sparkScores.length - 1) : W - PAD * 2;
  const polyline = sparkScores
    .map((sc, i) => {
      const x = PAD + i * xStep;
      const y = PAD + (1 - (sc - minS) / sRange) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const sparkBest = sparkScores.length > 0 ? Math.max(...sparkScores) : null;
  const sparkAvg  = sparkScores.length > 0
    ? Math.round(sparkScores.reduce((a, b) => a + b, 0) / sparkScores.length)
    : null;

  // Contribution graph activity dates
  const activityDates = [
    ...gameSessions.map((s) => s.played_at),
    ...allAnalysis.map((s) => s.created_at),
    ...roleplaySessions.map((s) => s.started_at),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: '#f4f6fb' }}>

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#080d26 0%,#141c52 55%,#1a2460 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold shrink-0"
              style={{ background: 'linear-gradient(135deg,#FADB43,#fe9940)', color: '#141c52' }}>
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>

            {/* Name + meta + stat chips */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white leading-tight">
                {user?.username}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user?.email}
                {dateJoined ? ` · Joined ${new Date(dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                  🎤 {allAnalysis.length} analyses
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                  🎮 {gameSessions.length} games
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                  🗣️ {roleplaySessions.length} roleplays
                </span>
                {totalGameScore > 0 && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(250,219,67,0.18)', border: '1px solid rgba(250,219,67,0.3)', color: '#FADB43' }}>
                    ⭐ {totalGameScore.toLocaleString()} pts
                  </span>
                )}
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={currentStreak > 0
                    ? { background: 'rgba(251,146,60,0.28)', border: '1px solid rgba(251,146,60,0.5)', color: '#fb923c' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                  🔥 {currentStreak > 0 ? `${currentStreak}-day streak` : 'No streak yet'}
                </span>
              </div>
            </div>

            {/* Score ring + actions */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {latestScore != null
                ? <ScoreRing score={latestScore} />
                : (
                  <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center shrink-0"
                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                    <span className="text-white/30 text-3xl">?</span>
                  </div>
                )}
              <span className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Speechef Score</span>
              {delta != null && delta !== 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: delta > 0 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color: delta > 0 ? '#4ade80' : '#f87171' }}>
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} pts
                </span>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Link href="/analyze"
                  className="text-xs font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}>
                  Analyze →
                </Link>
                {user?.username && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                    {copied ? '✓ Copied' : '🔗 Share'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Login bonus banner ───────────────────────────────────────────────── */}
      {showLoginBanner && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-sm"
            style={{ background: 'linear-gradient(to right,#fff7ed,#fef3c7)', border: '1px solid #fde68a' }}
          >
            <span className="text-2xl animate-bounce">🔥</span>
            <div className="flex-1">
              <p className="text-sm font-extrabold" style={{ color: '#78350f' }}>
                +1 Login streak!
                {currentStreak > 0 && (
                  <span className="ml-2 text-xs font-semibold" style={{ color: '#92400e' }}>
                    You&apos;re on a {currentStreak}-day streak 🎉
                  </span>
                )}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#a16207' }}>
                Every login counts — keep showing up daily.
              </p>
            </div>
            <button
              onClick={() => setShowLoginBanner(false)}
              className="text-xs font-bold px-3 py-1 rounded-full transition-colors hover:bg-amber-100"
              style={{ color: '#92400e' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
          <div className="w-full lg:w-72 shrink-0 space-y-5">

            {/* Account */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-sm mb-4" style={{ color: BRAND.primary }}>Account</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs">Username</Label>
                  <Input id="username" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                {message && (
                  <p className={`text-xs px-3 py-2 rounded-lg ${message.includes('Failed') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`}>
                    {message}
                  </p>
                )}
                <Button type="submit" disabled={saving}
                  className="w-full rounded-full font-medium text-[#141c52]"
                  style={{ backgroundColor: '#FADB43' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </form>
            </div>

            {/* Skill Scores */}
            {loadingAnalysis ? (
              <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">📊</span>
                  <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Skill Scores</p>
                  {doneSessions.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400">avg of {doneSessions.length}</span>
                  )}
                </div>
                {doneSessions.length === 0 ? (
                  <div className="flex flex-col items-center py-4 gap-2 text-center">
                    <p className="text-2xl">🎙️</p>
                    <p className="text-xs text-gray-400">Analyze a speech to unlock skill scores.</p>
                    <Link href="/analyze" className="text-xs font-semibold underline" style={{ color: BRAND.primary }}>
                      Get started →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {([
                      { label: 'Fluency',    score: avgFluency },
                      { label: 'Vocabulary', score: avgVocab },
                      { label: 'Overall',    score: avgOverall },
                    ] as { label: string; score: number | null }[]).map(({ label, score }) => {
                      if (score == null) return null;
                      const sc = SCORE_COLOR(score);
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-500">{label}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                              style={{ color: sc.color, backgroundColor: sc.bg }}>{score}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${score}%`, backgroundColor: sc.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Focus Areas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🎯</span>
                <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Focus Areas</p>
              </div>
              {!latestResult?.improvement_priorities?.length ? (
                <div className="flex flex-col items-center py-4 gap-2 text-center">
                  <p className="text-xs text-gray-400">Complete a speech analysis to get recommendations.</p>
                  <Link href="/analyze" className="text-xs font-semibold underline" style={{ color: BRAND.primary }}>
                    Analyze →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {latestResult.improvement_priorities.slice(0, 4).map((priority) => {
                    const key = priority.toLowerCase();
                    const match = Object.entries(PRIORITY_LINKS).find(([k]) => key.includes(k));
                    const link = match ? match[1] : null;
                    return (
                      <div key={priority} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{link?.emoji ?? '💡'}</span>
                          <span className="text-xs font-medium capitalize" style={{ color: BRAND.primary }}>{priority}</span>
                        </div>
                        {link && (
                          <Link href={link.href}
                            className="text-xs font-bold px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                            style={{ background: BRAND.gradient, color: BRAND.primary }}>
                            →
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Badges */}
            {loadingBadges ? (
              <div className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ) : userBadges.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <p className="text-3xl mb-2">🏅</p>
                <p className="text-xs text-gray-400">Keep practicing to earn badges.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">🏆</span>
                  <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Badges</p>
                  <span className="ml-auto text-xs text-gray-400">{userBadges.length} earned</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {userBadges.map((ub) => (
                    <div key={ub.id} title={ub.badge.description}
                      className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2.5 text-center hover:bg-gray-100 transition-colors">
                      <span className="text-2xl">{ub.badge.emoji}</span>
                      <p className="text-[10px] font-semibold leading-tight" style={{ color: BRAND.primary }}>
                        {ub.badge.name}
                      </p>
                      <p className="text-[9px] text-gray-400">
                        {new Date(ub.earned_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Main Content ───────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Streak stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-xl mb-1">📅</p>
                <p className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>
                  {activeDaysCount != null ? `${activeDaysCount}d` : '—'}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Active For</p>
                <p className="text-[10px] text-gray-400">since joining</p>
              </div>

              {/* Current streak — highlighted when active */}
              <div
                className="rounded-2xl shadow-sm p-4 text-center"
                style={currentStreak > 0
                  ? { background: 'linear-gradient(135deg,#fff7ed,#fef3c7)', border: '1px solid #fde68a' }
                  : { background: '#fff', border: '1px solid #f3f4f6' }}
              >
                <p className="text-xl mb-1">🔥</p>
                <p className="text-2xl font-extrabold" style={{ color: currentStreak > 0 ? '#c2410c' : BRAND.primary }}>
                  {currentStreak > 0 ? `${currentStreak}d` : '—'}
                </p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: currentStreak > 0 ? '#92400e' : '#6b7280' }}>
                  Current Streak
                </p>
                <p className="text-[10px]" style={{ color: currentStreak > 0 ? '#a16207' : '#9ca3af' }}>
                  {currentStreak > 0 ? 'login counts ✓' : 'start today'}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-xl mb-1">⭐</p>
                <p className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>
                  {longestStreak > 0 ? `${longestStreak}d` : '—'}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Longest Streak</p>
                <p className="text-[10px] text-gray-400">personal best</p>
              </div>
            </div>

            {/* Activity graph */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">📆</span>
                <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Activity — Past Year</p>
                <p className="ml-auto text-xs text-gray-400">games · analyses · roleplay</p>
              </div>
              <ContributionGraph activityDates={activityDates} />
            </div>

            {/* Score Trend */}
            {loadingAnalysis ? (
              <div className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ) : sparkScores.length < 2 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>Score Trend</p>
                    <p className="text-xs text-gray-400">Complete 2+ analyses to see your trend chart.</p>
                  </div>
                </div>
                <Link href="/analyze" className="shrink-0 text-xs font-bold px-4 py-2 rounded-full hover:opacity-90"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}>
                  Analyze →
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📈</span>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Score Trend</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Best: <span className="font-bold" style={{ color: BRAND.primary }}>{sparkBest}</span></span>
                    <span>Avg: <span className="font-bold" style={{ color: BRAND.primary }}>{sparkAvg}</span></span>
                    {delta != null && delta !== 0 && (
                      <span className="font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: delta > 0 ? '#dcfce7' : '#fee2e2', color: delta > 0 ? '#166534' : '#991b1b' }}>
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                      </span>
                    )}
                  </div>
                </div>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                  <defs>
                    <linearGradient id="profTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#FADB43" />
                      <stop offset="100%" stopColor="#fe9940" />
                    </linearGradient>
                  </defs>
                  <polyline points={polyline} fill="none" stroke="url(#profTrendGrad)"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {sparkScores.map((sc, i) => (
                    <circle key={i}
                      cx={PAD + i * xStep}
                      cy={PAD + (1 - (sc - minS) / sRange) * (H - PAD * 2)}
                      r={i === sparkScores.length - 1 ? 4 : 2.5}
                      fill={i === sparkScores.length - 1 ? '#fe9940' : 'white'}
                      stroke="#fe9940" strokeWidth="2" />
                  ))}
                </svg>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>
                    {sortedDone.length >= sparkScores.length
                      ? new Date(sortedDone[sortedDone.length - sparkScores.length].created_at)
                          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : ''}
                  </span>
                  <span>{sparkScores.length} sessions</span>
                  <span>
                    {sortedDone.length > 0
                      ? new Date(sortedDone[sortedDone.length - 1].created_at)
                          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Score History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎤</span>
                  <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>Score History</h2>
                </div>
                <Link href="/analyze" className="text-xs font-semibold text-indigo-600 hover:underline">
                  + New Analysis
                </Link>
              </div>
              {loadingAnalysis ? (
                <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ) : analysisSessions.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-3xl mb-2">🎤</p>
                  <p className="text-sm">No analyses yet.</p>
                  <Link href="/analyze" className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-full"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}>
                    Analyze Your Speech →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {analysisSessions.slice(0, 5).map((s) => (
                    <Link key={s.id} href={`/analyze?session=${s.id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium" style={{ color: BRAND.primary }}>Analysis #{s.id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {s.result?.overall_score != null ? (
                        <span className="text-lg font-extrabold" style={{ color: BRAND.primary }}>
                          {s.result.overall_score}<span className="text-xs font-normal text-gray-400"> /100</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 capitalize">{s.status}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Practice Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🎮</span>
                <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>Practice Activity</h2>
              </div>
              {loadingGames ? (
                <div className="h-36 rounded-xl bg-gray-100 animate-pulse" />
              ) : gameSessions.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <p className="text-3xl">🎮</p>
                  <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>No games played yet</p>
                  <p className="text-xs text-gray-400 mb-3">Play practice games to track your progress.</p>
                  <Link href="/practice"
                    className="inline-block px-5 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}>
                    Go to Practice →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                      🎮 {gameSessions.length} session{gameSessions.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                      🕹️ {uniqueGames} game{uniqueGames !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                      ⭐ Best: {bestGameScore}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {gameEntries.map(([game, { count, best }]) => {
                      const gc = GAME_COLORS[game] ?? { bg: '#f3f4f6', text: '#374151', emoji: '🎮', label: game };
                      const pct = Math.round((count / gameSessions.length) * 100);
                      return (
                        <Link key={game} href={`/practice/history?game=${game}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: gc.text }} />
                          <span className="text-base shrink-0">{gc.emoji}</span>
                          <span className="text-sm font-semibold flex-1 min-w-0 truncate" style={{ color: BRAND.primary }}>{gc.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="hidden sm:block w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: gc.text }} />
                            </div>
                            <span className="text-xs text-gray-400">{count}</span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs font-bold" style={{ color: BRAND.primary }}>{best}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                    <Link href="/practice/history" className="text-xs font-semibold hover:underline" style={{ color: BRAND.primary }}>
                      View full history →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Expert Reviews + Mentor Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎓</span>
                    <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>Expert Reviews</h2>
                  </div>
                  <Link href="/review/my" className="text-xs font-semibold text-indigo-600 hover:underline">View all →</Link>
                </div>
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-2xl mb-2">🎓</p>
                    <p className="text-xs">No reviews yet.</p>
                    <Link href="/review" className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-full"
                      style={{ background: BRAND.gradient, color: BRAND.primary }}>
                      Submit →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reviews.slice(0, 3).map((r) => {
                      const cfg = REVIEW_STATUS_COLORS[r.status];
                      return (
                        <Link key={r.id} href={`/review/${r.id}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="text-xs font-medium" style={{ color: BRAND.primary }}>
                              {REVIEW_TYPE_LABELS[r.review_type] ?? r.review_type}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: cfg?.color, backgroundColor: cfg?.bg }}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧑‍🏫</span>
                    <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>Mentor Sessions</h2>
                  </div>
                  <Link href="/mentors/sessions" className="text-xs font-semibold text-indigo-600 hover:underline">View all →</Link>
                </div>
                {mentorSessions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-2xl mb-2">🧑‍🏫</p>
                    <p className="text-xs">No mentor sessions yet.</p>
                    <Link href="/mentors" className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-full"
                      style={{ background: BRAND.gradient, color: BRAND.primary }}>
                      Browse →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mentorSessions.slice(0, 3).map((s) => (
                      <div key={s.id} className="px-3 py-2.5 rounded-xl bg-gray-50">
                        <p className="text-xs font-medium" style={{ color: BRAND.primary }}>
                          Session with {s.mentor.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(s.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{s.duration_minutes} min · {s.status.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Learning + Roleplay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">

              {loadingLearn ? (
                <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base">📚</span>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Learning Progress</p>
                  </div>
                  {totalLessons === 0 ? (
                    <div className="flex flex-col items-center py-4 gap-2 text-center">
                      <p className="text-2xl">📚</p>
                      <p className="text-xs text-gray-400">No lessons available yet.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold mb-1" style={{ color: BRAND.primary }}>
                        {completedLessons}
                        <span className="text-sm font-normal text-gray-400"> / {totalLessons}</span>
                      </p>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${learnPct}%`, background: BRAND.gradient }} />
                      </div>
                      <p className="text-xs text-gray-400 mb-4">{learnPct}% complete</p>
                      <Link href="/learn"
                        className="inline-block px-5 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                        style={{ background: BRAND.gradient, color: BRAND.primary }}>
                        Continue Learning →
                      </Link>
                    </>
                  )}
                </div>
              )}

              {loadingRoleplay ? (
                <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base">🗣️</span>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>Roleplay</p>
                  </div>
                  {roleplaySessions.length === 0 ? (
                    <div className="flex flex-col items-center py-4 gap-2 text-center">
                      <p className="text-2xl">🗣️</p>
                      <p className="text-xs text-gray-400">No roleplay sessions yet.</p>
                      <Link href="/practice/roleplay"
                        className="text-xs font-bold px-4 py-2 rounded-full hover:opacity-90"
                        style={{ background: BRAND.gradient, color: BRAND.primary }}>
                        Start →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                        🗣️ {roleplaySessions.length} session{roleplaySessions.length !== 1 ? 's' : ''}
                      </span>
                      {rpAvgScore != null && (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                          🏆 Avg: {rpAvgScore}/100
                        </span>
                      )}
                      {bestMode && (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                          ⭐ {bestMode}
                        </span>
                      )}
                      <Link href="/practice/roleplay"
                        className="ml-auto text-xs font-semibold hover:underline"
                        style={{ color: BRAND.primary }}>
                        Go →
                      </Link>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* My Vocabulary */}
            {loadingSavedWords ? (
              <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 pb-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📖</span>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>My Vocabulary</p>
                  </div>
                  <Link href="/practice/saved-words" className="text-xs font-semibold text-indigo-600 hover:underline">
                    View all →
                  </Link>
                </div>

                {/* Stat row */}
                <div className="flex items-center gap-5 mb-5 flex-wrap">
                  <div>
                    <p className="text-3xl font-extrabold leading-none" style={{ color: BRAND.primary }}>
                      {savedWords.length}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-1">Words saved</p>
                  </div>
                  <div className="w-px h-10 bg-gray-100" />
                  <div>
                    <p className="text-3xl font-extrabold leading-none" style={{ color: BRAND.primary }}>
                      {(gameMap.get('blitz')?.count ?? 0) + (gameMap.get('guess')?.count ?? 0) + (gameMap.get('memory')?.count ?? 0) + (gameMap.get('scramble')?.count ?? 0)}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-1">Vocab drills played</p>
                  </div>
                  {savedWords.length > 0 && (
                    <>
                      <div className="w-px h-10 bg-gray-100" />
                      <div>
                        <p className="text-3xl font-extrabold leading-none" style={{ color: BRAND.primary }}>
                          {savedWords.filter((w) => w.definition).length}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-1">With definitions</p>
                      </div>
                    </>
                  )}
                </div>

                {savedWords.length === 0 ? (
                  <div className="flex flex-col items-center py-5 gap-2 text-center">
                    <p className="text-2xl">📖</p>
                    <p className="text-xs text-gray-400">No words saved yet — start building your vocabulary pantry.</p>
                    <Link href="/learn"
                      className="inline-block mt-2 text-xs font-bold px-4 py-2 rounded-full hover:opacity-90"
                      style={{ background: BRAND.gradient, color: BRAND.primary }}>
                      Browse lessons →
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Recent words */}
                    <div className="space-y-2 mb-4">
                      {savedWords.slice(0, 5).map((w) => (
                        <div key={w.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
                          <span className="text-sm font-bold mt-0.5 shrink-0" style={{ color: BRAND.primary }}>{w.word}</span>
                          {w.definition && (
                            <p className="text-xs text-gray-500 leading-snug line-clamp-2 flex-1">{w.definition}</p>
                          )}
                          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                            {new Date(w.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href="/practice/saved-words"
                        className="text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                        style={{ background: BRAND.gradient, color: BRAND.primary }}>
                        All {savedWords.length} words →
                      </Link>
                      <Link href="/practice/vocabulary-blitz"
                        className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                        ⚡ Practice vocabulary
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
