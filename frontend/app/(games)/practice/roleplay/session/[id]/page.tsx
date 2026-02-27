'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import ScoreArc from '../../ScoreArc';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const MODE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  job_interview: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  presentation:  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  debate:        { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  small_talk:    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? { color: '#166534', bg: '#dcfce7' }
  : s >= 60 ? { color: '#92400e', bg: '#fef3c7' }
  : { color: '#991b1b', bg: '#fee2e2' };

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SessionDetail {
  id: number;
  mode: string;
  topic: string;
  turns: Turn[];
  score: number | null;
  ai_feedback: string;
  tips: string[];
  started_at: string;
  finished_at: string | null;
  status: string;
}

const MODE_META: Record<string, { title: string; emoji: string }> = {
  job_interview: { title: 'Job Interview', emoji: '💼' },
  presentation:  { title: 'Presentation Pitch', emoji: '🎤' },
  debate:        { title: 'Debate', emoji: '🗣️' },
  small_talk:    { title: 'Small Talk', emoji: '💬' },
};

export default function RolePlaySessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  const { data: session, isLoading, isError } = useQuery<SessionDetail>({
    queryKey: ['roleplay-session', id],
    queryFn: () => api.get(`/roleplay/${id}/`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-4xl">🗣️</p>
        <p className="font-semibold" style={{ color: BRAND.primary }}>Session not found</p>
        <Link href="/practice/roleplay" className="text-sm text-gray-400 hover:underline">← Back to Role Play</Link>
      </div>
    );
  }

  const meta = MODE_META[session.mode] ?? { title: session.mode, emoji: '🗣️' };
  const modeColor = MODE_COLORS[session.mode] ?? MODE_COLORS.job_interview;
  const userTurns = session.turns.filter((t) => t.role === 'user');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Colored header band */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: modeColor.border }}>
          <div className="relative overflow-hidden px-6 py-5" style={{ background: modeColor.bg }}>
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full"
              style={{ background: modeColor.text, opacity: 0.1 }} />
            <Link href="/practice/roleplay" className="relative text-xs font-medium mb-3 block hover:underline"
              style={{ color: modeColor.text, opacity: 0.7 }}>
              ← Role Play
            </Link>
            <div className="relative flex items-center gap-3">
              <span className="text-3xl">{meta.emoji}</span>
              <div className="flex-1">
                <h1 className="text-xl font-bold" style={{ color: BRAND.primary }}>{meta.title}</h1>
                {session.topic && (
                  <p className="text-sm mt-0.5" style={{ color: modeColor.text }}>{session.topic}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">
                  {new Date(session.started_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  session.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {session.status === 'finished' ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score + feedback */}
        {session.score !== null && (() => {
          const scoreCol = SCORE_COLOR(session.score);
          return (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: scoreCol.bg }}>
              <div className="px-6 py-5 text-center" style={{ background: scoreCol.bg }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: scoreCol.color }}>
                  Session Score
                </p>
                <div className="flex justify-center">
                  <ScoreArc score={session.score} size={128} />
                </div>
              </div>
              {session.ai_feedback && (
                <div className="bg-white px-6 py-4">
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                    {session.ai_feedback}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tips */}
        {session.tips && session.tips.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.primary }}>
              <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef3c7', color: '#92400e' }}>💡</span>
              Improvement Tips
            </h2>
            <ul className="space-y-2">
              {session.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#FADB43] font-bold mt-0.5">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conversation */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: BRAND.primary }}>
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#dbeafe', color: '#1e40af' }}>💬</span>
            Conversation Replay
            <span className="text-sm font-normal text-gray-400 ml-1">
              ({userTurns.length} response{userTurns.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <div className="space-y-3">
            {session.turns.map((turn, i) => (
              <div
                key={i}
                className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    turn.role === 'user'
                      ? 'rounded-br-sm text-white'
                      : 'rounded-bl-sm bg-gray-100 text-gray-700'
                  }`}
                  style={turn.role === 'user' ? { backgroundColor: BRAND.primary } : undefined}
                >
                  {turn.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/practice/roleplay/${session.mode}`}
            className="flex-1 py-3 rounded-full text-sm font-bold text-center transition-opacity hover:opacity-90"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Practice Again →
          </Link>
          <Link
            href="/practice/roleplay"
            className="flex-1 py-3 rounded-full text-sm font-bold text-center border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: BRAND.primary, color: BRAND.primary }}
          >
            All Sessions
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/practice/roleplay/session/${id}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex-1 py-3 rounded-full text-sm font-bold text-center border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

      </div>
    </div>
  );
}
