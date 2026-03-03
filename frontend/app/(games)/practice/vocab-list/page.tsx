'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { isAuthenticated } from '@/lib/auth';

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

type ViewMode    = 'grid' | 'list' | 'flashcard';
type KnownFilter = 'all' | 'true' | 'false';

// ─── Constants ─────────────────────────────────────────────────────────────────
const PRIMARY  = '#141c52';
const GRADIENT = 'linear-gradient(to right, #FADB43, #fe9940)';

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

const EXAM_TABS  = ['all', 'ielts', 'toefl', 'pte', 'oet', 'celpip'] as const;
const DIFF_TABS  = ['all', 'basic', 'intermediate', 'advanced'] as const;
const KNOWN_TABS = [
  { value: 'all',   label: 'All words'      },
  { value: 'true',  label: 'Know it'        },
  { value: 'false', label: 'Still learning' },
] as const;

const HERO_STYLES = `
  @keyframes vOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(40px,-30px) scale(1.07); }
    66%      { transform:translate(-22px,28px) scale(0.94); }
  }
  @keyframes vRise {
    from { opacity:0; transform:translateY(36px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .v-orb-a { animation:vOrbDrift 14s ease-in-out infinite; }
  .v-orb-b { animation:vOrbDrift 20s ease-in-out infinite reverse; }
  .v-orb-c { animation:vOrbDrift 11s ease-in-out infinite 2.5s; }
  .v-r1 { animation:vRise .7s .0s ease both; }
  .v-r2 { animation:vRise .7s .15s ease both; }
  .v-r3 { animation:vRise .7s .30s ease both; }
  .v-r4 { animation:vRise .7s .48s ease both; }
`;

// ─── API helpers ───────────────────────────────────────────────────────────────
async function fetchVocab(params: { difficulty?: string; exam_tag?: string; known?: string }): Promise<VocabWord[]> {
  const p = new URLSearchParams();
  if (params.difficulty && params.difficulty !== 'all') p.set('difficulty', params.difficulty);
  if (params.exam_tag   && params.exam_tag   !== 'all') p.set('exam_tag',   params.exam_tag);
  if (params.known      && params.known      !== 'all') p.set('known',      params.known);
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

// ─── Circular Speechef Meter ───────────────────────────────────────────────────
function SpeechefMeter({ pct, known, total }: { pct: number; known: number; total: number }) {
  const r = 54, cx = 68, cy = 68;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={136} height={136} viewBox="0 0 136 136">
        <defs>
          <linearGradient id="vocabGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#vocabGrad)" strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
        />
        <text x={cx} y={cy - 8}  textAnchor="middle" fill="#fff"                    fontSize={22} fontWeight={900} fontFamily="inherit">{pct}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.45)"  fontSize={10} fontWeight={600} fontFamily="inherit">MASTERED</text>
      </svg>
      <div className="text-center">
        <p className="text-white text-sm font-extrabold leading-tight">{known} / {total}</p>
        <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>words learnt</p>
      </div>
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ value, label, accent }: { value: number | string; label: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)' }}>
      <p className="text-2xl font-black leading-none" style={{ color: accent ?? '#fff' }}>{value}</p>
      <p className="text-[10px] font-bold mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
    </div>
  );
}

