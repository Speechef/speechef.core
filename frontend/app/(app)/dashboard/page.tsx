'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

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
  game: 'guess' | 'memory' | 'scramble';
  score: number;
  played_at: string;
}

const GAME_LABELS: Record<string, string> = {
  guess: 'Guess the Word',
  memory: 'Memory Match',
  scramble: 'Word Scramble',
};

const GAME_HREFS: Record<string, string> = {
  guess: '/practice/guess-the-word',
  memory: '/practice/memory-match',
  scramble: '/practice/word-scramble',
};

function StreakCircles({ current }: { current: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className={`inline-block w-5 h-5 rounded-full ${
            i < Math.min(current, 7) ? 'bg-[#ff6f61]' : 'bg-gray-300'
          }`}
        />
      ))}
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

  const profile = user?.profile;
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  // Derived stats
  const recentSessions = sessions.slice(0, 5);
  const totalGames = sessions.length;
  const totalScore = sessions.reduce((s, x) => s + x.score, 0);

  const bestByGame: Record<string, number> = { guess: 0, memory: 0, scramble: 0 };
  const countByGame: Record<string, number> = { guess: 0, memory: 0, scramble: 0 };
  for (const s of sessions) {
    countByGame[s.game] = (countByGame[s.game] ?? 0) + 1;
    if (s.score > (bestByGame[s.game] ?? 0)) bestByGame[s.game] = s.score;
  }

  // Recommended: first game never played, otherwise lowest best score
  const neverPlayed = Object.keys(countByGame).find((k) => countByGame[k] === 0);
  const recommendedKey =
    neverPlayed ?? Object.keys(bestByGame).reduce((a, b) => (bestByGame[a] <= bestByGame[b] ? a : b));

  return (
    <div className="min-h-screen bg-white p-6">
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
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(GAME_LABELS).map(([key, name]) => (
                <div key={key} className="bg-white rounded-lg p-3 text-center shadow-sm border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{name}</p>
                  <p className="text-2xl font-bold text-[#141c52]">{countByGame[key] ?? 0}</p>
                  <p className="text-xs text-gray-500">played · Best: {bestByGame[key] ?? 0}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Video upload — Coming Soon */}
          <Section
            title={
              <span>
                Your Videos{' '}
                <span className="text-xs bg-[#FADB43] text-[#141c52] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ml-1">
                  Coming Soon
                </span>
              </span>
            }
          >
            <p className="text-sm text-gray-500 text-center py-2">
              Video upload and peer review will be available in a future update.
            </p>
          </Section>

        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Daily Streak */}
          <Section title="Daily Streak">
            <div className="text-center">
              <StreakCircles current={currentStreak} />
              <p className="mt-2 text-sm text-gray-500">
                {currentStreak} day{currentStreak !== 1 ? 's' : ''} &bull; Best: {longestStreak}
              </p>
            </div>
          </Section>

          {/* Quick Links */}
          <Section title="Quick Links">
            <div className="flex flex-col gap-2">
              {Object.entries(GAME_HREFS).map(([key, href]) => (
                <Link
                  key={key}
                  href={href}
                  className="text-center border border-blue-500 text-blue-600 text-sm rounded-lg py-2 hover:bg-blue-50"
                >
                  {GAME_LABELS[key]}
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
            </div>
          </Section>

          {/* Experts — Coming Soon */}
          <Section
            title={
              <span>
                Experts{' '}
                <span className="text-xs bg-[#FADB43] text-[#141c52] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ml-1">
                  Coming Soon
                </span>
              </span>
            }
          >
            <p className="text-sm text-gray-500 text-center py-2">
              Connect with expert tutors — available soon.
            </p>
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
