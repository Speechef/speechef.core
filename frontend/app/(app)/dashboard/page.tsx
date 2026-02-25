'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import ScorecardWidget from '@/components/dashboard/ScorecardWidget';

interface Profile {
  image: string;
  current_streak: number;
  longest_streak: number;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile: Profile;
}

interface GameSession {
  id: number;
  game: 'guess' | 'memory' | 'scramble' | 'blitz' | 'sentence' | 'daily' | 'pronunciation';
  score: number;
  played_at: string;
}

interface RolePlaySession {
  id: number;
  status: string;
  score: number | null;
}

interface AnalysisSession {
  id: string;
  status: string;
  created_at: string;
  result?: {
    overall_score: number;
    fluency_score: number;
    vocabulary_score: number;
    pace_wpm: number;
  };
}

const GAME_LABELS: Record<string, string> = {
  guess:         'Guess the Word',
  memory:        'Memory Match',
  scramble:      'Word Scramble',
  blitz:         'Vocabulary Blitz',
  sentence:      'Sentence Builder',
  daily:         'Daily Challenge',
  pronunciation: 'Pronunciation',
};

const GAME_EMOJIS: Record<string, string> = {
  guess:         '🧠',
  memory:        '🃏',
  scramble:      '🔤',
  blitz:         '⚡',
  sentence:      '✍️',
  daily:         '🔥',
  pronunciation: '🎙️',
};

const GAME_HREFS: Record<string, string> = {
  guess:         '/practice/guess-the-word',
  memory:        '/practice/memory-match',
  scramble:      '/practice/word-scramble',
  blitz:         '/practice/vocabulary-blitz',
  sentence:      '/practice/sentence-builder',
  daily:         '/practice/daily-challenge',
  pronunciation: '/practice/pronunciation-challenge',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ──────────────────────────────────────────────────── ScoreGauge (like DashboardPreview)
function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ * 0.75;
  const offset = circ * 0.25;

  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-[135deg]">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={offset}
          strokeLinecap="round" />
        <circle cx="72" cy="72" r={r} fill="none"
          stroke="url(#dashGaugeGrad)" strokeWidth="10"
          strokeDasharray={`${progress} ${circ - progress}`}
          strokeDashoffset={offset} strokeLinecap="round" />
        <defs>
          <linearGradient id="dashGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{score}</div>
        <div className="text-xs text-gray-400">/ 100</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────── Activity Heatmap (like DashboardPreview)
function ActivityHeatmap({ sessions }: { sessions: { played_at: string }[] }) {
  const COLS = 14; // 14 weeks
  const grid = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const s of sessions) {
      const key = new Date(s.played_at).toDateString();
      countMap[key] = (countMap[key] || 0) + 1;
    }
    // Start from the Sunday of (COLS) weeks ago
    const today = new Date();
    const startOffset = today.getDay() + (COLS - 1) * 7;
    const start = new Date(today);
    start.setDate(today.getDate() - startOffset);
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => {
        const d = new Date(start);
        d.setDate(start.getDate() + row + col * 7);
        const count = countMap[d.toDateString()] ?? 0;
        return count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
      })
    );
  }, [sessions]);

  const totalActiveDays = useMemo(() => {
    const s = new Set(sessions.map((s) => new Date(s.played_at).toDateString()));
    return s.size;
  }, [sessions]);

  return (
    <div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {grid.map((row, ri) =>
          row.map((val, ci) => (
            <div
              key={`${ri}-${ci}`}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor:
                  val === 0 ? '#f3f4f6'
                  : val === 1 ? '#fef08a'
                  : val === 2 ? '#fadb43'
                  : '#fe9940',
              }}
            />
          ))
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{totalActiveDays} active days</p>
    </div>
  );
}

// ──────────────────────────────────────────────────── ScorePill
function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#166534' : score >= 50 ? '#92400e' : '#991b1b';
  const bg    = score >= 80 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      {score}
    </span>
  );
}

