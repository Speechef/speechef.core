'use client';
import { Suspense, useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

// ── Hero styles ──────────────────────────────────────────────────────────────
const TP_STYLES = `
  @keyframes tpOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(40px,-30px) scale(1.08); }
    66%      { transform:translate(-28px,22px) scale(0.94); }
  }
  @keyframes tpRise {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes tpFlagPop {
    from { opacity:0; transform:scale(0.7) translateY(20px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes tpChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes tpCta {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  .tp-orb-a { animation:tpOrbDrift 15s ease-in-out infinite; }
  .tp-orb-b { animation:tpOrbDrift 20s ease-in-out infinite reverse; }
  .tp-orb-c { animation:tpOrbDrift 12s ease-in-out infinite 2.5s; }
  .tp-rise-1 { animation:tpRise .85s ease both; }
  .tp-rise-2 { animation:tpRise .85s .18s ease both; }
  .tp-rise-3 { animation:tpRise .85s .34s ease both; }
  .tp-rise-4 { animation:tpRise .85s .52s ease both; }
  .tp-flag-1 { animation:tpFlagPop .6s .55s ease both; }
  .tp-flag-2 { animation:tpFlagPop .6s .68s ease both; }
  .tp-flag-3 { animation:tpFlagPop .6s .81s ease both; }
  .tp-flag-4 { animation:tpFlagPop .6s .94s ease both; }
  .tp-flag-5 { animation:tpFlagPop .6s 1.07s ease both; }
  .tp-chev   { animation:tpChev 1.9s ease-in-out infinite; }
  .tp-cta    { animation:tpCta 3s ease-in-out infinite; }
`;

const EXAM_FLAGS = [
  { flag: '🇬🇧', exam: 'IELTS',  scale: '0–9 bands',  cls: 'tp-flag-1', accent: 'rgba(124,58,237,0.55)',  bg: 'rgba(237,233,254,0.14)', border: 'rgba(196,181,253,0.55)' },
  { flag: '🇺🇸', exam: 'TOEFL',  scale: '0–120 pts',  cls: 'tp-flag-2', accent: 'rgba(29,78,216,0.55)',   bg: 'rgba(219,234,254,0.14)', border: 'rgba(147,197,253,0.55)' },
  { flag: '🌐',  exam: 'PTE',    scale: '10–90 pts',  cls: 'tp-flag-3', accent: 'rgba(6,95,70,0.55)',    bg: 'rgba(209,250,229,0.14)', border: 'rgba(110,231,183,0.55)' },
  { flag: '🇦🇺', exam: 'OET',    scale: 'Grade A–E',  cls: 'tp-flag-4', accent: 'rgba(154,52,18,0.55)',  bg: 'rgba(254,226,226,0.14)', border: 'rgba(252,165,165,0.55)' },
  { flag: '🇨🇦', exam: 'CELPIP', scale: 'Level 1–12', cls: 'tp-flag-5', accent: 'rgba(146,64,14,0.55)',  bg: 'rgba(254,243,199,0.14)', border: 'rgba(253,224,71,0.55)' },
];

function TestPrepHero({ onScrollDown }: { onScrollDown: () => void }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Ease-in-out cubic
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  // Background: wipes downward — top inset grows from 0% → 110%
  const wipe = e * 110;

  const textOpacity = Math.max(0, 1 - e * 1.9);
  const textScale   = 1 - e * 0.07;
  const chevOpacity = Math.max(0, 1 - e * 3.5);

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: TP_STYLES }} />

      {/* Background — top-down wipe */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
          clipPath: `inset(${wipe}% 0 0 0)`,
        }}
      />

      {/* Orbs */}
      <div className="tp-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 540, height: 540, top: -150, right: -110,
          background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 68%)',
          clipPath: `inset(${wipe}% 0 0 0)` }} />
      <div className="tp-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, bottom: -100, left: -120,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `inset(${wipe}% 0 0 0)` }} />
      <div className="tp-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 290, height: 290, top: '30%', left: '14%',
          background: 'radial-gradient(circle,rgba(167,139,250,.11) 0%,transparent 68%)',
          clipPath: `inset(${wipe}% 0 0 0)` }} />

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: Math.max(0, 0.035 - e * 0.035),
          clipPath: `inset(${wipe}% 0 0 0)`,
        }} />

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
        style={{ opacity: textOpacity, transform: `scale(${textScale})` }}
      >
        {/* Label */}
        <div className="tp-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
          Test Prep Hub
        </div>

        {/* Headline */}
        <h1 className="tp-rise-2 font-black leading-[1.02] mb-3"
          style={{ fontSize: 'clamp(2.6rem,7.5vw,5rem)' }}>
          <span style={{ color: '#fff' }}>Prepare for</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Your Exam.
          </span>
        </h1>

        {/* Sub */}
        <p className="tp-rise-3 text-sm font-medium mb-8 max-w-sm mx-auto"
          style={{ color: 'rgba(255,255,255,0.48)' }}>
          AI-scored sessions for IELTS, TOEFL, PTE, OET &amp; CELPIP — timed and realistic.
        </p>

        {/* ── Flag cards — the centrepiece ── */}
        <div className="flex items-stretch justify-center gap-3 mb-8 flex-wrap">
          {EXAM_FLAGS.map((ef) => (
            <div
              key={ef.exam}
              className={`${ef.cls} flex flex-col items-center gap-2 px-4 py-4 rounded-2xl select-none`}
              style={{
                background: ef.bg,
                border: `1.5px solid ${ef.border}`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)`,
                minWidth: '76px',
              }}
            >
              {/* Flag — the main star */}
              <span style={{ fontSize: '3.25rem', lineHeight: 1, filter: `drop-shadow(0 4px 12px ${ef.accent})` }}>
                {ef.flag}
              </span>
              <p className="text-xs font-extrabold text-white leading-none tracking-wide">{ef.exam}</p>
              <p className="text-[10px] font-semibold leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {ef.scale}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="tp-rise-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onScrollDown}
            className="tp-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Start Practicing ↓
          </button>
          <Link
            href="/practice/test-prep/ielts"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
          >
            🇬🇧 IELTS →
          </Link>
        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="tp-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
        style={{ opacity: chevOpacity }}
        aria-label="Scroll down"
      >
        <span className="text-[0.58rem] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.32)' }}>Scroll</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Gradient fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom,transparent,#f9fafb)' }} />
    </div>
  );
}

// ── Existing constants ───────────────────────────────────────────────────────

const SECTION_TYPE_META: Record<string, { bg: string; text: string; emoji: string }> = {
  Speaking:  { bg: '#ede9fe', text: '#6d28d9', emoji: '🎤' },
  Writing:   { bg: '#dbeafe', text: '#1e40af', emoji: '✍️' },
  Listening: { bg: '#d1fae5', text: '#065f46', emoji: '🎧' },
  Reading:   { bg: '#fef9c3', text: '#92400e', emoji: '📖' },
};

interface ExamSection {
  id: number;
  name: string;
  slug: string;
  section_type: string;
  question_count: number;
  time_limit_minutes: number;
  description: string;
}

interface Exam {
  id: number;
  name: string;
  slug: string;
  description: string;
  sections: ExamSection[];
  scoring_info: Record<string, unknown>;
}

const EXAM_ICONS: Record<string, string> = {
  ielts: '🎓',
  toefl: '📘',
  pte: '💡',
  oet: '🏥',
  celpip: '🍁',
};

const EXAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ielts:  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  toefl:  { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  pte:    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  oet:    { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  celpip: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  listening: '🎧 Listening',
  reading: '📖 Reading',
  writing: '✍️ Writing',
  speaking: '🎙️ Speaking',
};

const SECTION_FILTER_TABS = [
  { id: 'all', label: 'All Sections' },
  { id: 'speaking', label: '🎙️ Speaking' },
  { id: 'writing', label: '✍️ Writing' },
  { id: 'listening', label: '🎧 Listening' },
  { id: 'reading', label: '📖 Reading' },
];

const SCORING_GUIDES = [
  { slug_key: 'ielts',  label: 'IELTS',   scale: '0–9 bands',  target: 'Band 6.5–7.0' },
  { slug_key: 'toefl',  label: 'TOEFL',   scale: '0–120 pts',  target: '80–100 pts' },
  { slug_key: 'pte',    label: 'PTE',     scale: '10–90 pts',  target: '65+ pts' },
  { slug_key: 'oet',    label: 'OET',     scale: 'Grade A–E',  target: 'Grade B' },
  { slug_key: 'celpip', label: 'CELPIP',  scale: 'Level 1–12', target: 'Level 7+' },
];

// ── Hub content (needs Suspense for useSearchParams) ─────────────────────────

function TestPrepHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFilter = searchParams.get('section') ?? 'all';
  function setSectionFilter(val: string) {
    const url = val && val !== 'all' ? `/practice/test-prep?section=${val}` : '/practice/test-prep';
    router.push(url);
  }

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['testprep-exams'],
    queryFn: () => api.get('/testprep/exams/').then((r) => r.data),
  });

  const filteredExams = exams
    .map((exam) => ({
      ...exam,
      sections: sectionFilter === 'all'
        ? exam.sections
        : exam.sections.filter((s) => s.section_type === sectionFilter),
    }))
    .filter((exam) => sectionFilter === 'all' || exam.sections.length > 0);

  // Suppress unused import warning
  void SECTION_TYPE_META;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Practice</Link>
          <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#fe9940' }}>Test Prep</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND.primary }}>Prepare for Your Exam</h1>
          <p className="text-gray-500 text-sm">Timed, distraction-free practice sessions for IELTS, TOEFL, PTE, OET, and CELPIP. Each attempt is scored by our AI.</p>
        </div>

        {/* Scoring quick-reference */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {SCORING_GUIDES.map((g) => {
            const ec = EXAM_COLORS[g.slug_key] ?? { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
            return (
              <div key={g.slug_key} className="rounded-xl border overflow-hidden" style={{ borderColor: ec.border }}>
                <div className="py-2 text-center" style={{ background: ec.bg }}>
                  <p className="text-xs font-bold" style={{ color: ec.text }}>{g.label}</p>
                </div>
                <div className="bg-white px-2 py-2 text-center">
                  <p className="text-xs text-gray-500">{g.scale}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Target: {g.target}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section type filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {SECTION_FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSectionFilter(tab.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={sectionFilter === tab.id
                ? { background: BRAND.gradient, color: BRAND.primary, borderColor: 'transparent' }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold">No exams match this filter</p>
            <button
              onClick={() => setSectionFilter('all')}
              className="mt-3 text-sm hover:underline"
              style={{ color: BRAND.primary }}
            >
              View all exams
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExams.map((exam) => {
              const slugBase = exam.slug.split('-')[0];
              const icon = EXAM_ICONS[slugBase] ?? '📋';
              const ec = EXAM_COLORS[slugBase] ?? { bg: '#f8faff', text: BRAND.primary, border: '#e5e7eb' };
              return (
                <div key={exam.id} className="rounded-2xl border overflow-hidden hover:shadow-md transition-shadow"
                  style={{ borderColor: ec.border }}>
                  <div className="relative overflow-hidden p-6" style={{ background: ec.bg }}>
                    <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
                      style={{ background: ec.text, opacity: 0.1 }} />
                    <div className="relative flex items-center gap-3 mb-2">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: BRAND.primary }}>{exam.name}</h2>
                        <p className="text-xs uppercase tracking-wide" style={{ color: ec.text }}>{exam.slug}</p>
                      </div>
                    </div>
                    <p className="relative text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                  </div>

                  <div className="bg-white p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      {sectionFilter === 'all' ? 'All Sections' : `${sectionFilter.charAt(0).toUpperCase() + sectionFilter.slice(1)} Sections`}
                    </p>
                    <div className="space-y-2">
                      {exam.sections.map((section) => (
                        <Link
                          key={section.id}
                          href={`/practice/test-prep/${exam.slug}/${section.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: BRAND.primary }}>
                              {SECTION_TYPE_LABELS[section.section_type] ?? section.name}
                            </span>
                            <span className="text-xs text-gray-400">{section.name}</span>
                            {section.question_count > 0 && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                {section.question_count}q
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {section.time_limit_minutes > 0 && (
                              <span className="text-xs text-gray-400">⏱ {section.time_limit_minutes}m</span>
                            )}
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/practice/test-prep/${exam.slug}`}
                      className="mt-4 block text-center text-sm font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90"
                      style={{ background: BRAND.gradient, color: BRAND.primary }}
                    >
                      View Full Exam →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent attempts */}
        <section className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef9c3', color: '#92400e' }}>📋</span>
            <h2 className="font-bold" style={{ color: BRAND.primary }}>Recent Attempts</h2>
            <Link href="/practice" className="text-sm ml-auto hover:underline" style={{ color: BRAND.primary }}>← Practice</Link>
          </div>
          <RecentAttempts />
        </section>
      </div>
    </div>
  );
}

function RecentAttempts() {
  const { data: attempts = [], isLoading } = useQuery<{
    id: number;
    exam: { name: string; slug: string };
    section: { title: string; slug: string } | null;
    started_at: string;
    completed_at: string | null;
    predicted_score: { overall?: number; band_estimate?: string } | null;
  }[]>({
    queryKey: ['testprep-my-attempts'],
    queryFn: () => api.get('/testprep/attempts/my/').then((r) => r.data),
    retry: false,
  });

  if (isLoading) return <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />;
  if (attempts.length === 0) return (
    <p className="text-gray-400 text-sm text-center py-6">No attempts yet. Start a practice session above.</p>
  );

  return (
    <div className="space-y-2">
      {attempts.slice(0, 6).map((a) => (
        <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div>
            <p className="text-sm font-medium" style={{ color: '#141c52' }}>
              {a.exam.name}{a.section ? ` — ${a.section.title}` : ''}
            </p>
            <p className="text-xs text-gray-400">{new Date(a.started_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {a.completed_at ? (
              <div>
                {a.predicted_score?.band_estimate && (
                  <p className="text-sm font-bold" style={{ color: '#141c52' }}>{a.predicted_score.band_estimate}</p>
                )}
                <p className="text-xs text-gray-400">avg {a.predicted_score?.overall ?? '—'}/10</p>
              </div>
            ) : (
              <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Incomplete</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TestPrepHubPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <TestPrepHero
        onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />
      <div ref={contentRef}>
        <Suspense>
          <TestPrepHubContent />
        </Suspense>
      </div>
    </>
  );
}
