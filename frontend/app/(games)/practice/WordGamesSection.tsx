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

  const statsMap: Record<string, { count: number; best: number }> = {};
  for (const g of games) statsMap[g.gameKey] = { count: 0, best: 0 };
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
        const played = stats.count > 0;

        return (
          <Link
            key={game.href}
            href={game.href}
            className="group flex flex-col rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-200"
            style={{ borderColor: color.border, background: '#fff' }}
          >
            {/* Colored header band */}
            <div
              className="relative px-4 py-4 overflow-hidden"
              style={{ background: color.bg }}
            >
              <div
                className="absolute right-[-14px] top-[-14px] w-16 h-16 rounded-full pointer-events-none"
                style={{ background: color.text, opacity: 0.12 }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{game.emoji}</span>
                  <span className="font-extrabold text-sm leading-tight" style={{ color: color.text }}>
                    {game.title}
                  </span>
                </div>
                {game.badge && (
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                  >
                    {game.badge}
                  </span>
                )}
              </div>
            </div>

            {/* White body */}
            <div className="px-4 py-3 flex flex-col flex-1">
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{game.description}</p>

              {played ? (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400">
                      Played <strong className="text-gray-600">{stats.count}×</strong>
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: '#141c52' }}>
                      Best: {stats.best}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(stats.best, 100)}%`,
                        background: `linear-gradient(to right, ${color.bg}, ${color.text})`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <span className="text-[10px] text-gray-300 italic">Not played yet</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 flex items-center justify-between border-t"
              style={{ borderColor: `${color.border}88`, background: `${color.bg}44` }}
            >
              {played ? (
                <Link
                  href={`/practice/history?game=${game.gameKey}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-semibold hover:underline"
                  style={{ color: color.text, opacity: 0.65 }}
                >
                  View history →
                </Link>
              ) : (
                <span className="text-[10px] text-gray-300">New game</span>
              )}
              <span
                className="text-xs font-bold px-3.5 py-1.5 rounded-full transition-all group-hover:scale-105"
                style={{ background: color.bg, color: color.text, border: `1.5px solid ${color.border}` }}
              >
                Play →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
