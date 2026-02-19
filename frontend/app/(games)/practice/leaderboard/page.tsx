'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

interface LeaderboardEntry {
  username: string;
  total_score: number;
  sessions: number;
}

const GAME_FILTERS = [
  { label: 'All Games', value: '' },
  { label: 'Guess the Word', value: 'guess' },
  { label: 'Memory Match', value: 'memory' },
  { label: 'Word Scramble', value: 'scramble' },
];

export default function LeaderboardPage() {
  const [game, setGame] = useState('');

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', game],
    queryFn: () =>
      api.get(`/practice/leaderboard/${game ? `?game=${game}` : ''}`).then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: '#141c52' }}>
            Leaderboard
          </h1>
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">
            ← Games
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {GAME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setGame(f.value)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                game === f.value
                  ? { backgroundColor: '#141c52', color: '#fff' }
                  : { backgroundColor: '#e5e7eb', color: '#374151' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {isLoading ? (
            <p className="text-center text-gray-400 py-10">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No scores yet. Be the first to play!</p>
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
                {entries.map((entry, i) => (
                  <tr key={entry.username} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-3 font-medium" style={{ color: '#141c52' }}>
                      {i === 0 && '🥇 '}
                      {i === 1 && '🥈 '}
                      {i === 2 && '🥉 '}
                      {entry.username}
                    </td>
                    <td className="px-5 py-3 text-right font-bold" style={{ color: '#141c52' }}>
                      {entry.total_score}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400">{entry.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
