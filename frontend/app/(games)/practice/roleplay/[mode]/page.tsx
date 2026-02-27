'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import ScoreArc from '../ScoreArc';

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

type Stage = 'setup' | 'session' | 'results';

interface Turn {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface ResultData {
  score: number;
  feedback: string;
  tips: string[];
  turns: Turn[];
}

const MODE_META: Record<string, { title: string; emoji: string; placeholder: string; topicLabel: string; suggestions: string[] }> = {
  job_interview: {
    title: 'Job Interview',
    emoji: '💼',
    placeholder: 'e.g. Software Engineer at Google',
    topicLabel: 'Role & Company',
    suggestions: ['Software Engineer at Google', 'Product Manager at a startup', 'Data Analyst at Amazon', 'Marketing Manager'],
  },
  presentation: {
    title: 'Presentation Pitch',
    emoji: '🎤',
    placeholder: 'e.g. Product launch pitch for a fintech app',
    topicLabel: 'Presentation Topic',
    suggestions: ['Product launch pitch', 'Investor funding round', 'Conference keynote talk', 'Business proposal'],
  },
  debate: {
    title: 'Debate',
    emoji: '🗣️',
    placeholder: 'e.g. Remote work is better than office work',
    topicLabel: 'Debate Topic',
    suggestions: ['Remote work vs office', 'AI in education', 'Universal basic income', 'Climate change policy'],
  },
  small_talk: {
    title: 'Small Talk',
    emoji: '💬',
    placeholder: 'e.g. Networking event at a tech conference',
    topicLabel: 'Scenario',
    suggestions: ['Tech networking event', 'First day at a new job', 'Coffee break with a colleague', 'Industry conference'],
  },
};

export default function RolePlaySessionPage() {
  const { mode } = useParams<{ mode: string }>();
  const router = useRouter();
  const meta = MODE_META[mode] ?? MODE_META.job_interview;
  const modeColor = MODE_COLORS[mode] ?? MODE_COLORS.job_interview;

  const [stage, setStage] = useState<Stage>('setup');
  const [topic, setTopic] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, aiThinking]);

  // Start session
  const startMutation = useMutation({
    mutationFn: () =>
      api.post('/roleplay/start/', { mode, topic }).then((r) => r.data),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setTurns([{
        role: 'assistant',
        content: data.opening_message,
        timestamp: new Date().toISOString(),
      }]);
      setStage('session');
    },
  });

  // Send user turn
  const turnMutation = useMutation({
    mutationFn: (message: string) =>
      api.post(`/roleplay/${sessionId}/turn/`, { message }).then((r) => r.data),
    onMutate: () => setAiThinking(true),
    onSuccess: (data) => {
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() },
      ]);
      setAiThinking(false);
    },
    onError: () => setAiThinking(false),
  });

  // Finish session
  const finishMutation = useMutation({
    mutationFn: () =>
      api.post(`/roleplay/${sessionId}/finish/`).then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      setStage('results');
    },
  });

  function sendMessage() {
    const text = draft.trim();
    if (!text || !sessionId) return;
    setTurns((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: new Date().toISOString() },
    ]);
    setDraft('');
    turnMutation.mutate(text);
  }

  // ── Setup screen ───────────────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border overflow-hidden" style={{ borderColor: modeColor.border }}>
          {/* Colored header band */}
          <div className="relative overflow-hidden px-6 py-6" style={{ background: modeColor.bg }}>
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
              style={{ background: modeColor.text, opacity: 0.12 }} />
            <Link href="/practice/roleplay" className="relative text-xs font-medium mb-3 block hover:underline"
              style={{ color: modeColor.text, opacity: 0.7 }}>
              ← Role Play
            </Link>
            <div className="relative flex items-center gap-4">
              <span className="text-5xl">{meta.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                  style={{ color: modeColor.text }}>Role Play</p>
                <h1 className="text-2xl font-bold" style={{ color: BRAND.primary }}>{meta.title}</h1>
              </div>
            </div>
          </div>

          {/* White body */}
          <div className="bg-white px-6 py-6">
            <p className="text-gray-500 text-sm mb-6">Set a topic to personalise your session, then jump in.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: BRAND.primary }}>
                  {meta.topicLabel} <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={meta.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startMutation.mutate();
                  }}
                />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2">
                {meta.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all"
                    style={topic === s
                      ? { borderColor: BRAND.primary, backgroundColor: '#f0f2ff', color: BRAND.primary, fontWeight: 600 }
                      : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#6b7280' }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                className="w-full py-3 rounded-full text-sm font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                {startMutation.isPending ? 'Starting…' : 'Start Session →'}
              </button>

              {startMutation.isError && (
                <p className="text-xs text-red-500 text-center">Failed to start. Please try again.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  if (stage === 'results' && result) {
    const scoreCol = SCORE_COLOR(result.score);
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: scoreCol.bg }}>
            {/* Score band */}
            <div className="px-6 py-6 text-center" style={{ background: scoreCol.bg }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: scoreCol.color }}>
                Session Complete
              </p>
              <div className="flex justify-center">
                <ScoreArc score={result.score} size={128} />
              </div>
              <p className="text-lg font-bold mt-4" style={{ color: BRAND.primary }}>Your Communication Score</p>
            </div>
            {/* White body */}
            <div className="bg-white px-6 py-5">
              <p className="text-gray-600 text-sm leading-relaxed">{result.feedback}</p>
            </div>
          </div>

          {result.tips.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold mb-4" style={{ color: BRAND.primary }}>3 Things to Improve</h2>
              <ol className="space-y-3">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: BRAND.primary }}>
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Conversation transcript accordion */}
          {result.turns.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 mb-6 overflow-hidden">
              <button
                onClick={() => setShowTranscript((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold hover:bg-gray-50 transition-colors"
                style={{ color: BRAND.primary }}
              >
                <span>View Conversation ({result.turns.length} turns)</span>
                <span className="text-gray-400">{showTranscript ? '▲' : '▼'}</span>
              </button>
              {showTranscript && (
                <div className="border-t border-gray-100 px-6 py-4 space-y-3 max-h-72 overflow-y-auto">
                  {result.turns.map((t, i) => {
                    const isUser = t.role === 'user';
                    return (
                      <div key={i} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                          <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: BRAND.primary, color: 'white' }}>
                            AI
                          </span>
                        )}
                        <div
                          className={`max-w-xs text-xs leading-relaxed rounded-xl px-3 py-2 ${
                            isUser ? 'rounded-tr-sm' : 'rounded-tl-sm bg-gray-50'
                          }`}
                          style={isUser ? { backgroundColor: BRAND.primary, color: 'white' } : undefined}
                        >
                          {t.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStage('setup');
                setTurns([]);
                setResult(null);
                setSessionId(null);
                setShowTranscript(false);
              }}
              className="flex-1 py-3 rounded-full text-sm font-bold border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND.primary, color: BRAND.primary }}
            >
              Try Again
            </button>
            <Link
              href="/practice/roleplay"
              className="flex-1 py-3 rounded-full text-sm font-bold text-center transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Other Modes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Session (chat) screen ──────────────────────────────────────────────────
  const userTurnCount = turns.filter((t) => t.role === 'user').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <p className="font-bold text-sm" style={{ color: BRAND.primary }}>{meta.title}</p>
            {topic && <p className="text-xs text-gray-400">{topic}</p>}
          </div>
        </div>
        <button
          onClick={() => finishMutation.mutate()}
          disabled={finishMutation.isPending || userTurnCount < 1}
          className="text-xs font-bold px-4 py-2 rounded-full disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: BRAND.primary, color: 'white' }}
        >
          {finishMutation.isPending ? 'Finishing…' : 'Finish & Score →'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {turns.map((t, i) => {
            const isUser = t.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5"
                    style={{ backgroundColor: BRAND.primary, color: 'white' }}>
                    AI
                  </div>
                )}
                <div
                  className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser ? 'rounded-tr-sm' : 'rounded-tl-sm bg-white border border-gray-100'
                  }`}
                  style={isUser ? { backgroundColor: BRAND.primary, color: 'white' } : undefined}
                >
                  {t.content}
                </div>
              </div>
            );
          })}

          {/* AI typing indicator */}
          {aiThinking && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2"
                style={{ backgroundColor: BRAND.primary, color: 'white' }}>
                AI
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your response…"
            rows={2}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || aiThinking || turnMutation.isPending}
            className="self-end px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Send
          </button>
        </div>
        <p className="max-w-2xl mx-auto text-xs text-gray-400 mt-2">
          Press Enter to send · Shift+Enter for new line · {userTurnCount} turn{userTurnCount !== 1 ? 's' : ''} so far
        </p>
      </div>
    </div>
  );
}
