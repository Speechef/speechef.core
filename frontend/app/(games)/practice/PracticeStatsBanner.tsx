'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface GameSession {
  id: number;
  score: number;
  played_at: string;
}

export default function PracticeStatsBanner() {
  const { isLoggedIn } = useAuthStore();

  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['practice-stats-banner'],
    enabled: isLoggedIn,
    staleTime: 0,
    queryFn: () => api.get('/practice/sessions/?limit=200').then((r) => r.data).catch(() => []),
  });

  if (!isLoggedIn || sessions.length === 0) return null;

  const bestScore = Math.max(...sessions.map((s) => s.score));
  const totalGames = sessions.length;

  // Compute streak: consecutive distinct calendar days ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const playedDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.played_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  let streak = 0;
  const cursor = new Date(today);
  while (playedDays.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const stats = [
    { label: 'Games Played', value: totalGames, emoji: '🎮' },
    { label: 'Best Score',   value: bestScore,  emoji: '🏆' },
    { label: 'Day Streak',   value: streak,     emoji: '🔥' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {stats.map(({ label, value, emoji }) => (
        <span
          key={label}
          className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-xs font-semibold"
          style={{ color: '#141c52' }}
        >
          <span>{emoji}</span>
          <span className="font-extrabold">{value}</span>
          <span className="text-gray-400 font-normal">{label}</span>
        </span>
      ))}
      <Link
        href="/practice/history"
        className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        History →
      </Link>
    </div>
  );
}
