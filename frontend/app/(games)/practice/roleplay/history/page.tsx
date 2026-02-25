'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface RolePlaySession {
  id: number;
  mode: string;
  topic: string;
  score: number | null;
  status: string;
  started_at: string;
  finished_at: string | null;
}

const MODES = [
  { id: 'all',          label: 'All Modes',          emoji: '🗂️' },
  { id: 'job_interview', label: 'Job Interview',      emoji: '💼' },
  { id: 'presentation',  label: 'Presentation Pitch', emoji: '🎤' },
  { id: 'debate',        label: 'Debate',             emoji: '🗣️' },
  { id: 'small_talk',    label: 'Small Talk',         emoji: '💬' },
];

const MODE_META: Record<string, { label: string; emoji: string }> = {
  job_interview: { label: 'Job Interview',      emoji: '💼' },
  presentation:  { label: 'Presentation Pitch', emoji: '🎤' },
  debate:        { label: 'Debate',             emoji: '🗣️' },
  small_talk:    { label: 'Small Talk',         emoji: '💬' },
};

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#166534' : score >= 60 ? '#92400e' : '#991b1b';
  const bg    = score >= 80 ? '#dcfce7' : score >= 60 ? '#fef3c7' : '#fee2e2';
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color, backgroundColor: bg }}>
      {score} / 100
    </span>
  );
}

export default function RolePlayHistoryPage() {
  const [activeMode, setActiveMode] = useState('all');

  const { data: sessions = [], isLoading } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions-all'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const filtered = activeMode === 'all'
    ? sessions
    : sessions.filter((s) => s.mode === activeMode);

  const finished = filtered.filter((s) => s.status === 'finished' && s.score != null);
  const avgScore = finished.length > 0
    ? Math.round(finished.reduce((sum, s) => sum + (s.score ?? 0), 0) / finished.length)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/practice/roleplay" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
              ← Role Play
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>Session History</h1>
            <p className="text-gray-500 text-sm mt-1">All your past role play sessions.</p>
          </div>
          {avgScore !== null && (
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Avg score</p>
              <p className="text-3xl font-extrabold" style={{ color: '#141c52' }}>
                {avgScore}<span className="text-base font-normal text-gray-400">/100</span>
              </p>
            </div>
          )}
        </div>

        {/* Mode filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={activeMode === m.id
                ? { backgroundColor: '#141c52', color: '#fff' }
                : { backgroundColor: '#e5e7eb', color: '#374151' }}
            >
              <span>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Summary bar */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex gap-6 mb-5 text-sm text-gray-500">
            <span><strong style={{ color: '#141c52' }}>{filtered.length}</strong> session{filtered.length !== 1 ? 's' : ''}</span>
            <span><strong style={{ color: '#141c52' }}>{finished.length}</strong> finished</span>
            {avgScore !== null && (
              <span><strong style={{ color: '#141c52' }}>{avgScore}/100</strong> avg</span>
            )}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-3">🗣️</p>
            <p className="font-semibold text-lg mb-1" style={{ color: '#141c52' }}>
              {activeMode === 'all' ? 'No sessions yet' : `No ${MODE_META[activeMode]?.label ?? activeMode} sessions yet`}
            </p>
            <p className="text-gray-400 text-sm mb-5">
              Start a session to see your history here.
            </p>
            <Link
              href={activeMode === 'all' ? '/practice/roleplay' : `/practice/roleplay/${activeMode}`}
              className="inline-block text-sm font-bold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              Start a Session →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => {
              const meta = MODE_META[s.mode];
              return (
                <Link
                  key={s.id}
                  href={`/practice/roleplay/session/${s.id}`}
                  className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta?.emoji ?? '🗣️'}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#141c52' }}>
                        {meta?.label ?? s.mode}
                        {s.topic && (
                          <span className="font-normal text-gray-500"> — {s.topic}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(s.started_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                        {' · '}{s.status}
                      </p>
                    </div>
                  </div>
                  {s.score != null ? (
                    <ScorePill score={s.score} />
                  ) : (
                    <span className="text-xs text-gray-400">
                      {s.status === 'active' ? 'In progress' : '—'}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
