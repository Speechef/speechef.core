'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ── Constants ─────────────────────────────────────────────────────────────────

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

const PRIORITY_LINKS: Record<string, { label: string; href: string; emoji: string }> = {
  'filler words': { label: 'Pronunciation Challenge', href: '/practice/pronunciation-challenge', emoji: '🎙️' },
  'vocabulary':   { label: 'Vocabulary Blitz',        href: '/practice/vocabulary-blitz',        emoji: '⚡' },
  'pacing':       { label: 'Pronunciation Challenge', href: '/practice/pronunciation-challenge', emoji: '🎙️' },
  'grammar':      { label: 'Sentence Builder',        href: '/practice/sentence-builder',        emoji: '✍️' },
  'fluency':      { label: 'Role Play',               href: '/practice/roleplay',                emoji: '🎭' },
};

const MODE_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  presentation:  'Presentation',
  debate:        'Debate',
  small_talk:    'Small Talk',
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  overall_score: number;
  fluency_score: number;
  vocabulary_score: number;
  tone: string;
}

interface AnalysisSession {
  id: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
  created_at: string;
  result: AnalysisResult | null;
}

interface AnalysisDetailResult {
  improvement_priorities: string[];
}

interface GameSession {
  id: number;
  game: string;
  score: number;
  played_at: string;
}

interface ProfileData {
  id: number;
  username: string;
  email: string;
  profile: { image: string | null; current_streak: number; longest_streak: number };
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

// ── ScoreRing ─────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{score}</span>
        <span className="text-[10px] text-white/60">/100</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { isLoggedIn } = useAuthStore();

  // ── Queries (all enabled only when logged in) ─────────────────────────────

