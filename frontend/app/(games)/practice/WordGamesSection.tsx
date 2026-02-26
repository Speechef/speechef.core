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

export interface GameConfig {
  href: string;
  title: string;
  emoji: string;
  badge: string | null;
  gameKey: string;
  description: string;
  color: { bg: string; text: string; border: string };
}

interface Props {
  games: readonly GameConfig[];
}

export default function WordGamesSection({ games }: Props) {
  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/practice/sessions/').then((r) => r.data),
  });

  // Build stats map from gameKey
  const statsMap: Record<string, { count: number; best: number }> = {};
  for (const g of games) {
    statsMap[g.gameKey] = { count: 0, best: 0 };
  }
  for (const s of sessions) {
    if (s.game in statsMap) {
      statsMap[s.game].count++;
      if (s.score > statsMap[s.game].best) statsMap[s.game].best = s.score;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => {
        const stats = statsMap[game.gameKey] ?? { count: 0, best: 0 };
        const { color } = game;
        return (
          <div
            key={game.href}
            className="flex flex-col bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
            style={{ '--card-border': color.border } as React.CSSProperties}
          >
            {/* Invisible full-card link overlay */}
            <Link href={game.href} className="absolute inset-0 rounded-2xl z-0" aria-label={`Play ${game.title}`} />

            {/* Colored header band */}
            <div
              className="px-4 pt-3 pb-3 rounded-t-2xl relative overflow-hidden"
              style={{ background: color.bg }}
            >
              {/* Decorative blob */}
              <div
                className="absolute rounded-full"
                style={{
                  background: color.text,
                  opacity: 0.15,
                  width: 56,
                  height: 56,
                  top: -18,
                  right: -10,
                }}
              />
              <div className="flex items-center justify-between relative">
                <span className="text-2xl">{game.emoji}</span>
                {game.badge && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                  >
                    {game.badge}
                  </span>
                )}
              </div>
            </div>

            {/* White body */}
            <div className="px-4 py-3 flex flex-col flex-1">
              <h3 className="font-bold text-sm mb-1" style={{ color: '#141c52' }}>{game.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed flex-1">{game.description}</p>

              {stats.count > 0 ? (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>Played {stats.count}×</span>
                    <span className="font-semibold" style={{ color: '#141c52' }}>Best: {stats.best}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(stats.best, 100)}%`,
                        background: 'linear-gradient(to right,#FADB43,#fe9940)',
                      }}
                    />
                  </div>
                  <Link
                    href={`/practice/history?game=${game.gameKey}`}
                    className="relative z-10 text-[10px] font-semibold text-gray-400 hover:text-gray-600 hover:underline"
                  >
                    View history →
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-[10px] text-gray-300">Not played yet</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