// ─── Tab Row ──────────────────────────────────────────────────────────────────
function TabRow<T extends string>({ tabs, active, onChange, labelFn }: {
  tabs: readonly T[]; active: T; onChange: (v: T) => void; labelFn?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={active === t
            ? { background: PRIMARY, color: '#fff' }
            : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
          {labelFn ? labelFn(t) : t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ─── Mark Buttons (shared) ────────────────────────────────────────────────────
function MarkButtons({ localKnown, onLearning, onKnow, size = 'normal' }: {
  localKnown: boolean | null;
  onLearning: () => void;
  onKnow: () => void;
  size?: 'normal' | 'small';
}) {
  const py = size === 'small' ? 'py-1.5' : 'py-2.5';
  return (
    <div className="flex gap-2">
      <button onClick={onLearning}
        className={`flex-1 text-xs font-bold ${py} rounded-xl transition-all`}
        style={localKnown === false
          ? { background: '#fef3c7', color: '#78350f', border: '1.5px solid #fde68a' }
          : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
        ⏳ Learning
      </button>
      <button onClick={onKnow}
        className={`flex-1 text-xs font-bold ${py} rounded-xl transition-all`}
        style={localKnown === true
          ? { background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac' }
          : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
        ✓ Know it
      </button>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ word, isLoggedIn, onToggle }: {
  word: VocabWord; isLoggedIn: boolean; onToggle: (id: number, known: boolean) => void;
}) {
  const ds = DIFFICULTY_STYLES[word.difficulty] ?? DIFFICULTY_STYLES.basic;
  const [localKnown, setLocalKnown] = useState<boolean | null>(word.is_known);
  const [expanded, setExpanded]     = useState(false);
  useEffect(() => { setLocalKnown(word.is_known); }, [word.is_known]);

  const isLearnt = localKnown === true;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
      style={{
        borderLeft: `4px solid ${ds.border}`,
        opacity: isLearnt ? 0.55 : 1,
      }}
      onClick={() => setExpanded((p) => !p)}
    >
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-extrabold leading-tight" style={{ color: PRIMARY }}>{word.word}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isLearnt && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>✓ Learnt</span>}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ds.badge, color: ds.text }}>{ds.label}</span>
          </div>
        </div>
        {expanded ? (
          <>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{word.definition}</p>
            {word.example && <p className="text-xs italic text-gray-400 mt-1.5 leading-relaxed">&ldquo;{word.example}&rdquo;</p>}
          </>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Tap to see meaning</p>
        )}
      </div>

      {word.exam_tags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {word.exam_tags.map((tag) => {
            const c = EXAM_COLORS[tag] ?? { bg: '#f3f4f6', text: '#374151' };
            return <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: c.bg, color: c.text }}>{tag}</span>;
          })}
        </div>
      )}

      <div className="mt-auto px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {isLoggedIn ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setLocalKnown(false); onToggle(word.id, false); }}
              className="flex-1 text-xs font-bold py-2 rounded-xl transition-all hover:opacity-80"
              style={localKnown === false
                ? { background: '#fef3c7', color: '#78350f', border: '1.5px solid #fde68a' }
                : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
              ⏳ Learning
            </button>
            <button
              onClick={() => { setLocalKnown(true); onToggle(word.id, true); }}
              className="flex-1 text-xs font-bold py-2 rounded-xl transition-all hover:opacity-80"
              style={localKnown === true
                ? { background: '#dcfce7', color: '#166634', border: '1.5px solid #86efac' }
                : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
              ✓ Know it
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400">
            <Link href="/login" className="underline">Log in</Link> to track progress
          </p>
        )}
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function ListRow({ word, isLoggedIn, onToggle }: {
  word: VocabWord; isLoggedIn: boolean; onToggle: (id: number, known: boolean) => void;
}) {
  const ds = DIFFICULTY_STYLES[word.difficulty] ?? DIFFICULTY_STYLES.basic;
  const [localKnown, setLocalKnown] = useState<boolean | null>(word.is_known);
  const [showDef, setShowDef]       = useState(false);
  useEffect(() => { setLocalKnown(word.is_known); }, [word.is_known]);

  const dotColor = localKnown === true ? '#22c55e' : localKnown === false ? '#f59e0b' : '#d1d5db';
  const isLearnt = localKnown === true;

  return (
    <div
      className="bg-white rounded-xl px-4 py-3 transition-all"
      style={{ border: '1px solid #e2e8f0', opacity: isLearnt ? 0.55 : 1 }}
    >
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />

        {/* Word — click row to toggle definition */}
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => setShowDef((p) => !p)}
        >
          <span className="text-sm font-extrabold" style={{ color: PRIMARY }}>{word.word}</span>
          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: ds.badge, color: ds.text }}>{ds.label}</span>
          {isLearnt && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#dcfce7', color: '#166534' }}>✓</span>}
          <span className="ml-2 text-[10px] text-gray-400">{showDef ? '▲' : '▼'}</span>
        </button>

        {isLoggedIn && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => { setLocalKnown(false); onToggle(word.id, false); }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
              style={localKnown === false
                ? { background: '#fef3c7', color: '#78350f', border: '1.5px solid #fde68a' }
                : { background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}
              title="Still learning">⏳</button>
            <button
              onClick={() => { setLocalKnown(true); onToggle(word.id, true); }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
              style={localKnown === true
                ? { background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac' }
                : { background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}
              title="Know it">✓</button>
          </div>
        )}
      </div>

      {/* Definition — only visible when row is clicked */}
      {showDef && (
        <div className="mt-2 pl-5">
          <p className="text-xs text-gray-600 leading-relaxed">{word.definition}</p>
          {word.example && <p className="text-xs italic text-gray-400 mt-1 leading-relaxed">&ldquo;{word.example}&rdquo;</p>}
          {word.exam_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {word.exam_tags.map((tag) => {
                const c = EXAM_COLORS[tag] ?? { bg: '#f3f4f6', text: '#374151' };
                return <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: c.bg, color: c.text }}>{tag}</span>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Flip Card ────────────────────────────────────────────────────────────────
function FlipCard({ word, isLoggedIn, onToggle }: {
  word: VocabWord; isLoggedIn: boolean; onToggle: (id: number, known: boolean) => void;
}) {
  const ds = DIFFICULTY_STYLES[word.difficulty] ?? DIFFICULTY_STYLES.basic;
  const [flipped, setFlipped]       = useState(false);
  const [localKnown, setLocalKnown] = useState<boolean | null>(word.is_known);
  useEffect(() => { setLocalKnown(word.is_known); setFlipped(false); }, [word.id, word.is_known]);

  function handleMark(known: boolean, e: React.MouseEvent) {
    e.stopPropagation();
    setLocalKnown(known);
    onToggle(word.id, known);
  }

  return (
    <div style={{ perspective: '1200px', width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <div
        style={{
          position: 'relative', width: '100%', height: 380,
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.45s cubic-bezier(.4,0,.2,1)',
          cursor: 'pointer',
        }}
        onClick={() => setFlipped((p) => !p)}
      >
        {/* ── Front ── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 24,
          background: 'linear-gradient(135deg,#080d26 0%,#141c52 60%,#1a2460 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}>
          <span className="text-4xl mb-4">📖</span>
          <h2 className="text-3xl font-extrabold text-center text-white" style={{ letterSpacing: '-0.5px' }}>{word.word}</h2>
          <span className="mt-3 text-xs font-bold px-3 py-1 rounded-full" style={{ background: ds.badge, color: ds.text }}>{ds.label}</span>
          <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
            {word.exam_tags.map((tag) => {
              const c = EXAM_COLORS[tag] ?? { bg: '#f3f4f6', text: '#374151' };
              return <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: c.bg, color: c.text }}>{tag}</span>;
            })}
          </div>
          <p className="text-white/40 text-xs mt-4 mb-5">Tap card to reveal meaning</p>

          {/* Mark buttons on front — no flip needed */}
          {isLoggedIn && (
            <div className="flex gap-2 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => handleMark(false, e)}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl transition-all"
                style={localKnown === false
                  ? { background: '#fef3c7', color: '#78350f', border: '1.5px solid #fde68a' }
                  : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
                ⏳ Learning
              </button>
              <button
                onClick={(e) => handleMark(true, e)}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl transition-all"
                style={localKnown === true
                  ? { background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac' }
                  : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Know it
              </button>
            </div>
          )}
        </div>

        {/* ── Back ── */}
        <div
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', borderRadius: 24,
            background: '#fff', border: `2px solid ${ds.border}`,
            display: 'flex', flexDirection: 'column', padding: '1.5rem',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-extrabold" style={{ color: PRIMARY }}>{word.word}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ds.badge, color: ds.text }}>{ds.label}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed flex-1">{word.definition}</p>
          {word.example && <p className="text-xs italic text-gray-400 mt-2 leading-relaxed border-t pt-2">&ldquo;{word.example}&rdquo;</p>}
          {isLoggedIn && (
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setLocalKnown(false); onToggle(word.id, false); }}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl transition-all"
                style={localKnown === false
                  ? { background: '#fef3c7', color: '#78350f', border: '1.5px solid #fde68a' }
                  : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                ⏳ Still learning
              </button>
              <button onClick={() => { setLocalKnown(true); onToggle(word.id, true); }}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl transition-all"
                style={localKnown === true
                  ? { background: '#dcfce7', color: '#166534', border: '1.5px solid #86efac' }
                  : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                ✓ Know it
              </button>
            </div>
          )}
          <button
            className="mt-3 text-xs font-semibold text-center w-full py-1.5 rounded-lg transition-all"
            style={{ color: PRIMARY, background: '#f1f5f9' }}
            onClick={() => setFlipped(false)}
          >← Flip back</button>
        </div>
      </div>
    </div>
  );
}

// ─── Flashcard View ───────────────────────────────────────────────────────────
function FlashcardView({ words, isLoggedIn, onToggle }: {
  words: VocabWord[]; isLoggedIn: boolean; onToggle: (id: number, known: boolean) => void;
}) {
  const [idx, setIdx] = useState(0);
  const current = words[idx];
  if (!current) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
          <span>Card {idx + 1} of {words.length}</span>
          <span>{Math.round(((idx + 1) / words.length) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((idx + 1) / words.length) * 100}%`, background: GRADIENT }} />
        </div>
      </div>

      <FlipCard word={current} isLoggedIn={isLoggedIn} onToggle={onToggle} />

      <div className="flex items-center gap-4">
        <button onClick={() => setIdx((p) => Math.max(0, p - 1))} disabled={idx === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
          style={{ background: PRIMARY, color: '#fff' }}>← Prev</button>
        <span className="text-sm font-bold" style={{ color: PRIMARY }}>{idx + 1} / {words.length}</span>
        <button onClick={() => setIdx((p) => Math.min(words.length - 1, p + 1))} disabled={idx === words.length - 1}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
          style={{ background: PRIMARY, color: '#fff' }}>Next →</button>
      </div>

      {words.length <= 30 && (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
          {words.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all"
              style={{ width: 8, height: 8, background: i === idx ? PRIMARY : '#d1d5db' }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function VocabHero({ stats, isLoggedIn }: { stats?: VocabStats; isLoggedIn: boolean }) {
  const known    = stats?.known ?? 0;
  const total    = stats?.total ?? 0;
  const learning = total - known;
  const pct      = total > 0 ? Math.round((known / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8" style={{ minHeight: 340 }}>
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#080d26 0%,#141c52 50%,#1a2460 100%)' }} />
      <div className="v-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 480, height: 480, top: -160, right: -100, background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 68%)' }} />
      <div className="v-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 340, height: 340, bottom: -100, left: -80, background: 'radial-gradient(circle,rgba(99,102,241,.16) 0%,transparent 68%)' }} />
      <div className="v-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 220, height: 220, top: '40%', left: '18%', background: 'radial-gradient(circle,rgba(167,139,250,.11) 0%,transparent 68%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.03,
      }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-8 py-10">
        {/* Left */}
        <div className="flex-1 text-center md:text-left">
          <div className="v-r1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#FADB43' }} />
            The Word Kitchen
          </div>
          <h1 className="v-r2 font-black leading-tight mb-3" style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)' }}>
            <span className="text-white">Stock Your</span><br />
            <span style={{
              backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
              backgroundSize: '200%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Vocabulary Pantry.</span>
          </h1>
          <p className="v-r3 text-sm font-medium mb-6 max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            550+ academic words — IELTS, TOEFL, PTE &amp; more. Mark what you know, drill what you don&apos;t.
          </p>
          {isLoggedIn && stats ? (
            <div className="v-r4 grid grid-cols-3 gap-3 max-w-sm mx-auto md:mx-0">
              <StatChip value={total}    label="Total"    />
              <StatChip value={known}    label="Learnt"   accent="#4ade80" />
              <StatChip value={learning} label="Learning" accent="#fb923c" />
            </div>
          ) : (
            <div className="v-r4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)' }}>
              <Link href="/login" className="font-bold underline" style={{ color: '#FADB43' }}>Log in</Link>
              &nbsp;to track your progress
            </div>
          )}
        </div>

        {/* Right — Speechef meter */}
        {isLoggedIn && stats && (
          <div className="v-r4 flex-shrink-0">
            <div className="rounded-2xl p-6 flex flex-col items-center gap-4"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', minWidth: 200 }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Speechef Meter</p>
              <SpeechefMeter pct={pct} known={known} total={total} />
              <div className="w-full space-y-2 mt-1">
                {[
                  { label: 'Basic',        value: stats.by_difficulty?.basic?.known        ?? 0, total: stats.by_difficulty?.basic?.total        ?? 0, color: '#22c55e' },
                  { label: 'Intermediate', value: stats.by_difficulty?.intermediate?.known ?? 0, total: stats.by_difficulty?.intermediate?.total ?? 0, color: '#f59e0b' },
                  { label: 'Advanced',     value: stats.by_difficulty?.advanced?.known     ?? 0, total: stats.by_difficulty?.advanced?.total     ?? 0, color: '#ef4444' },
                ].map(({ label, value, total: t, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <span>{label}</span><span>{value}/{t}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: t > 0 ? `${Math.round((value / t) * 100)}%` : '0%', background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function VocabListPage() {
  const storeLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Fix: re-check auth after client hydration so SSR false-negative is corrected
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(storeLoggedIn || isAuthenticated());
  }, [storeLoggedIn]);

  const queryClient = useQueryClient();

  const [difficulty,  setDifficulty]  = useState<typeof DIFF_TABS[number]>('all');
  const [examTab,     setExamTab]     = useState<typeof EXAM_TABS[number]>('all');
  const [knownFilter, setKnownFilter] = useState<KnownFilter>('all');
  const [viewMode,    setViewMode]    = useState<ViewMode>('grid');

  const { data: words = [], isLoading } = useQuery({
    queryKey: ['vocab', difficulty, examTab, knownFilter],
    queryFn: () => fetchVocab({ difficulty, exam_tag: examTab, known: knownFilter }),
    staleTime: 60_000,
  });

  const { data: stats } = useQuery({
    queryKey: ['vocab-stats'],
    queryFn: fetchStats,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  // Only invalidate stats — do NOT refetch word list so items grey out instead of vanishing
  const markMutation = useMutation({
    mutationFn: ({ id, known }: { id: number; known: boolean }) => markWord(id, known),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab-stats'] });
    },
  });

  const handleToggle = (id: number, known: boolean) => markMutation.mutate({ id, known });

  const VIEW_ICONS = [
    { mode: 'grid'      as ViewMode, icon: '⊞', label: 'Grid'      },
    { mode: 'list'      as ViewMode, icon: '☰', label: 'List'      },
    { mode: 'flashcard' as ViewMode, icon: '🃏', label: 'Flashcard' },
  ];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-5xl mx-auto">

        <Link href="/practice"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 hover:opacity-70 transition-opacity"
          style={{ color: PRIMARY }}>
          ← Back to Practice Hub
        </Link>

        <VocabHero stats={stats} isLoggedIn={isLoggedIn} />

        {/* Filters */}
        <div className="rounded-2xl px-5 py-4 mb-6 space-y-3" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0">Difficulty</span>
            <TabRow tabs={DIFF_TABS} active={difficulty} onChange={(v) => { setDifficulty(v); setKnownFilter('all'); }} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0">Exam</span>
            <TabRow tabs={EXAM_TABS} active={examTab}
              onChange={(v) => { setExamTab(v); setKnownFilter('all'); }}
              labelFn={(v) => v === 'all' ? 'All' : v.toUpperCase()} />
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0">Status</span>
              <div className="flex flex-wrap gap-2">
                {KNOWN_TABS.map((t) => (
                  <button key={t.value} onClick={() => setKnownFilter(t.value as KnownFilter)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                    style={knownFilter === t.value
                      ? { background: PRIMARY, color: '#fff' }
                      : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0">View</span>
            <div className="flex gap-2">
              {VIEW_ICONS.map(({ mode, icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                  style={viewMode === mode
                    ? { background: PRIMARY, color: '#fff' }
                    : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 mb-4">
          Showing {words.length} word{words.length !== 1 ? 's' : ''}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-44 animate-pulse" />)}
          </div>
        ) : words.length === 0 ? (
          <div className="rounded-2xl px-6 py-12 text-center" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-gray-700">No words match these filters.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting the difficulty, exam, or status filter.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {words.map((w) => <GridCard key={w.id} word={w} isLoggedIn={isLoggedIn} onToggle={handleToggle} />)}
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-2">
            {words.map((w) => <ListRow key={w.id} word={w} isLoggedIn={isLoggedIn} onToggle={handleToggle} />)}
          </div>
        ) : (
          <FlashcardView words={words} isLoggedIn={isLoggedIn} onToggle={handleToggle} />
        )}

      </div>
    </div>
  );
}
