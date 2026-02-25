'use client';

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

function CalendarStrip({ sessions, streak }: { sessions: { played_at: string }[]; streak: number }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const activeDates = new Set(sessions.map((s) => new Date(s.played_at).toDateString()));
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex gap-1.5 justify-between">
      {days.map((d, i) => {
        const active  = activeDates.has(d.toDateString());
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] text-gray-400 font-medium">{DAY_LABELS[d.getDay()]}</span>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                active
                  ? 'text-white shadow-sm'
                  : isToday
                  ? 'border-2 border-[#FADB43] text-gray-400'
                  : 'bg-gray-100 text-gray-300'
              }`}
              style={active ? { background: 'linear-gradient(135deg,#ff6f61,#ff9a44)' } : undefined}
            >
              {active ? '✓' : d.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#166534' : score >= 50 ? '#92400e' : '#991b1b';
  const bg    = score >= 80 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      {score}
    </span>
  );
}

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

  const profile        = user?.profile;
  const currentStreak  = profile?.current_streak ?? 0;
  const longestStreak  = profile?.longest_streak ?? 0;
  const recentSessions = sessions.slice(0, 6);
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

  const roleplayCount    = roleplaySessions.length;
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero strip ── */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg,#141c52 0%,#1e2d78 60%,#162560 100%)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-white/50 text-sm mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-extrabold text-white">
              {greeting()}{user ? `, ${user.username}` : ''}!
            </h1>
            <p className="text-white/60 text-sm mt-1">Here's your Speechef overview.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {currentStreak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span className="text-lg">🔥</span>
                <div>
                  <p className="text-white font-bold text-sm leading-none">{currentStreak} day streak</p>
                  <p className="text-white/50 text-xs mt-0.5">Best: {longestStreak}</p>
                </div>
              </div>
            )}
            {streakAtRisk && (
              <Link
                href="/practice/daily-challenge"
                className="text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                🎯 Play today →
              </Link>
            )}
            {!streakAtRisk && (
              <Link
                href="/practice"
                className="text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Practice →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* ── Stat bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🎮', value: totalGames, label: 'Games Played', sub: 'all time' },
            { icon: '⭐', value: totalScore.toLocaleString(), label: 'Total Score', sub: 'cumulative' },
            { icon: '🔥', value: currentStreak, label: 'Day Streak', sub: `Best: ${longestStreak}` },
            { icon: '🎭', value: roleplayCount, label: 'Role Play', sub: roleplayAvgScore > 0 ? `Avg: ${roleplayAvgScore}` : 'No sessions yet' },
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

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3) ── */}
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

            {/* Recommended + Game Stats side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Recommended */}
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
                        style={{
                          width: `${bestByGame[recommendedKey]}%`,
                          background: 'linear-gradient(to right,#FADB43,#fe9940)',
                        }} />
                    </div>
                  </div>
                )}
                <Link href={GAME_HREFS[recommendedKey]}
                  className="block w-full text-center text-sm font-bold py-2 rounded-full transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                  Play Now →
                </Link>
              </Card>

              {/* Personal Best */}
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
                            style={{
                              width: `${bestByGame[key]}%`,
                              background: 'linear-gradient(to right,#FADB43,#fe9940)',
                            }} />
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
                          style={{
                            width: `${roleplayAvgScore}%`,
                            background: 'linear-gradient(to right,#FADB43,#fe9940)',
                          }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Avg: {roleplayAvgScore}</p>
                    </>
                  )}
                </Link>
              </div>
            </Card>

          </div>

          {/* ── Right column (1/3) ── */}
          <div className="space-y-6">

            {/* Scorecard */}
            <ScorecardWidget />

            {/* 7-day streak calendar */}
            <Card title="Daily Streak">
              <CalendarStrip sessions={sessions} streak={currentStreak} />
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-[#141c52]">{currentStreak}</p>
                  <p className="text-xs text-gray-400">Current</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-lg font-extrabold text-[#141c52]">{longestStreak}</p>
                  <p className="text-xs text-gray-400">Best</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-lg font-extrabold text-[#141c52]">
                    {sessions.filter((s) => new Date(s.played_at).toDateString() === todayStr).length}
                  </p>
                  <p className="text-xs text-gray-400">Today</p>
                </div>
              </div>
            </Card>

            {/* Quick play */}
            <Card title="Quick Play">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: '/practice/daily-challenge',      label: 'Daily Challenge', emoji: '🔥' },
                  { href: '/practice/vocabulary-blitz',     label: 'Vocab Blitz',     emoji: '⚡' },
                  { href: '/practice/sentence-builder',     label: 'Sentences',       emoji: '✍️' },
                  { href: '/practice/pronunciation-challenge', label: 'Pronunciation', emoji: '🎙️' },
                  { href: '/practice/roleplay',             label: 'AI Role Play',    emoji: '🎭' },
                  { href: '/practice/memory-match',         label: 'Memory Match',    emoji: '🃏' },
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
                    <p className="text-gray-400 text-xs">IELTS · TOEFL · PTE</p>
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

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
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
