'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

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

function ScoreArc({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{score}</span>
        <span className="text-xs text-gray-400">/100</span>
      </div>
    </div>
  );
}

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
        <p className="font-semibold" style={{ color: '#141c52' }}>Session not found</p>
        <Link href="/practice/roleplay" className="text-sm text-gray-400 hover:underline">← Back to Role Play</Link>
      </div>
    );
  }

  const meta = MODE_META[session.mode] ?? { title: session.mode, emoji: '🗣️' };
  const userTurns = session.turns.filter((t) => t.role === 'user');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <Link href="/practice/roleplay" className="text-sm text-gray-400 hover:text-gray-600 mb-3 block">
            ← Role Play
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#141c52' }}>{meta.title}</h1>
              {session.topic && (
                <p className="text-gray-500 text-sm">{session.topic}</p>
              )}
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">
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

        {/* Score + feedback */}
        {session.score !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Session Score</p>
            <ScoreArc score={session.score} />
            {session.ai_feedback && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed max-w-md mx-auto">
                {session.ai_feedback}
              </p>
            )}
          </div>
        )}

        {/* Tips */}
        {session.tips && session.tips.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-3" style={{ color: '#141c52' }}>Improvement Tips</h2>
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
          <h2 className="font-bold mb-4" style={{ color: '#141c52' }}>
            Conversation Replay
            <span className="text-sm font-normal text-gray-400 ml-2">
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
                  style={turn.role === 'user' ? { backgroundColor: '#141c52' } : undefined}
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
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Practice Again →
          </Link>
          <Link
            href="/practice/roleplay"
            className="flex-1 py-3 rounded-full text-sm font-bold text-center border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
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
