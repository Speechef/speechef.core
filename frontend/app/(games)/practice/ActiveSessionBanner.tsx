'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface RolePlaySession {
  id: number;
  mode: string;
  topic: string;
  status: string;
  started_at: string;
}

const MODE_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  presentation:  'Presentation Pitch',
  debate:        'Debate',
  small_talk:    'Small Talk',
};

export default function ActiveSessionBanner() {
  const { isLoggedIn } = useAuthStore();

  const { data: sessions = [] } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions-active'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const active = sessions.filter((s) => s.status === 'active');
  if (active.length === 0) return null;

  const latest = active[0];
  const modeLabel = MODE_LABELS[latest.mode] ?? latest.mode;

  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-6"
      style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}
    >
      <div>
        <p className="text-xs font-semibold text-white/60 mb-0.5">Unfinished Session</p>
        <p className="text-sm font-bold">
          🎭 {modeLabel}{latest.topic ? ` — ${latest.topic}` : ''}
        </p>
      </div>
      <Link
        href={`/practice/roleplay/${latest.mode}`}
        className="shrink-0 text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
      >
        Resume →
      </Link>
    </div>
  );
}
