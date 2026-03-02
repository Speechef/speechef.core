'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

// ── Hero styles ──────────────────────────────────────────────────────────────
const RP_STYLES = `
  @keyframes rpOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(38px,-30px) scale(1.08); }
    66%      { transform:translate(-26px,22px) scale(0.94); }
  }
  @keyframes rpRise {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes rpChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes rpCta {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  @keyframes rpCount {
    from { opacity:0; transform:scale(0.6) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .rp-orb-a { animation:rpOrbDrift 14s ease-in-out infinite; }
  .rp-orb-b { animation:rpOrbDrift 19s ease-in-out infinite reverse; }
  .rp-orb-c { animation:rpOrbDrift 11s ease-in-out infinite 3.5s; }
  .rp-rise-1 { animation:rpRise .85s ease both; }
  .rp-rise-2 { animation:rpRise .85s .18s ease both; }
  .rp-rise-3 { animation:rpRise .85s .34s ease both; }
  .rp-rise-4 { animation:rpRise .85s .52s ease both; }
  .rp-chev   { animation:rpChev 1.9s ease-in-out infinite; }
  .rp-cta    { animation:rpCta 3s ease-in-out infinite; }
  .rp-stat   { animation:rpCount .6s ease both; }
  .rp-stat-1 { animation-delay:.55s; }
  .rp-stat-2 { animation-delay:.72s; }
  .rp-stat-3 { animation-delay:.89s; }
`;


const RP_STATS = [
  { value: '4',    label: 'Modes' },
  { value: '100',  label: 'Score / pt' },
  { value: 'AI',   label: 'Powered' },
];

