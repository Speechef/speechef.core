'use client';

import { useQuery } from '@tanstack/react-query';
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
    <div className="grid grid-cols-3 gap-3 mb-2">
      {stats.map(({ label, value, emoji }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
        >
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-xl font-extrabold leading-none" style={{ color: '#141c52' }}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
