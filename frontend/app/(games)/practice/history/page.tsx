'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface GameSession {
  id: number;
  game: string;
  score: number;
  played_at: string;
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

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Guess', value: 'guess' },
  { label: 'Memory', value: 'memory' },
  { label: 'Scramble', value: 'scramble' },
  { label: 'Blitz', value: 'blitz' },
  { label: 'Sentence', value: 'sentence' },
  { label: 'Daily', value: 'daily' },
  { label: 'Pronunciation', value: 'pronunciation' },
];

export default function GameHistoryPage() {
  const [game, setGame] = useState('');

  const { data: sessions = [], isLoading } = useQuery<GameSession[]>({
    queryKey: ['game-sessions', game],
    queryFn: () =>
      api.get('/practice/sessions/', { params: { game: game || undefined, limit: 100 } })
        .then((r) => r.data),
  });

  const totalScore = sessions.reduce((s, x) => s + x.score, 0);
  const bestScore = sessions.length ? Math.max(...sessions.map((s) => s.score)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>Game History</h1>
            <p className="text-gray-500 mt-1">All your practice sessions in one place.</p>
          </div>
          <Link href="/practice"
            className="text-sm font-medium hover:underline"
            style={{ color: '#141c52' }}>
            ← Practice
          </Link>
        </div>

        {/* Summary stats */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Sessions', value: sessions.length },
              { label: 'Total Score', value: totalScore },
              { label: 'Best Score', value: bestScore },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Game filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setGame(f.value)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                game === f.value
                  ? { backgroundColor: '#141c52', color: '#fff' }
                  : { backgroundColor: '#e5e7eb', color: '#374151' }
              }>
              {f.label}
            </button>
          ))}
        </div>

        {/* Session list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🎮</p>
            <p className="font-semibold mb-1" style={{ color: '#141c52' }}>No sessions found</p>
            <p className="text-gray-400 text-sm mb-5">
              {game ? `You haven't played ${GAME_LABELS[game] ?? game} yet.` : 'Play a game to see your history here.'}
            </p>
            <Link href="/practice"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Go to Practice →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: '#f9fafb' }}>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Game</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500">Score</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className="mr-2">{GAME_EMOJIS[s.game] ?? '🎮'}</span>
                      <span style={{ color: '#141c52' }}>{GAME_LABELS[s.game] ?? s.game}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold" style={{ color: '#141c52' }}>
                      {s.score}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400 whitespace-nowrap">
                      {new Date(s.played_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Showing {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
