'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
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
                {/* Colored header band */}
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
                {/* White body */}
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
  );
}
