'use client';

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

const MODE_SCORE_COLOR = (score: number) => {
  if (score >= 80) return { color: '#166534', bg: '#dcfce7' };
  if (score >= 60) return { color: '#92400e', bg: '#fef3c7' };
  return { color: '#991b1b', bg: '#fee2e2' };
};

export default function RolePlayHubPage() {
  const { data: sessions = [] } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const activeSession = sessions.find((s) => s.status === 'active');
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Practice</Link>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#141c52' }}>Role Play</h1>
            <p className="text-gray-500">AI-powered conversation practice. Choose a scenario, set your topic, and start talking.</p>
          </div>
          <Link href="/practice/roleplay/history"
            className="text-sm font-medium hover:underline mt-7"
            style={{ color: '#141c52' }}>
            History →
          </Link>
        </div>

        {/* Active session resume banner */}
        {activeSession && (() => {
          const meta = MODES.find((m) => m.id === activeSession.mode);
          return (
            <div
              className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-8"
              style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}
            >
              <div>
                <p className="text-xs font-semibold text-white/60 mb-0.5">Unfinished Session</p>
                <p className="text-sm font-bold">
                  {meta?.emoji ?? '🗣️'} {meta?.title ?? activeSession.mode}
                  {activeSession.topic ? ` — ${activeSession.topic}` : ''}
                </p>
              </div>
              <Link
                href={`/practice/roleplay/${activeSession.mode}`}
                className="shrink-0 text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Resume →
              </Link>
            </div>
          );
        })()}

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {MODES.map((mode) => (
            <div key={mode.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{mode.emoji}</div>
              <h2 className="font-bold text-lg mb-2" style={{ color: '#141c52' }}>{mode.title}</h2>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{mode.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {mode.examples.map((ex) => (
                  <span key={ex} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    {ex}
                  </span>
                ))}
              </div>
              <Link
                href={`/practice/roleplay/${mode.id}`}
                className="inline-block text-sm font-bold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Start Session →
              </Link>
            </div>
          ))}
        </div>

        {/* Per-mode stats */}
        {sessions.length > 0 && (() => {
          const finishedSessions = sessions.filter((s) => s.status === 'finished' && s.score != null);
          if (finishedSessions.length === 0) return null;

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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-lg mb-4" style={{ color: '#141c52' }}>Your Performance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modeStats.map((m) => {
                  const barColor = (m.avg ?? 0) >= 80 ? '#22c55e' : (m.avg ?? 0) >= 60 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={m.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{m.emoji}</span>
                        <p className="text-sm font-semibold" style={{ color: '#141c52' }}>{m.title}</p>
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
          );
        })()}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: '#141c52' }}>Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((s) => {
                const modeMeta = MODES.find((m) => m.id === s.mode);
                return (
                  <Link key={s.id} href={`/practice/roleplay/session/${s.id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{modeMeta?.emoji ?? '🗣️'}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#141c52' }}>
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
                        style={MODE_SCORE_COLOR(s.score)}>
                        {s.score} / 100
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">{s.status === 'active' ? 'In progress' : '—'}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
