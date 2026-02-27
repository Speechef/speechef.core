'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const GAME_COLORS: Record<string, { bg: string; text: string }> = {
  blitz:         { bg: '#fef9c3', text: '#92400e' },
  guess:         { bg: '#ede9fe', text: '#6d28d9' },
  memory:        { bg: '#d1fae5', text: '#065f46' },
  scramble:      { bg: '#dbeafe', text: '#1e40af' },
  sentence:      { bg: '#fce7f3', text: '#9d174d' },
  daily:         { bg: '#fef3c7', text: '#78350f' },
  pronunciation: { bg: '#fee2e2', text: '#991b1b' },
};

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

function GameHistoryContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const game         = searchParams.get('game') ?? '';
  const [sortBy, setSortBy] = useState<'newest' | 'score_desc' | 'score_asc'>('newest');

  function setGame(value: string) {
    const url = value ? `/practice/history?game=${value}` : '/practice/history';
    router.push(url);
  }

  const { data: sessions = [], isLoading } = useQuery<GameSession[]>({
    queryKey: ['game-sessions', game],
    queryFn: () =>
      api.get('/practice/sessions/', { params: { game: game || undefined, limit: 100 } })
        .then((r) => r.data),
  });

  const totalScore = sessions.reduce((s, x) => s + x.score, 0);
  const bestScore  = sessions.length ? Math.max(...sessions.map((s) => s.score)) : 0;

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortBy === 'score_desc') return b.score - a.score;
    if (sortBy === 'score_asc')  return a.score - b.score;
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">← Practice</Link>
            <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>Game History</h1>
            <p className="text-gray-500 mt-1">All your practice sessions in one place.</p>
          </div>
        </div>

        {/* Summary stats — pill strip */}
        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              🎮 {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              🏆 {totalScore} total score
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              ⭐ {bestScore} best score
            </span>
          </div>
        )}

        {/* Game filter tabs + sort */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setGame(f.value)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
              style={
                game === f.value
                  ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                  : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
              }>
              {f.label}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600"
          >
            <option value="newest">Newest First</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
          </select>
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
            <p className="font-semibold mb-1" style={{ color: BRAND.primary }}>No sessions found</p>
            <p className="text-gray-400 text-sm mb-5">
              {game ? `You haven't played ${GAME_LABELS[game] ?? game} yet.` : 'Play a game to see your history here.'}
            </p>
            <Link href="/practice"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}>
              Go to Practice →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSessions.map((s) => {
              const gc = GAME_COLORS[s.game] ?? { bg: '#f3f4f6', text: '#374151' };
              return (
                <div key={s.id}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 hover:shadow-sm hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: gc.text }} />
                    <span className="text-xl">{GAME_EMOJIS[s.game] ?? '🎮'}</span>
                    <span className="text-sm font-semibold" style={{ color: BRAND.primary }}>
                      {GAME_LABELS[s.game] ?? s.game}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold" style={{ color: BRAND.primary }}>{s.score}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(s.played_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameHistoryPage() {
  return (
    <Suspense>
      <GameHistoryContent />
    </Suspense>
  );
}