  const { data: analysisSessions = [], isLoading: loadingAnalysis } = useQuery<AnalysisSession[]>({
    queryKey: ['analysis-sessions'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  // Derive the latest done session ID before calling the detail query
  const doneSessions = analysisSessions.filter((s) => s.status === 'done' && s.result != null);
  const sortedDone = [...doneSessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const latestDoneId = sortedDone.length > 0 ? sortedDone[sortedDone.length - 1].id : null;

  const { data: latestResult, isLoading: loadingResult } = useQuery<AnalysisDetailResult>({
    queryKey: ['analysis-result', latestDoneId],
    queryFn: () => api.get(`/analysis/${latestDoneId}/results/`).then((r) => r.data),
    enabled: isLoggedIn && latestDoneId != null,
  });

  const { data: gameSessions = [], isLoading: loadingGames } = useQuery<GameSession[]>({
    queryKey: ['game-sessions-all'],
    queryFn: () => api.get('/practice/sessions/', { params: { limit: 200 } }).then((r) => r.data),
    enabled: isLoggedIn,
  });

  const { data: profile, isLoading: loadingProfile } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  const { data: learnPosts = [], isLoading: loadingLearn } = useQuery<LearnPost[]>({
    queryKey: ['learn-posts-progress'],
    queryFn: () => api.get('/learn/posts/', { params: { limit: 200 } }).then((r) => r.data),
    enabled: isLoggedIn,
  });

  const { data: roleplaySessions = [], isLoading: loadingRoleplay } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
    enabled: isLoggedIn,
  });

  const { data: badges = [], isLoading: loadingBadges } = useQuery<UserBadge[]>({
    queryKey: ['badges'],
    queryFn: () => api.get('/auth/badges/').then((r) => r.data).catch(() => []),
    enabled: isLoggedIn,
  });

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: BRAND.primary }}>
            Log in to see your progress
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Track your speech scores, practice sessions, and growth over time.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Log In →
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

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
    const existing = gameMap.get(s.game);
    if (existing) {
      existing.count += 1;
      existing.best = Math.max(existing.best, s.score);
    } else {
      gameMap.set(s.game, { count: 1, best: s.score });
    }
  }
  const gameEntries = [...gameMap.entries()].sort((a, b) => b[1].count - a[1].count);
  const uniqueGames = gameMap.size;
  const bestGameScore = gameSessions.length > 0 ? Math.max(...gameSessions.map((s) => s.score)) : 0;

  // Learn progress
  const totalLessons = learnPosts.length;
  const completedLessons = learnPosts.filter((p) => p.is_completed).length;
  const learnPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
      m.sum += s.score ?? 0;
      m.count += 1;
      modeAvgs.set(s.mode, m);
    }
    let best: [string, number] | null = null;
    for (const [mode, { sum, count }] of modeAvgs) {
      const avg = sum / count;
      if (!best || avg > best[1]) best = [mode, avg];
    }
    return best ? MODE_LABELS[best[0]] ?? best[0] : null;
  })();

  // Sparkline
  const sparkScores = sortedDone.slice(-10).map((s) => s.result!.overall_score);
  const W = 320, H = 56, PAD = 6;
  const minS = sparkScores.length > 0 ? Math.max(0, Math.min(...sparkScores) - 5) : 0;
  const maxS = sparkScores.length > 0 ? Math.min(100, Math.max(...sparkScores) + 5) : 100;
  const range = Math.max(maxS - minS, 1);
  const xStep = sparkScores.length > 1 ? (W - PAD * 2) / (sparkScores.length - 1) : W - PAD * 2;
  const polyline = sparkScores
    .map((sc, i) => {
      const x = PAD + i * xStep;
      const y = PAD + (1 - (sc - minS) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const sparkBest = sparkScores.length > 0 ? Math.max(...sparkScores) : null;
  const sparkAvg  = sparkScores.length > 0
    ? Math.round(sparkScores.reduce((a, b) => a + b, 0) / sparkScores.length)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>My Progress</h1>
          <p className="text-gray-500 mt-1">Your growth across speech, practice, and learning.</p>
        </div>

        {/* ── 1. Hero Card ─────────────────────────────────────────────── */}
        {loadingAnalysis || loadingProfile ? (
          <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)' }} />
        ) : (
          <div
            className="rounded-2xl px-7 py-7 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)' }}
          >
            {/* Left: score ring + meta */}
            <div className="flex items-center gap-5">
              {latestScore != null ? (
                <ScoreRing score={latestScore} />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white/40 text-3xl">?</span>
                </div>
              )}
              <div>
                {profile?.username && (
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-0.5">
                    @{profile.username}
                  </p>
                )}
                {latestScore != null ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-lg font-bold">Latest Score</p>
                    {delta != null && delta !== 0 && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: delta > 0 ? '#dcfce7' : '#fee2e2',
                          color: delta > 0 ? '#166534' : '#991b1b',
                        }}
                      >
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} pts
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-white text-base font-bold">No score yet</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.profile?.current_streak != null && profile.profile.current_streak > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white">
                      🔥 {profile.profile.current_streak} day streak
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white">
                    🎮 {gameSessions.length} sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-wrap gap-3 shrink-0">
              {latestScore == null ? (
                <Link
                  href="/analyze"
                  className="px-5 py-2.5 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}
                >
                  Analyze a Speech →
                </Link>
              ) : (
                <>
                  <Link
                    href="/analyze"
                    className="px-5 py-2.5 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}
                  >
                    Analyze Again →
                  </Link>
                  <Link
                    href="/analyze/history"
                    className="px-5 py-2.5 rounded-full font-bold text-sm border border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    View History →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── 2. Score Trend + Skill Breakdown ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Score Trend */}
          {loadingAnalysis ? (
            <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : sparkScores.length < 2 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[12rem]">
              <p className="text-3xl">📈</p>
              <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>Score Trend</p>
              <p className="text-xs text-gray-400">Complete 2+ analyses to see your trend chart.</p>
              <Link href="/analyze" className="text-xs font-semibold underline" style={{ color: BRAND.primary }}>
                Analyze a speech →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: '#fef9c3', color: '#92400e' }}>📈</span>
                  <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Score Trend</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Best: <span className="font-bold" style={{ color: BRAND.primary }}>{sparkBest}</span></span>
                  <span>Avg: <span className="font-bold" style={{ color: BRAND.primary }}>{sparkAvg}</span></span>
                  {delta != null && delta !== 0 && (
                    <span
                      className="font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: delta > 0 ? '#dcfce7' : '#fee2e2',
                        color: delta > 0 ? '#166534' : '#991b1b',
                      }}
                    >
                      {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                    </span>
                  )}
                </div>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                <defs>
                  <linearGradient id="progressTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#FADB43" />
                    <stop offset="100%" stopColor="#fe9940" />
                  </linearGradient>
                </defs>
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="url(#progressTrendGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {sparkScores.map((sc, i) => (
                  <circle
                    key={i}
                    cx={PAD + i * xStep}
                    cy={PAD + (1 - (sc - minS) / range) * (H - PAD * 2)}
                    r={i === sparkScores.length - 1 ? 4 : 2.5}
                    fill={i === sparkScores.length - 1 ? '#fe9940' : 'white'}
                    stroke="#fe9940"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                <span>
                  {sortedDone.length >= sparkScores.length
                    ? new Date(sortedDone[sortedDone.length - sparkScores.length].created_at)
                        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : ''}
                </span>
                <span>{sparkScores.length} sessions shown</span>
                <span>
                  {sortedDone.length > 0
                    ? new Date(sortedDone[sortedDone.length - 1].created_at)
                        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : ''}
                </span>
              </div>
            </div>
          )}

          {/* Skill Breakdown */}
          {loadingAnalysis ? (
            <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: '#dbeafe', color: '#1e40af' }}>📊</span>
                <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Skill Scores</p>
                {doneSessions.length > 0 && (
                  <span className="ml-auto text-xs text-gray-400">
                    avg of {doneSessions.length} session{doneSessions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {doneSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <p className="text-3xl">🎙️</p>
                  <p className="text-sm text-gray-400">Analyze a speech to unlock skill scores.</p>
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
                          <span
                            className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                            style={{ color: sc.color, backgroundColor: sc.bg }}
                          >
                            {score}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, backgroundColor: sc.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 3. Practice Activity ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef9c3', color: '#92400e' }}>🎮</span>
            <h2 className="font-bold text-lg" style={{ color: BRAND.primary }}>Practice Activity</h2>
          </div>
          {loadingGames ? (
            <div className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {gameSessions.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-center">
                  <p className="text-3xl">🎮</p>
                  <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>No games played yet</p>
                  <p className="text-xs text-gray-400 mb-3">Play practice games to track your progress here.</p>
                  <Link
                    href="/practice"
                    className="inline-block px-5 py-2 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}
                  >
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
                      return (
                        <Link
                          key={game}
                          href={`/practice/history?game=${game}`}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: gc.text }} />
                            <span className="text-base">{gc.emoji}</span>
                            <span className="text-sm font-semibold" style={{ color: BRAND.primary }}>{gc.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{count} session{count !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span>Best: <span className="font-bold" style={{ color: BRAND.primary }}>{best}</span></span>
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
          )}
        </section>

        {/* ── 4. Focus Areas + Learning Progress ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Focus Areas */}
          {loadingResult || loadingAnalysis ? (
            <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: '#fce7f3', color: '#9d174d' }}>🎯</span>
                <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Focus Areas</p>
              </div>
              {!latestResult || !latestResult.improvement_priorities?.length ? (
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <p className="text-3xl">🎯</p>
                  <p className="text-xs text-gray-400">
                    Complete a speech analysis to get personalized recommendations.
                  </p>
                  <Link href="/analyze" className="mt-1 text-xs font-semibold underline" style={{ color: BRAND.primary }}>
                    Analyze a speech →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {latestResult.improvement_priorities.slice(0, 4).map((priority) => {
                    const key = priority.toLowerCase();
                    const match = Object.entries(PRIORITY_LINKS).find(([k]) => key.includes(k));
                    const link = match ? match[1] : null;
                    return (
                      <div key={priority} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span>{link?.emoji ?? '💡'}</span>
                          <span className="text-sm font-medium capitalize" style={{ color: BRAND.primary }}>{priority}</span>
                        </div>
                        {link && (
                          <Link
                            href={link.href}
                            className="text-xs font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                            style={{ background: BRAND.gradient, color: BRAND.primary }}
                          >
                            Practice →
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Learning Progress */}
          {loadingLearn ? (
            <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>📚</span>
                <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Learning Progress</p>
              </div>
              {totalLessons === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <p className="text-3xl">📚</p>
                  <p className="text-xs text-gray-400">No lessons available yet.</p>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-extrabold mb-1" style={{ color: BRAND.primary }}>
                    {completedLessons}
                    <span className="text-sm font-normal text-gray-400"> / {totalLessons} lessons</span>
                  </p>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${learnPct}%`, background: BRAND.gradient }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{learnPct}% complete</p>
                  <Link
                    href="/learn"
                    className="inline-block px-5 py-2 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}
                  >
                    Continue Learning →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── 5. Roleplay Summary ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#ede9fe', color: '#6d28d9' }}>🗣️</span>
            <h2 className="font-bold text-lg" style={{ color: BRAND.primary }}>Roleplay</h2>
          </div>
          {loadingRoleplay ? (
            <div className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {roleplaySessions.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🗣️</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: BRAND.primary }}>No roleplay sessions yet</p>
                      <p className="text-xs text-gray-400">Practice AI conversations to boost your speaking skills.</p>
                    </div>
                  </div>
                  <Link
                    href="/practice/roleplay"
                    className="shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}
                  >
                    Start a roleplay →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
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
                      ⭐ Best mode: {bestMode}
                    </span>
                  )}
                  <Link
                    href="/practice/roleplay"
                    className="ml-auto text-xs font-semibold hover:underline"
                    style={{ color: BRAND.primary }}
                  >
                    Go to Roleplay →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── 6. Badges ─────────────────────────────────────────────────── */}
        <section className="pb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef3c7', color: '#78350f' }}>🏆</span>
            <h2 className="font-bold text-lg" style={{ color: BRAND.primary }}>Badges</h2>
          </div>
          {loadingBadges ? (
            <div className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : badges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-4xl mb-2">🏅</p>
              <p className="text-sm text-gray-400">Keep practicing to earn badges.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {badges.map((ub) => (
                  <div
                    key={ub.id}
                    title={ub.badge.description}
                    className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center"
                  >
                    <span className="text-3xl">{ub.badge.emoji}</span>
                    <p className="text-xs font-semibold leading-tight" style={{ color: BRAND.primary }}>
                      {ub.badge.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(ub.earned_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
