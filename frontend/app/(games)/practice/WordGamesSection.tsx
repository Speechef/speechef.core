'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface GameSession {
  id: number;
  game: string;
  score: number;
  played_at: string;
}

const GAME_KEY_MAP: Record<string, string> = {
  '/practice/vocabulary-blitz':        'blitz',
  '/practice/guess-the-word':          'guess',
  '/practice/memory-match':            'memory',
  '/practice/word-scramble':           'scramble',
  '/practice/sentence-builder':        'sentence',
  '/practice/pronunciation-challenge': 'pronunciation',
};

const wordGames = [
  {
    href: '/practice/vocabulary-blitz',
    title: 'Vocabulary Blitz',
    description: 'Answer as many word questions as possible in 60 seconds. Fast-paced and addictive.',
    emoji: '⚡',
    badge: 'New',
  },
  {
    href: '/practice/guess-the-word',
    title: 'Guess the Word',
    description: 'Improve your vocabulary by selecting the correct meaning for a random word.',
    emoji: '🧠',
    badge: null,
  },
  {
    href: '/practice/memory-match',
    title: 'Memory Match',
    description: 'Flip cards to match words with their meanings. Fewer attempts = higher score.',
    emoji: '🃏',
    badge: null,
  },
  {
    href: '/practice/word-scramble',
    title: 'Word Scramble',
    description: 'Unscramble the letters to reveal the hidden word.',
    emoji: '🔤',
    badge: null,
  },
  {
    href: '/practice/sentence-builder',
    title: 'Sentence Builder',
    description: 'Use vocabulary words correctly in sentences — graded by AI.',
    emoji: '✍️',
    badge: null,
  },
  {
    href: '/practice/pronunciation-challenge',
    title: 'Pronunciation Challenge',
    description: 'Read phrases aloud and get AI feedback on your pronunciation accuracy.',
    emoji: '🎙️',
    badge: 'New',
  },
];

export default function WordGamesSection() {
  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/practice/sessions/').then((r) => r.data),
  });

  const statsMap: Record<string, { count: number; best: number }> = {};
  for (const key of Object.values(GAME_KEY_MAP)) {
    statsMap[key] = { count: 0, best: 0 };
  }
  for (const s of sessions) {
    if (s.game in statsMap) {
      statsMap[s.game].count++;
      if (s.score > statsMap[s.game].best) statsMap[s.game].best = s.score;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {wordGames.map((game) => {
        const key = GAME_KEY_MAP[game.href];
        const stats = key ? statsMap[key] : null;
        return (
          <div
            key={game.href}
            className="flex flex-col bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow relative"
          >
            {/* Invisible overlay — clicking the card goes to the game */}
            <Link href={game.href} className="absolute inset-0 rounded-2xl" aria-label={`Play ${game.title}`} />

            {game.badge && (
              <span
                className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                {game.badge}
              </span>
            )}
            <div className="text-3xl mb-3">{game.emoji}</div>
            <h3 className="font-bold text-sm mb-1.5" style={{ color: '#141c52' }}>{game.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed flex-1">{game.description}</p>

            {/* Live stats + history link */}
            {stats && stats.count > 0 ? (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span>Played {stats.count}×</span>
                  <span className="font-semibold" style={{ color: '#141c52' }}>Best: {stats.best}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(stats.best, 100)}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }}
                  />
                </div>
                <Link
                  href={`/practice/history?game=${key}`}
                  className="relative z-10 text-[10px] font-semibold text-gray-400 hover:text-gray-600 hover:underline"
                >
                  View history →
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-[10px] text-gray-300">Not played yet</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
