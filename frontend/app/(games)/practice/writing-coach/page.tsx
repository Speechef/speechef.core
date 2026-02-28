'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const TEXT_TYPES = [
  { value: 'essay',        label: 'Essay',          emoji: '📝' },
  { value: 'email',        label: 'Email',          emoji: '✉️' },
  { value: 'cover_letter', label: 'Cover Letter',   emoji: '📄' },
  { value: 'ielts_task1',  label: 'IELTS Task 1',  emoji: '📊' },
  { value: 'ielts_task2',  label: 'IELTS Task 2',  emoji: '🏫' },
];

interface GrammarError { text: string; suggestion: string; }
interface WritingFeedback {
  score: number;
  band_score: number;
  grammar_errors: GrammarError[];
  vocabulary_rating: string;
  vocabulary_suggestions: string[];
  structure_feedback: string;
  coherence_feedback: string;
  improved_excerpt: string;
  narrative: string;
}

interface SessionItem {
  id: number;
  text_type: string;
  word_count: number;
  score: number | null;
  created_at: string;
  narrative: string;
}

function ScoreRing({ score }: { score: number }) {
  const clr = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const bg  = score >= 75 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <div className="flex flex-col items-center gap-1 p-4 rounded-2xl" style={{ background: bg }}>
      <span className="text-4xl font-extrabold" style={{ color: clr }}>{score}</span>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: clr }}>Score / 100</span>
    </div>
  );
}

export default function WritingCoachPage() {
  const { isLoggedIn } = useAuthStore();
  const qc = useQueryClient();

  const [textType, setTextType] = useState('essay');
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [showImproved, setShowImproved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const { data: history } = useQuery<SessionItem[]>({
    queryKey: ['writing-sessions'],
    queryFn: () => api.get('/writing/sessions/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  const { mutate: analyze, isPending } = useMutation({
    mutationFn: () => api.post('/writing/analyze/', { text_type: textType, text }),
    onSuccess: (res) => {
      setFeedback(res.data.feedback);
      qc.invalidateQueries({ queryKey: ['writing-sessions'] });
    },
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">← Practice Hub</Link>
          <h1 className="text-2xl font-extrabold mt-2" style={{ color: BRAND.primary }}>AI Writing Coach</h1>
          <p className="text-sm text-gray-500 mt-0.5">Paste your text and get instant grammar, vocabulary &amp; structure feedback.</p>
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-2">
          {TEXT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTextType(t.value)}
              className="px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
              style={textType === t.value
                ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            rows={10}
            className="w-full p-5 text-sm leading-relaxed text-gray-700 resize-none outline-none"
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{wordCount} words</span>
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                Log in to Analyze
              </Link>
            ) : (
              <button
                onClick={() => analyze()}
                disabled={isPending || !text.trim()}
                className="px-6 py-2 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                {isPending ? 'Analyzing…' : 'Analyze →'}
              </button>
            )}
          </div>
        </div>

        {/* Feedback panel */}
        {feedback && (
          <div className="space-y-4">

            {/* Scores row */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreRing score={feedback.score} />
              <div className="flex flex-col items-center gap-1 p-4 rounded-2xl" style={{ background: '#dbeafe' }}>
                <span className="text-4xl font-extrabold" style={{ color: '#1e40af' }}>{feedback.band_score}</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1e40af' }}>Band Score</span>
              </div>
            </div>

            {/* Narrative */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold mb-1" style={{ color: BRAND.primary }}>Coach Summary</p>
              <p className="text-sm text-gray-600 leading-relaxed">{feedback.narrative}</p>
            </div>

            {/* Grammar errors */}
            {feedback.grammar_errors?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>
                  Grammar Errors ({feedback.grammar_errors.length})
                </p>
                <div className="space-y-2">
                  {feedback.grammar_errors.map((e, i) => (
                    <div key={i} className="flex flex-col gap-0.5 text-sm p-3 rounded-xl bg-red-50 border border-red-100">
                      <span className="line-through text-red-500">{e.text}</span>
                      <span className="text-green-700">→ {e.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocab */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold mb-2" style={{ color: BRAND.primary }}>
                Vocabulary — <span className="font-normal text-gray-500">{feedback.vocabulary_rating}</span>
              </p>
              {feedback.vocabulary_suggestions?.length > 0 && (
                <ul className="space-y-1.5">
                  {feedback.vocabulary_suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-yellow-500 font-bold mt-0.5">→</span>{s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Structure & coherence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {feedback.structure_feedback && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold mb-1" style={{ color: BRAND.primary }}>Structure</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{feedback.structure_feedback}</p>
                </div>
              )}
              {feedback.coherence_feedback && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold mb-1" style={{ color: BRAND.primary }}>Coherence</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{feedback.coherence_feedback}</p>
                </div>
              )}
            </div>

            {/* Improved excerpt */}
            {feedback.improved_excerpt && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <button
                  onClick={() => setShowImproved((v) => !v)}
                  className="w-full flex items-center justify-between text-sm font-semibold"
                  style={{ color: BRAND.primary }}
                >
                  <span>Improved Excerpt</span>
                  <span>{showImproved ? '▲' : '▼'}</span>
                </button>
                {showImproved && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-3">
                    {feedback.improved_excerpt}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {isLoggedIn && history && history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Recent Sessions</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-sm p-3 rounded-xl bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-700 capitalize">{s.text_type.replace('_', ' ')}</span>
                    <span className="text-gray-400 ml-2">{s.word_count} words</span>
                    {s.narrative && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.narrative}</p>}
                  </div>
                  {s.score !== null && (
                    <span
                      className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: s.score >= 75 ? '#dcfce7' : s.score >= 50 ? '#fef3c7' : '#fee2e2',
                        color: s.score >= 75 ? '#166534' : s.score >= 50 ? '#92400e' : '#991b1b',
                      }}
                    >
                      {s.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
