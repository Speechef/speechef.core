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
  guess: 'Guess the Word',
  memory: 'Memory Match',
  scramble: 'Word Scramble',
  blitz: 'Vocabulary Blitz',
  sentence: 'Sentence Builder',
  daily: 'Daily Challenge',
  pronunciation: 'Pronunciation',
};

const GAME_HREFS: Record<string, string> = {
  guess: '/practice/guess-the-word',
  memory: '/practice/memory-match',
  scramble: '/practice/word-scramble',
  blitz: '/practice/vocabulary-blitz',
  sentence: '/practice/sentence-builder',
  daily: '/practice/daily-challenge',
  pronunciation: '/practice/pronunciation-challenge',
};

function CalendarStrip({ sessions }: { sessions: { played_at: string }[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const activeDates = new Set(sessions.map((s) => new Date(s.played_at).toDateString()));
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex gap-2 justify-center">
      {days.map((d, i) => {
        const active = activeDates.has(d.toDateString());
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">{DAY_LABELS[d.getDay()]}</span>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                active
                  ? 'bg-[#ff6f61] text-white'
                  : isToday
                  ? 'border-2 border-[#FADB43] text-gray-300'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {active ? '✓' : d.getDate()}
            </span>
          </div>
        );
      })}
    </div>
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

  const profile = user?.profile;
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  // Derived stats
  const recentSessions = sessions.slice(0, 5);
  const totalGames = sessions.length;
  const totalScore = sessions.reduce((s, x) => s + x.score, 0);

  const allGameKeys = Object.keys(GAME_LABELS);
  const bestByGame: Record<string, number> = Object.fromEntries(allGameKeys.map((k) => [k, 0]));
  const countByGame: Record<string, number> = Object.fromEntries(allGameKeys.map((k) => [k, 0]));
  for (const s of sessions) {
    if (s.game in countByGame) {
      countByGame[s.game] = (countByGame[s.game] ?? 0) + 1;
      if (s.score > (bestByGame[s.game] ?? 0)) bestByGame[s.game] = s.score;
    }
  }

  // Roleplay stats
  const roleplayCount = roleplaySessions.length;
  const finishedRoleplays = roleplaySessions.filter((s) => s.status === 'finished' && s.score !== null);
  const roleplayAvgScore = finishedRoleplays.length > 0
    ? Math.round(finishedRoleplays.reduce((sum, s) => sum + (s.score ?? 0), 0) / finishedRoleplays.length)
    : 0;

  // Recommended: first game never played, otherwise lowest best score
  const neverPlayed = allGameKeys.find((k) => countByGame[k] === 0);
  const recommendedKey =
    neverPlayed ?? allGameKeys.reduce((a, b) => (bestByGame[a] <= bestByGame[b] ? a : b));

  // Streak risk: streak > 0 and no session played today
  const todayStr = new Date().toDateString();
  const playedToday = sessions.some(
    (s) => new Date(s.played_at).toDateString() === todayStr
  );
  const streakAtRisk = currentStreak > 0 && !playedToday;

  return (
    <div className="min-h-screen bg-white p-6">
      {streakAtRisk && (
        <div className="mb-5 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
          style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
          <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
            🔥 Your {currentStreak}-day streak is at risk! Play something today to keep it alive.
          </p>
          <Link
            href="/practice/daily-challenge"
            className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Daily Challenge →
          </Link>
        </div>
      )}
      <h4 className="text-[#141c52] font-bold mb-6">
        Welcome back{user ? `, ${user.username}` : ''}!
      </h4>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard value={totalGames} label="Games Played" />
        <StatCard value={totalScore} label="Total Score" />
        <StatCard value={currentStreak} label="Day Streak" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left / main column (2 cols wide) ── */}
        <div className="md:col-span-2 space-y-6">

          {/* Recent Games */}
          <Section title="Recent Games">
            {recentSessions.length > 0 ? (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Game</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2">{GAME_LABELS[s.game]}</td>
                        <td className="py-2 font-bold">{s.score}</td>
                        <td className="py-2 text-gray-400">
                          {new Date(s.played_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link
                  href="/practice"
                  className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                >
                  Play more games →
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No games played yet.</p>
                <Link
                  href="/practice"
                  className="bg-[#FADB43] text-[#141c52] font-semibold px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Start Playing
                </Link>
              </div>
            )}
          </Section>

          {/* Recommended */}
          <Section title="Recommended for You">
            <p className="text-sm text-gray-500 mb-2">Based on your scores, try improving at:</p>
            <p className="font-semibold text-[#141c52] mb-3">{GAME_LABELS[recommendedKey]}</p>
            <Link
              href={GAME_HREFS[recommendedKey]}
              className="bg-[#FADB43] text-[#141c52] font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm"
            >
              Play Now
            </Link>
          </Section>

          {/* Per-game stats */}
          <Section title="Game Stats">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(GAME_LABELS).map(([key, name]) => (
                <Link key={key} href={GAME_HREFS[key]}
                  className="bg-white rounded-lg p-3 text-center shadow-sm border hover:border-[#141c52] transition-colors">
                  <p className="text-xs text-gray-500 truncate">{name}</p>
                  <p className="text-2xl font-bold text-[#141c52]">{countByGame[key] ?? 0}</p>
                  <p className="text-xs text-gray-500">Best: {bestByGame[key] ?? 0}</p>
                </Link>
              ))}
              <Link href="/practice/roleplay"
                className="bg-white rounded-lg p-3 text-center shadow-sm border hover:border-[#141c52] transition-colors">
                <p className="text-xs text-gray-500 truncate">🎭 Role Play</p>
                <p className="text-2xl font-bold text-[#141c52]">{roleplayCount}</p>
                <p className="text-xs text-gray-500">Avg: {roleplayAvgScore > 0 ? roleplayAvgScore : '—'}</p>
              </Link>
            </div>
          </Section>

        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Communication Scorecard */}
          <ScorecardWidget />

          {/* Daily Streak */}
          <Section title="Daily Streak">
            <div className="text-center">
              <CalendarStrip sessions={sessions} />
              <p className="mt-3 text-sm text-gray-500">
                🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''} &bull; Best: {longestStreak}
              </p>
            </div>
          </Section>

          {/* Personal Best */}
          {sessions.length > 0 && (() => {
            const best = sessions.reduce((a, b) => (a.score >= b.score ? a : b));
            return (
              <Section title="Personal Best">
                <div className="text-center">
                  <p className="text-4xl font-extrabold mb-1" style={{ color: '#141c52' }}>{best.score}</p>
                  <p className="text-xs text-gray-400 mb-1">{GAME_LABELS[best.game]}</p>
                  <p className="text-xs text-gray-300">
                    {new Date(best.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Section>
            );
          })()}

          {/* Quick Links */}
          <Section title="Quick Links">
            <div className="flex flex-col gap-2">
              {[
                { href: '/practice/daily-challenge', label: '🔥 Daily Challenge' },
                { href: '/practice/vocabulary-blitz', label: '⚡ Vocabulary Blitz' },
                { href: '/practice/sentence-builder', label: '✍️ Sentence Builder' },
                { href: '/practice/pronunciation-challenge', label: '🎙️ Pronunciation' },
                { href: '/practice/roleplay', label: '🎭 AI Role Play' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-center border border-blue-500 text-blue-600 text-sm rounded-lg py-2 hover:bg-blue-50"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/practice/leaderboard"
                className="text-center border border-gray-400 text-gray-600 text-sm rounded-lg py-2 hover:bg-gray-50"
              >
                Leaderboard
              </Link>
              <Link
                href="/learn"
                className="text-center border border-gray-400 text-gray-600 text-sm rounded-lg py-2 hover:bg-gray-50"
              >
                Learning Posts
              </Link>
              <Link
                href="/jobs/applications"
                className="text-center border border-gray-400 text-gray-600 text-sm rounded-lg py-2 hover:bg-gray-50"
              >
                My Applications
              </Link>
            </div>
          </Section>

          {/* Expert + Mentor Quick Links */}
          <Section title="Get Coached">
            <div className="flex flex-col gap-2">
              <Link href="/review"
                className="text-center border-2 text-sm rounded-lg py-2 font-semibold hover:opacity-90 transition-opacity"
                style={{ borderColor: '#141c52', color: '#141c52', background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
                Expert Panel Review →
              </Link>
              <Link href="/mentors"
                className="text-center border border-gray-400 text-gray-600 text-sm rounded-lg py-2 hover:bg-gray-50">
                Find a Mentor
              </Link>
              <Link href="/practice/test-prep"
                className="text-center border border-gray-400 text-gray-600 text-sm rounded-lg py-2 hover:bg-gray-50">
                Test Prep (IELTS / TOEFL)
              </Link>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-[#e8f4fa] rounded-lg p-4 text-center">
      <p className="text-3xl font-bold text-[#141c52]">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#e8f4fa] rounded-lg p-5">
      <h6 className="font-semibold text-[#141c52] mb-3">{title}</h6>
      {children}
    </div>
  );
}