// ──────────────────────────────────────────────────── SkillBar
function SkillBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium" style={{ color: '#141c52' }}>{label}</span>
        <span className="text-gray-400">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────── Score Trend Sparkline
function ScoreTrend({ sessions }: { sessions: AnalysisSession[] }) {
  const dataPoints = sessions
    .filter((s) => s.status === 'done' && s.result)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-8)
    .map((s) => s.result!.overall_score);

  if (dataPoints.length < 2) {
    return (
      <p className="text-xs text-gray-400 text-center py-3">
        Analyze 2+ recordings to see your score trend.
      </p>
    );
  }

  const min = Math.min(...dataPoints);
  const max = Math.max(...dataPoints);
  const range = Math.max(max - min, 1);
  const W = 240, H = 56, PAD = 6;
  const xStep = (W - PAD * 2) / (dataPoints.length - 1);

  const points = dataPoints
    .map((score, i) => {
      const x = PAD + i * xStep;
      const y = PAD + (1 - (score - min) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const lastScore = dataPoints[dataPoints.length - 1];
  const delta = lastScore - dataPoints[dataPoints.length - 2];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">Last {dataPoints.length} analyses</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: delta >= 0 ? '#dcfce7' : '#fee2e2',
            color: delta >= 0 ? '#166534' : '#991b1b',
          }}
        >
          {delta >= 0 ? '+' : ''}{delta} pts
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="url(#trendGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {dataPoints.map((score, i) => (
          <circle
            key={i}
            cx={PAD + i * xStep}
            cy={PAD + (1 - (score - min) / range) * (H - PAD * 2)}
            r={i === dataPoints.length - 1 ? 4 : 2.5}
            fill={i === dataPoints.length - 1 ? '#fe9940' : 'white'}
            stroke="#fe9940"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Min: {min}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────── Card wrapper
function Card({
  title, children, action,
}: {
  title: string; children: React.ReactNode; action?: { label: string; href: string };
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#141c52]">{title}</h2>
        {action && (
          <Link href={action.href} className="text-xs font-semibold text-indigo-600 hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────── Main page
export default function DashboardPage() {
  const { data: user } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/practice/sessions/').then((r) => r.data),
  });

  const { data: roleplaySessions = [] } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  // Analysis data — same queryKey as ScorecardWidget so TanStack Query shares cache
  const { data: analysisSessions = [] } = useQuery<AnalysisSession[]>({
    queryKey: ['analysis-sessions-widget'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data).catch(() => []),
    retry: false,
  });
  const latestAnalysis = analysisSessions.find((s) => s.status === 'done');
  const analysisData   = latestAnalysis?.result;

  const profile        = user?.profile;
  const currentStreak  = profile?.current_streak ?? 0;
  const longestStreak  = profile?.longest_streak ?? 0;
  const recentSessions = sessions.slice(0, 5);
  const totalGames     = sessions.length;
  const totalScore     = sessions.reduce((s, x) => s + x.score, 0);

  const allGameKeys = Object.keys(GAME_LABELS);
  const bestByGame: Record<string, number>  = Object.fromEntries(allGameKeys.map((k) => [k, 0]));
  const countByGame: Record<string, number> = Object.fromEntries(allGameKeys.map((k) => [k, 0]));
  for (const s of sessions) {
    if (s.game in countByGame) {
      countByGame[s.game] = (countByGame[s.game] ?? 0) + 1;
      if (s.score > (bestByGame[s.game] ?? 0)) bestByGame[s.game] = s.score;
    }
  }

  const roleplayCount     = roleplaySessions.length;
  const finishedRoleplays = roleplaySessions.filter((s) => s.status === 'finished' && s.score !== null);
  const roleplayAvgScore  = finishedRoleplays.length > 0
    ? Math.round(finishedRoleplays.reduce((sum, s) => sum + (s.score ?? 0), 0) / finishedRoleplays.length)
    : 0;

  const neverPlayed    = allGameKeys.find((k) => countByGame[k] === 0);
  const recommendedKey = neverPlayed ?? allGameKeys.reduce((a, b) => (bestByGame[a] <= bestByGame[b] ? a : b));

  const todayStr    = new Date().toDateString();
  const playedToday = sessions.some((s) => new Date(s.played_at).toDateString() === todayStr);
  const streakAtRisk = currentStreak > 0 && !playedToday;

  const personalBest = sessions.length > 0
    ? sessions.reduce((a, b) => (a.score >= b.score ? a : b))
    : null;

  // Communication score — from analysis or derive from game avg
  const commScore = analysisData?.overall_score
    ?? (sessions.length > 0 ? Math.min(99, Math.round(totalScore / Math.max(1, sessions.length))) : 0);

  // Skills — from analysis + game bests
  const paceScore = analysisData
    ? Math.min(100, Math.round(((analysisData.pace_wpm ?? 0) / 180) * 100))
    : bestByGame['blitz'] ?? 0;

  const skills = [
    { label: 'Fluency',       score: analysisData?.fluency_score    ?? bestByGame['guess']         ?? 0, color: '#FADB43' },
    { label: 'Vocabulary',    score: analysisData?.vocabulary_score ?? bestByGame['blitz']         ?? 0, color: '#fe9940' },
    { label: 'Pronunciation', score: bestByGame['pronunciation']    ?? 0,                               color: '#FADB43' },
    { label: 'Grammar',       score: bestByGame['sentence']         ?? 0,                               color: '#fe9940' },
    { label: 'Pace',          score: paceScore,                                                          color: '#FADB43' },
    { label: 'Confidence',    score: roleplayAvgScore > 0 ? roleplayAvgScore : (bestByGame['daily'] ?? 0), color: '#fe9940' },
  ];

  // Milestone
  const targetScore = 85;
  const milestoneProgress = Math.min(100, Math.round((commScore / targetScore) * 100));
  const milestoneReached  = commScore >= targetScore;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero header — clean white with gradient accent ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-gray-400 text-sm mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-extrabold" style={{ color: '#141c52' }}>
              {greeting()}{user ? `, ${user.username}` : ''}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's your Speechef overview.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {currentStreak > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ borderColor: 'rgba(250,219,67,0.4)', backgroundColor: 'rgba(250,219,67,0.08)' }}
              >
                <span className="text-lg">🔥</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#141c52' }}>{currentStreak} day streak</p>
                  <p className="text-gray-400 text-xs">Best: {longestStreak}</p>
                </div>
              </div>
            )}
            {streakAtRisk ? (
              <Link
                href="/practice/daily-challenge"
                className="text-sm font-bold px-5 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                🎯 Play today →
              </Link>
            ) : (
              <Link
                href="/practice"
                className="text-sm font-bold px-5 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Practice Now →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* ── Overview section — 3-column like DashboardPreview ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Col 1: Score gauge + activity heatmap */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Communication Score
              </p>
              <ScoreGauge score={commScore} />
              {latestAnalysis && (
                <p className="mt-3 text-xs text-gray-400">
                  Last analyzed {new Date(latestAnalysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
              {!analysisData && sessions.length === 0 && (
                <p className="mt-2 text-xs text-gray-400">Play games to build your score</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Practice Activity
              </p>
              <ActivityHeatmap sessions={sessions} />
              {currentStreak > 0 && (
                <p className="text-xs text-gray-400 text-right mt-0.5">{currentStreak}-day streak 🔥</p>
              )}
            </div>
          </div>

          {/* Col 2: Skill breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Skill Breakdown
            </p>
            <div className="space-y-3">
              {skills.map((s) => (
                <SkillBar key={s.label} label={s.label} score={s.score} color={s.color} />
              ))}
            </div>
            {skills.every((s) => s.score === 0) && (
              <p className="text-xs text-gray-400 text-center mt-4">
                Play games or analyze your speech to see skills.
              </p>
            )}
            {skills.some((s) => s.score > 0) && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Top priority to improve:</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#141c52' }}>
                  {skills
                    .filter((s) => s.score > 0)
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 2)
                    .map((s) => s.label)
                    .join(' · ') || '—'}
                </p>
              </div>
            )}
          </div>

          {/* Col 3: Recent sessions + milestone */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent Sessions</p>
                <Link href="/practice/history" className="text-xs font-semibold text-indigo-600 hover:underline">
                  History →
                </Link>
              </div>
              {recentSessions.length > 0 ? (
                <div className="space-y-0">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{GAME_EMOJIS[s.game] ?? '🎮'}</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#141c52' }}>
                            {GAME_LABELS[s.game] ?? s.game}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(s.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <ScorePill score={s.score} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No sessions yet.</p>
              )}
            </div>

            {/* Milestone card — like DashboardPreview */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg,#141c52 0%,#1e2d78 100%)' }}
            >
              <p className="text-xs font-semibold text-gray-300 mb-1">
                {milestoneReached ? '🏆 Milestone reached!' : 'Next milestone'}
              </p>
              <p className="text-white font-bold text-sm mb-3">
                {milestoneReached
                  ? `You've hit ${targetScore}+ — Expert level!`
                  : `Score ${targetScore} to unlock Expert badge`}
              </p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${milestoneProgress}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1.5 text-right">{commScore} / {targetScore}</p>
            </div>
          </div>
        </div>

        {/* ── Stat bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎮', value: totalGames,                label: 'Games Played',  sub: 'all time' },
            { icon: '⭐', value: totalScore.toLocaleString(), label: 'Total Score',   sub: 'cumulative' },
            { icon: '🔥', value: currentStreak,              label: 'Day Streak',    sub: `Best: ${longestStreak}` },
            { icon: '🎭', value: roleplayCount,              label: 'Role Play',     sub: roleplayAvgScore > 0 ? `Avg: ${roleplayAvgScore}` : 'No sessions yet' },
          ].map(({ icon, value, label, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Activity */}
            <Card title="Recent Activity" action={{ label: 'View history →', href: '/practice/history' }}>
              {recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {recentSessions.map((s) => (
                    <div key={s.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-xl w-8 text-center shrink-0">{GAME_EMOJIS[s.game] ?? '🎮'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#141c52] truncate">{GAME_LABELS[s.game] ?? s.game}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(s.played_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <ScorePill score={s.score} />
                    </div>
                  ))}
                  <Link href="/practice" className="block text-center text-xs font-semibold text-indigo-600 hover:underline mt-2">
                    Play more games →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🎮</p>
                  <p className="text-gray-500 text-sm mb-4">No games played yet. Start your journey!</p>
                  <Link href="/practice"
                    className="inline-block text-sm font-bold px-5 py-2 rounded-full transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                    Start Playing →
                  </Link>
                </div>
              )}
            </Card>

            {/* Recommended + Personal Best */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card title="Recommended">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{GAME_EMOJIS[recommendedKey] ?? '🎮'}</span>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {countByGame[recommendedKey] === 0 ? 'Never played' : 'Needs improvement'}
                    </p>
                    <p className="font-bold text-[#141c52]">{GAME_LABELS[recommendedKey]}</p>
                  </div>
                </div>
                {countByGame[recommendedKey] > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Best score</span>
                      <span className="font-bold text-[#141c52]">{bestByGame[recommendedKey]}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${bestByGame[recommendedKey]}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                    </div>
                  </div>
                )}
                <Link href={GAME_HREFS[recommendedKey]}
                  className="block w-full text-center text-sm font-bold py-2 rounded-full transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                  Play Now →
                </Link>
              </Card>

              <Card title="Personal Best">
                {personalBest ? (
                  <div className="text-center">
                    <p className="text-5xl font-extrabold mb-1" style={{ color: '#141c52' }}>
                      {personalBest.score}
                    </p>
                    <p className="text-xs text-gray-400 mb-0.5">out of 100</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="text-lg">{GAME_EMOJIS[personalBest.game] ?? '🎮'}</span>
                      <p className="text-sm font-semibold text-[#141c52]">{GAME_LABELS[personalBest.game]}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(personalBest.played_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Play a game to set your first personal best.
                  </div>
                )}
              </Card>
            </div>

            {/* Game Stats */}
            <Card title="Game Stats" action={{ label: 'Full history →', href: '/practice/history' }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allGameKeys.map((key) => (
                  <Link key={key} href={GAME_HREFS[key]}
                    className="group bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-xl p-3 transition-all">
                    <div className="text-xl mb-1">{GAME_EMOJIS[key]}</div>
                    <p className="text-xs text-gray-500 truncate leading-tight mb-2">{GAME_LABELS[key]}</p>
                    <p className="text-2xl font-extrabold text-[#141c52] leading-none">{countByGame[key]}</p>
                    {bestByGame[key] > 0 && (
                      <>
                        <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: `${bestByGame[key]}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Best: {bestByGame[key]}</p>
                      </>
                    )}
                  </Link>
                ))}
                <Link href="/practice/roleplay"
                  className="group bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-xl p-3 transition-all">
                  <div className="text-xl mb-1">🎭</div>
                  <p className="text-xs text-gray-500 truncate leading-tight mb-2">Role Play</p>
                  <p className="text-2xl font-extrabold text-[#141c52] leading-none">{roleplayCount}</p>
                  {roleplayAvgScore > 0 && (
                    <>
                      <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${roleplayAvgScore}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Avg: {roleplayAvgScore}</p>
                    </>
                  )}
                </Link>
              </div>
            </Card>

          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Communication Scorecard */}
            <ScorecardWidget />

            {/* Score Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Score Trend</p>
              <ScoreTrend sessions={analysisSessions} />
            </div>

            {/* Quick Play */}
            <Card title="Quick Play">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: '/practice/daily-challenge',         label: 'Daily Challenge', emoji: '🔥' },
                  { href: '/practice/vocabulary-blitz',        label: 'Vocab Blitz',     emoji: '⚡' },
                  { href: '/practice/sentence-builder',        label: 'Sentences',       emoji: '✍️' },
                  { href: '/practice/pronunciation-challenge', label: 'Pronunciation',   emoji: '🎙️' },
                  { href: '/practice/roleplay',                label: 'AI Role Play',    emoji: '🎭' },
                  { href: '/practice/memory-match',            label: 'Memory Match',    emoji: '🃏' },
                ].map(({ href, label, emoji }) => (
                  <Link key={href} href={href}
                    className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all text-center">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs font-medium text-[#141c52] leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
              <Link href="/practice/leaderboard"
                className="block text-center mt-3 text-xs font-semibold py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                🏆 Leaderboard
              </Link>
            </Card>

            {/* Get Coached */}
            <Card title="Get Coached">
              <div className="space-y-2">
                <Link href="/review"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}>
                  <span className="text-lg">🎓</span>
                  <div>
                    <p className="font-bold text-sm">Expert Panel Review</p>
                    <p className="text-white/60 text-xs">Get scored by real coaches</p>
                  </div>
                </Link>
                <Link href="/mentors"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#141c52] hover:bg-gray-50 transition-all text-sm">
                  <span className="text-lg">🧑‍🏫</span>
                  <div>
                    <p className="font-semibold text-[#141c52] text-sm">Find a Mentor</p>
                    <p className="text-gray-400 text-xs">1-on-1 video coaching</p>
                  </div>
                </Link>
                <Link href="/practice/test-prep"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#141c52] hover:bg-gray-50 transition-all text-sm">
                  <span className="text-lg">📝</span>
                  <div>
                    <p className="font-semibold text-[#141c52] text-sm">Test Prep</p>
                    <p className="text-gray-400 text-xs">IELTS · TOEFL · PTE · OET</p>
                  </div>
                </Link>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