function RolePlayHero({ onScrollDown }: { onScrollDown: () => void }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Ease-in-out cubic
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  // Background: wipes leftward — left inset grows from 0% → 110%
  const wipe = e * 110;

  const textOpacity = Math.max(0, 1 - e * 1.9);
  const textScale   = 1 - e * 0.07;
  const chevOpacity = Math.max(0, 1 - e * 3.5);

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: RP_STYLES }} />

      {/* Background — left-to-right wipe (left inset grows) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
          clipPath: `inset(0 0 0 ${wipe}%)`,
        }}
      />

      {/* Orbs */}
      <div className="rp-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 540, height: 540, top: -150, right: -110,
          background: 'radial-gradient(circle,rgba(250,219,67,.13) 0%,transparent 68%)',
          clipPath: `inset(0 0 0 ${wipe}%)` }} />
      <div className="rp-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, bottom: -100, left: -120,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `inset(0 0 0 ${wipe}%)` }} />
      <div className="rp-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 290, height: 290, top: '30%', left: '14%',
          background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 68%)',
          clipPath: `inset(0 0 0 ${wipe}%)` }} />

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: Math.max(0, 0.035 - e * 0.035),
          clipPath: `inset(0 0 0 ${wipe}%)`,
        }} />


      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
        style={{ opacity: textOpacity, transform: `scale(${textScale})` }}
      >
        {/* Label */}
        <div className="rp-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
          AI Roleplay
        </div>

        {/* Headline */}
        <h1 className="rp-rise-2 font-black leading-[1.02] mb-4"
          style={{ fontSize: 'clamp(2.8rem,8vw,5.5rem)' }}>
          <span style={{ color: '#fff' }}>Speak Confidently.</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Every Time.
          </span>
        </h1>

        {/* Sub */}
        <p className="rp-rise-3 text-base font-medium mb-9 max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.48)' }}>
          4 conversation modes — interviews, presentations, debates &amp; small talk. AI scores every response.
        </p>

        {/* Stat row */}
        <div className="rp-rise-3 flex items-center justify-center gap-10 mb-10">
          {RP_STATS.map((s, i) => (
            <div key={s.label} className={`rp-stat rp-stat-${i + 1} text-center`}>
              <p className="text-3xl font-black text-white leading-none">{s.value}</p>
              <p className="text-xs font-semibold mt-1.5 uppercase tracking-wide"
                style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="rp-rise-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onScrollDown}
            className="rp-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Start Practicing ↓
          </button>
          <Link
            href="/practice/roleplay/job_interview"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
          >
            💼 Job Interview →
          </Link>
        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="rp-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
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

// ── Existing page code ───────────────────────────────────────────────────────

const SCORE_COLOR = (s: number) =>
  s >= 80 ? { color: '#166534', bg: '#dcfce7' }
  : s >= 60 ? { color: '#92400e', bg: '#fef3c7' }
  : { color: '#991b1b', bg: '#fee2e2' };

const MODE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  job_interview: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  presentation:  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  debate:        { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  small_talk:    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
};

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
  {
    id: 'job_interview',
    title: 'Job Interview',
    description: 'Practice answering common interview questions with an AI interviewer. Get scored on clarity, confidence, and relevance.',
    emoji: '💼',
    examples: ['Software Engineer at Google', 'Marketing Manager', 'Data Analyst'],
  },
  {
    id: 'presentation',
    title: 'Presentation Pitch',
    description: 'Deliver your pitch to an AI audience. Get challenged with follow-up questions and improve your presentation skills.',
    emoji: '🎤',
    examples: ['Product launch pitch', 'Business proposal', 'Conference talk'],
  },
  {
    id: 'debate',
    title: 'Debate',
    description: 'Sharpen your argumentation skills by debating with an AI that takes the opposing side on any topic.',
    emoji: '🗣️',
    examples: ['Remote work vs office', 'AI in education', 'Climate policy'],
  },
  {
    id: 'small_talk',
    title: 'Small Talk',
    description: 'Practice casual English conversation in everyday situations — networking events, social gatherings, and more.',
    emoji: '💬',
    examples: ['Networking event', 'Coffee break chat', 'First day at work'],
  },
];

export default function RolePlayHubPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [modeFilter, setModeFilter] = useState('');

  const { data: sessions = [] } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const activeSession = sessions.find((s) => s.status === 'active');
  const filteredForRecent = modeFilter ? sessions.filter((s) => s.mode === modeFilter) : sessions;
  const recentSessions = filteredForRecent.slice(0, 5);

  const finishedSessions = sessions.filter((s) => s.status === 'finished' && s.score != null);
  const totalSessions = sessions.length;
  const avgScore = finishedSessions.length > 0
    ? Math.round(finishedSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / finishedSessions.length)
    : null;

  return (
    <>
      <RolePlayHero
        onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <div ref={contentRef} className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Practice</Link>
              <h1 className="text-3xl font-bold mb-1" style={{ color: BRAND.primary }}>Role Play</h1>
              <p className="text-gray-500">AI-powered conversation practice. Choose a scenario, set your topic, and start talking.</p>
            </div>
            <Link href="/practice/roleplay/history"
              className="text-sm font-medium hover:underline mt-7"
              style={{ color: BRAND.primary }}>
              History →
            </Link>
          </div>

          {/* Stat pills */}
          {totalSessions > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
                🗣️ {totalSessions} session{totalSessions !== 1 ? 's' : ''}
              </span>
              {avgScore !== null && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
                  🏆 Avg score {avgScore}/100
                </span>
              )}
            </div>
          )}

          {/* Active session resume banner */}
          {activeSession && (() => {
            const meta = MODES.find((m) => m.id === activeSession.mode);
            return (
              <div
                className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-8"
                style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white/60 mb-0.5">Unfinished Session</p>
                    <p className="text-sm font-bold">
                      {meta?.emoji ?? '🗣️'} {meta?.title ?? activeSession.mode}
                      {activeSession.topic ? ` — ${activeSession.topic}` : ''}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/practice/roleplay/${activeSession.mode}`}
                  className="shrink-0 text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}
                >
                  Resume →
                </Link>
              </div>
            );
          })()}

          {/* Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {MODES.map((mode) => {
              const mc = MODE_COLORS[mode.id];
              return (
                <div key={mode.id} className="rounded-2xl border overflow-hidden hover:shadow-md transition-shadow"
                  style={{ borderColor: mc.border }}>
                  <div className="relative overflow-hidden px-5 py-5" style={{ background: mc.bg }}>
                    <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
                      style={{ background: mc.text, opacity: 0.12 }} />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mode.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                            style={{ color: mc.text }}>Role Play</p>
                          <h2 className="font-bold text-base" style={{ color: BRAND.primary }}>{mode.title}</h2>
                        </div>
                      </div>
                      <Link
                        href={`/practice/roleplay/${mode.id}`}
                        className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                        style={{ background: BRAND.gradient, color: BRAND.primary }}
                      >
                        Start →
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white px-5 py-4">
                    <p className="text-gray-500 text-sm mb-3 leading-relaxed">{mode.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mode.examples.map((ex) => (
                        <span key={ex} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-mode stats */}
          {sessions.length > 0 && (() => {
            const modeStats = MODES.map((mode) => {
              const modeSessions = finishedSessions.filter((s) => s.mode === mode.id);
              const count = modeSessions.length;
              const avg = count > 0
                ? Math.round(modeSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / count)
                : null;
              const best = count > 0 ? Math.max(...modeSessions.map((s) => s.score ?? 0)) : null;
              return { ...mode, count, avg, best };
            }).filter((m) => m.count > 0);

            if (modeStats.length === 0) return null;

            return (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef3c7', color: '#92400e' }}>🏆</span>
                  <h2 className="font-bold text-lg" style={{ color: BRAND.primary }}>Your Performance</h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modeStats.map((m) => {
                      const barColor = (m.avg ?? 0) >= 80 ? '#22c55e' : (m.avg ?? 0) >= 60 ? '#f59e0b' : '#ef4444';
                      return (
                        <div key={m.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span>{m.emoji}</span>
                            <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>{m.title}</p>
                            <span className="ml-auto text-xs text-gray-400">{m.count} session{m.count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${m.avg ?? 0}%`, backgroundColor: barColor }} />
                            </div>
                            <span className="text-sm font-bold w-14 text-right" style={{ color: barColor }}>
                              avg {m.avg}
                            </span>
                          </div>
                          {m.best != null && (
                            <p className="text-xs text-gray-400 mt-1">Best: {m.best}/100</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Recent Sessions */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="font-bold text-lg" style={{ color: BRAND.primary }}>Recent Sessions</h2>
                <div className="flex flex-wrap gap-1.5">
                  {[{ id: '', emoji: '🗣️', title: 'All' }, ...MODES].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModeFilter(m.id)}
                      className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors border"
                      style={
                        modeFilter === m.id
                          ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                          : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
                      }
                    >
                      {m.emoji} {m.title}
                    </button>
                  ))}
                </div>
              </div>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No {modeFilter ? MODES.find((m) => m.id === modeFilter)?.title : ''} sessions yet.
                </p>
              ) : (
              <div className="space-y-3">
                {recentSessions.map((s) => {
                  const modeMeta = MODES.find((m) => m.id === s.mode);
                  return (
                    <Link key={s.id} href={`/practice/roleplay/session/${s.id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{modeMeta?.emoji ?? '🗣️'}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>
                            {modeMeta?.title ?? s.mode}
                            {s.topic && <span className="font-normal text-gray-500"> — {s.topic}</span>}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' · '}{s.status}
                          </p>
                        </div>
                      </div>
                      {s.score != null ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={SCORE_COLOR(s.score)}>
                          {s.score} / 100
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{s.status === 'active' ? 'In progress' : '—'}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
