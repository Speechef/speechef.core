'use client';
import { Suspense } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

interface LeaderboardEntry {
  user__username: string;
  total_score: number;
  games_played: number;
}

const GAME_FILTERS = [
  { label: 'All Games', value: '' },
  { label: 'Guess the Word', value: 'guess' },
  { label: 'Memory Match', value: 'memory' },
  { label: 'Word Scramble', value: 'scramble' },
  { label: 'Vocabulary Blitz', value: 'blitz' },
  { label: 'Sentence Builder', value: 'sentence' },
  { label: 'Daily Challenge', value: 'daily' },
  { label: 'Pronunciation', value: 'pronunciation' },
];

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const game = searchParams.get('game') ?? '';
  const { isLoggedIn } = useAuthStore();

  function setGame(value: string) {
    const url = value ? `/practice/leaderboard?game=${value}` : '/practice/leaderboard';
    router.push(url);
  }

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', game],
    queryFn: () =>
      api.get(`/practice/leaderboard/${game ? `?game=${game}` : ''}`).then((r) => r.data),
  });

  const { data: profile } = useQuery<{ username: string }>({
    queryKey: ['profile'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const currentUsername = profile?.username;

  const myEntry = currentUsername
    ? entries.find((e) => e.user__username === currentUsername)
    : null;
  const myRank = currentUsername
    ? entries.findIndex((e) => e.user__username === currentUsername) + 1
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">← Practice</Link>
            <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>Leaderboard</h1>
            <p className="text-gray-500 text-sm mt-1">Top players across all word games.</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {GAME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setGame(f.value)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
              style={
                game === f.value
                  ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                  : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Personal rank banner */}
        {myEntry && myRank > 0 && (
          <div
            className="rounded-xl px-5 py-4 mb-4 flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <div className="text-center">
                  <p className="text-2xl font-black">#{myRank}</p>
                  <p className="text-xs text-white/60">Your Rank</p>
                </div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black">{myEntry.total_score}</p>
                <p className="text-xs text-white/60">Total Score</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black">{myEntry.games_played}</p>
                <p className="text-xs text-white/60">Games</p>
              </div>
            </div>
            <Link href="/practice/history"
              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}>
              My History →
            </Link>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🏆</p>
              <p className="font-semibold text-lg mb-1" style={{ color: BRAND.primary }}>No scores yet</p>
              <p className="text-gray-400 text-sm mb-5">Be the first to play and claim the top spot!</p>
              <Link href="/practice"
                className="inline-block px-6 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: BRAND.gradient, color: BRAND.primary }}>
                Play Now →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: '#f9fafb' }}>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Player</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500">Score</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500">Games</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isMe = currentUsername && entry.user__username === currentUsername;
                  return (
                    <tr
                      key={entry.user__username}
                      className="border-b last:border-0"
                      style={isMe ? { backgroundColor: '#eef0fa' } : undefined}
                    >
                      <td className="px-5 py-3 text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-5 py-3 font-medium" style={{ color: BRAND.primary }}>
                        {i === 0 && '🥇 '}
                        {i === 1 && '🥈 '}
                        {i === 2 && '🥉 '}
                        <span className={isMe ? 'font-bold' : ''}>{entry.user__username}</span>
                        {isMe && (
                          <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: BRAND.primary, color: '#FADB43' }}>
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-bold" style={{ color: BRAND.primary }}>
                        {entry.total_score}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-400">{entry.games_played}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardContent />
    </Suspense>
  );
}
