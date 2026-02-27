'use client';
import { Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const SCORE_COLOR = (s: number) =>
  s >= 80 ? { color: '#166534', bg: '#dcfce7' }
  : s >= 60 ? { color: '#92400e', bg: '#fef3c7' }
  : { color: '#991b1b', bg: '#fee2e2' };

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
  const sc = SCORE_COLOR(score);
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: sc.color, backgroundColor: sc.bg }}>
      {score} / 100
    </span>
  );
}

const VALID_SORTS = ['newest', 'score_desc', 'score_asc'] as const;
type SortBy = typeof VALID_SORTS[number];

function RolePlayHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeMode = searchParams.get('mode') ?? 'all';
  const sortParam = searchParams.get('sort') as SortBy | null;
  const sortBy: SortBy = (sortParam && VALID_SORTS.includes(sortParam)) ? sortParam : 'newest';

  function pushParams(mode: string, sort: SortBy) {
    const p = new URLSearchParams();
    if (mode && mode !== 'all') p.set('mode', mode);
    if (sort !== 'newest') p.set('sort', sort);
    router.push(`/practice/roleplay/history${p.size ? `?${p}` : ''}`);
  }

  const { data: sessions = [], isLoading } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions-all'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const filtered = activeMode === 'all'
    ? sessions
    : sessions.filter((s) => s.mode === activeMode);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score_desc') return (b.score ?? -1) - (a.score ?? -1);
    if (sortBy === 'score_asc')  return (a.score ?? 101) - (b.score ?? 101);
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
  });

  const finished = filtered.filter((s) => s.status === 'finished' && s.score != null);
  const avgScore = finished.length > 0
    ? Math.round(finished.reduce((sum, s) => sum + (s.score ?? 0), 0) / finished.length)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link href="/practice/roleplay" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
              ← Role Play
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>Session History</h1>
            <p className="text-gray-500 text-sm mt-1">All your past role play sessions.</p>
          </div>
        </div>

        {/* Stat pills */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              🗣️ {filtered.length} session{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              ✅ {finished.length} finished
            </span>
            {avgScore !== null && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
                🏆 {avgScore}/100 avg
              </span>
            )}
          </div>
        )}

        {/* Mode filter tabs + sort */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => pushParams(m.id, sortBy)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border"
              style={activeMode === m.id
                ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              <span>{m.emoji}</span>
              {m.label}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => pushParams(activeMode, e.target.value as SortBy)}
            className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600"
          >
            <option value="newest">Newest First</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
          </select>
        </div>

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
            <p className="font-semibold text-lg mb-1" style={{ color: BRAND.primary }}>
              {activeMode === 'all' ? 'No sessions yet' : `No ${MODE_META[activeMode]?.label ?? activeMode} sessions yet`}
            </p>
            <p className="text-gray-400 text-sm mb-5">
              Start a session to see your history here.
            </p>
            <Link
              href={activeMode === 'all' ? '/practice/roleplay' : `/practice/roleplay/${activeMode}`}
              className="inline-block text-sm font-bold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Start a Session →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((s) => {
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
                      <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>
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

export default function RolePlayHistoryPage() {
  return (
    <Suspense>
      <RolePlayHistoryContent />
    </Suspense>
  );
}
