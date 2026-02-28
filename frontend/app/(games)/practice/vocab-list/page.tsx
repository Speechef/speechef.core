'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface VocabWord {
  id: number;
  word: string;
  definition: string;
  example: string;
  exam_tags: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  is_known: boolean | null;
}

interface VocabStats {
  total: number;
  known: number;
  by_difficulty: Record<string, { total: number; known: number }>;
  by_exam: Record<string, { total: number; known: number }>;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right, #FADB43, #fe9940)' };

const DIFFICULTY_STYLES: Record<string, { border: string; badge: string; text: string; label: string }> = {
  basic:        { border: '#22c55e', badge: '#dcfce7', text: '#166534', label: 'Basic' },
  intermediate: { border: '#f59e0b', badge: '#fef3c7', text: '#78350f', label: 'Intermediate' },
  advanced:     { border: '#ef4444', badge: '#fee2e2', text: '#991b1b', label: 'Advanced' },
};

const EXAM_COLORS: Record<string, { bg: string; text: string }> = {
  ielts:  { bg: '#dbeafe', text: '#1e40af' },
  toefl:  { bg: '#fce7f3', text: '#9d174d' },
  pte:    { bg: '#dcfce7', text: '#166534' },
  oet:    { bg: '#fef3c7', text: '#78350f' },
  celpip: { bg: '#ede9fe', text: '#6d28d9' },
};

const EXAM_TABS = ['all', 'ielts', 'toefl', 'pte', 'oet', 'celpip'] as const;
const DIFF_TABS = ['all', 'basic', 'intermediate', 'advanced'] as const;
const KNOWN_TABS = [
  { value: 'all',      label: 'All words' },
  { value: 'true',     label: 'Known' },
  { value: 'false',    label: 'Still learning' },
] as const;

// ─── API helpers ───────────────────────────────────────────────────────────────
async function fetchVocab(params: { difficulty?: string; exam_tag?: string; known?: string }): Promise<VocabWord[]> {
  const p = new URLSearchParams();
  if (params.difficulty && params.difficulty !== 'all') p.set('difficulty', params.difficulty);
  if (params.exam_tag && params.exam_tag !== 'all') p.set('exam_tag', params.exam_tag);
  if (params.known && params.known !== 'all') p.set('known', params.known);
  const { data } = await api.get<VocabWord[]>(`/practice/vocab/?${p.toString()}`);
  return data;
}

async function fetchStats(): Promise<VocabStats> {
  const { data } = await api.get<VocabStats>('/practice/vocab/stats/');
  return data;
}

async function markWord(wordId: number, known: boolean): Promise<{ known: boolean }> {
  const { data } = await api.post<{ known: boolean }>(`/practice/vocab/${wordId}/mark/`, { known });
  return data;
}

// ─── Word Card ──────────────────────────────────────────────────────────────────
function WordCard({
  word,
  isLoggedIn,
  onToggle,
}: {
  word: VocabWord;
  isLoggedIn: boolean;
  onToggle: (id: number, known: boolean) => void;
}) {
  const ds = DIFFICULTY_STYLES[word.difficulty] ?? DIFFICULTY_STYLES.basic;
  const [optimisticKnown, setOptimisticKnown] = useState<boolean | null>(word.is_known);

  function handleToggle() {
    if (!isLoggedIn) return;
    const next = !optimisticKnown;
    setOptimisticKnown(next);
    onToggle(word.id, next);
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
      style={{ borderLeft: `4px solid ${ds.border}` }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-lg font-extrabold leading-tight"
            style={{ color: BRAND.primary }}
          >
            {word.word}
          </h3>
          <span
            className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: ds.badge, color: ds.text }}
          >
            {ds.label}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{word.definition}</p>

        {word.example && (
          <p className="text-xs italic text-gray-400 mt-1.5 leading-relaxed">
            &ldquo;{word.example}&rdquo;
          </p>
        )}
      </div>

      {/* Exam tags */}
      {word.exam_tags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {word.exam_tags.map((tag) => {
            const c = EXAM_COLORS[tag] ?? { bg: '#f3f4f6', text: '#374151' };
            return (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: c.bg, color: c.text }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Toggle button */}
      <div className="mt-auto px-4 pb-4">
        {isLoggedIn ? (
          <button
            onClick={handleToggle}
            className="w-full text-xs font-bold py-2 rounded-xl transition-all duration-150 hover:opacity-80 active:scale-95"
            style={
              optimisticKnown
                ? { background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac' }
                : { background: '#fef3c7', color: '#78350f', border: '1.5px solid #fde68a' }
            }
          >
            {optimisticKnown ? '✓ Know it' : 'Still learning'}
          </button>
        ) : (
          <p className="text-center text-xs text-gray-400">
            <Link href="/login" className="underline">Log in</Link> to track progress
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ known, total }: { known: number; total: number }) {
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: BRAND.primary }}>
        <span>{known} / {total} known</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, #22c55e, #16a34a)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Filter Tab row ─────────────────────────────────────────────────────────────
function TabRow<T extends string>({
  tabs,
  active,
  onChange,
  labelFn,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (v: T) => void;
  labelFn?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={
            active === t
              ? { background: BRAND.primary, color: '#fff' }
              : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
          }
        >
          {labelFn ? labelFn(t) : t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function VocabListPage() {
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const [difficulty, setDifficulty] = useState<typeof DIFF_TABS[number]>('all');
  const [examTab, setExamTab] = useState<typeof EXAM_TABS[number]>('all');
  const [knownFilter, setKnownFilter] = useState<'all' | 'true' | 'false'>('all');

  // Fetch words
  const { data: words = [], isLoading } = useQuery({
    queryKey: ['vocab', difficulty, examTab, knownFilter],
    queryFn: () => fetchVocab({ difficulty, exam_tag: examTab, known: knownFilter }),
    staleTime: 60_000,
  });

  // Fetch stats (only for logged-in users)
  const { data: stats } = useQuery({
    queryKey: ['vocab-stats'],
    queryFn: fetchStats,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  // Mark mutation
  const markMutation = useMutation({
    mutationFn: ({ id, known }: { id: number; known: boolean }) => markWord(id, known),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vocab'] });
    },
  });

  function handleToggle(id: number, known: boolean) {
    markMutation.mutate({ id, known });
  }

  const knownCount = stats?.known ?? 0;
  const totalCount = stats?.total ?? words.length;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: BRAND.primary }}
        >
          ← Back to Practice Hub
        </Link>

        {/* Header card */}
        <div
          className="rounded-2xl px-6 py-5 mb-6"
          style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            border: '1.5px solid #93c5fd',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>
                Vocabulary Tracker
              </h1>
              <p className="text-sm mt-1 font-medium" style={{ color: '#1d4ed8', opacity: 0.75 }}>
                150 academic words for IELTS, TOEFL &amp; more
              </p>
            </div>

            {isLoggedIn && stats && (
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold" style={{ color: BRAND.primary }}>
                  {knownCount} known &nbsp;·&nbsp; {totalCount - knownCount} learning
                </p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: '#1d4ed8', opacity: 0.7 }}>
                  {Math.round((knownCount / Math.max(totalCount, 1)) * 100)}% complete
                </p>
              </div>
            )}
          </div>

          {isLoggedIn && stats && (
            <ProgressBar known={knownCount} total={totalCount} />
          )}

          {/* Per-exam summary row */}
          {isLoggedIn && stats && Object.keys(stats.by_exam).length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(stats.by_exam).map(([exam, s]) => {
                const c = EXAM_COLORS[exam] ?? { bg: '#f3f4f6', text: '#374151' };
                return (
                  <span
                    key={exam}
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.7)', color: BRAND.primary }}
                  >
                    <span
                      className="uppercase text-[10px] font-extrabold mr-1 px-1.5 py-0.5 rounded"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {exam}
                    </span>
                    {s.known}/{s.total}
                  </span>
                );
              })}
            </div>
          )}

          {!isLoggedIn && (
            <div
              className="mt-3 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.6)', color: '#1d4ed8' }}
            >
              <span>👋</span>
              <span>
                <Link href="/login" className="font-bold underline">Log in</Link> to track which words you know and see your progress.
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl px-5 py-4 mb-6 space-y-3"
          style={{ background: '#fff', border: '1px solid #e2e8f0' }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-16 flex-shrink-0">
              Difficulty
            </span>
            <TabRow
              tabs={DIFF_TABS}
              active={difficulty}
              onChange={(v) => { setDifficulty(v); setKnownFilter('all'); }}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-16 flex-shrink-0">
              Exam
            </span>
            <TabRow
              tabs={EXAM_TABS}
              active={examTab}
              onChange={(v) => { setExamTab(v); setKnownFilter('all'); }}
              labelFn={(v) => v === 'all' ? 'All' : v.toUpperCase()}
            />
          </div>

          {isLoggedIn && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-16 flex-shrink-0">
                View
              </span>
              <div className="flex flex-wrap gap-2">
                {KNOWN_TABS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setKnownFilter(t.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                    style={
                      knownFilter === t.value
                        ? { background: BRAND.primary, color: '#fff' }
                        : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs font-semibold text-gray-400 mb-4">
          Showing {words.length} word{words.length !== 1 ? 's' : ''}
        </p>

        {/* Word grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : words.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-12 text-center"
            style={{ background: '#fff', border: '1px solid #e2e8f0' }}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-gray-700">No words match these filters.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting the difficulty, exam, or view filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {words.map((w) => (
              <WordCard
                key={w.id}
                word={w}
                isLoggedIn={isLoggedIn}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
