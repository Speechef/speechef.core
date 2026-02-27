'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };
const GAME_COLOR = { bg: '#fef3c7', text: '#78350f', border: '#fde68a' };

interface DailyQuestion {
  id: number;
  word: string;
  correct_meaning: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  date: string;
}

const TODAY = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
const STORAGE_KEY = `dc_${TODAY}`;

function todayFormatted() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const ROLEPLAY_SUGGESTIONS = [
  { mode: 'job_interview', label: 'Job Interview Practice', topic: 'General position', emoji: '💼' },
  { mode: 'presentation', label: 'Presentation Pitch', topic: 'Your project', emoji: '🎤' },
  { mode: 'debate', label: 'Today\'s Debate', topic: 'Remote work is better', emoji: '🗣️' },
  { mode: 'small_talk', label: 'Small Talk', topic: 'Networking event', emoji: '💬' },
];

const todaySeed = parseInt(TODAY.replace(/-/g, ''), 10) % ROLEPLAY_SUGGESTIONS.length;
const todayRolePlay = ROLEPLAY_SUGGESTIONS[todaySeed];

export default function DailyChallengePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [storedResult, setStoredResult] = useState<{ correct: boolean; word: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAlreadyDone(true);
        setStoredResult(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const { data: question, isLoading } = useQuery<DailyQuestion>({
    queryKey: ['daily-challenge', TODAY],
    queryFn: () => api.get('/practice/daily/').then((r) => r.data),
    enabled: !alreadyDone,
  });

  const checkMutation = useMutation({
    mutationFn: async () => {
      if (!question || !selected) return { correct: false };
      const { data } = await api.post('/practice/guess/', {
        question_id: question.id,
        answer: selected,
      });
      return data;
    },
    onSuccess: (data) => {
      const correct: boolean = data.correct;
      setWasCorrect(correct);
      setSubmitted(true);
      if (correct) {
        api.post('/practice/guess/complete/', { score: 5 }).catch(() => {});
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ correct, word: question?.word ?? '' })
      );
    },
  });

  const options = question
    ? [question.option_a, question.option_b, question.option_c, question.option_d]
    : [];

  // ── Already completed today ────────────────────────────────────────────────
  if (alreadyDone && storedResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">← Practice</Link>

          <div className={`rounded-2xl p-8 text-center mb-6 ${storedResult.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className="text-4xl mb-3">{storedResult.correct ? '🎉' : '💪'}</p>
            <h1 className="text-xl font-bold mb-1" style={{ color: BRAND.primary }}>
              {storedResult.correct ? "You nailed it!" : "Better luck tomorrow!"}
            </h1>
            <p className="text-gray-500 text-sm">
              Today's word: <strong className="text-gray-700">{storedResult.word}</strong>
              {storedResult.correct && <span className="ml-2 text-green-600 font-semibold">+5 XP</span>}
            </p>
            <p className="text-xs text-gray-400 mt-2">Come back tomorrow for a new challenge.</p>
          </div>

          <BonusSection />
        </div>
      </div>
    );
  }

  // ── Result after submitting ────────────────────────────────────────────────
  if (submitted && wasCorrect !== null && question) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <div className={`rounded-2xl p-8 text-center mb-6 ${wasCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="text-4xl mb-3">{wasCorrect ? '🎉' : '😬'}</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: BRAND.primary }}>
              {wasCorrect ? 'Correct!' : 'Not quite!'}
            </h2>
            <p className="text-sm text-gray-600">
              <strong>{question.word}</strong> means: <em>{question.correct_meaning}</em>
            </p>
            {wasCorrect && (
              <p className="text-green-600 font-bold text-sm mt-2">+5 XP earned!</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Come back tomorrow for a new challenge.</p>
          </div>

          <BonusSection />
        </div>
      </div>
    );
  }

  // ── Challenge ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Colored page header band */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: GAME_COLOR.border }}>
          <div className="relative overflow-hidden px-6 py-5" style={{ background: GAME_COLOR.bg }}>
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
              style={{ background: GAME_COLOR.text, opacity: 0.12 }} />
            <Link href="/practice" className="relative text-xs font-medium mb-3 block hover:underline"
              style={{ color: GAME_COLOR.text, opacity: 0.7 }}>
              ← Practice
            </Link>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: BRAND.primary }}>Daily Challenge</h1>
                  <p className="text-xs" style={{ color: GAME_COLOR.text }}>{todayFormatted()}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: GAME_COLOR.text, color: 'white' }}>
                🔥 Daily
              </span>
            </div>
          </div>
        </div>

        {/* Word card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
            Word of the Day — What does this mean?
          </p>
          {isLoading || !question ? (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse mx-auto w-40" />
          ) : (
            <p className="text-4xl font-extrabold text-center" style={{ color: BRAND.primary }}>
              {question.word}
            </p>
          )}
        </div>

        {/* Options */}
        {!isLoading && question && (
          <>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(opt)}
                  className="text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: selected === opt ? BRAND.primary : '#e5e7eb',
                    backgroundColor: selected === opt ? '#f0f2ff' : 'white',
                    color: selected === opt ? BRAND.primary : '#374151',
                  }}
                >
                  <span className="font-bold mr-2" style={{ opacity: 0.5 }}>
                    {['A', 'B', 'C', 'D'][i]}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={() => checkMutation.mutate()}
              disabled={!selected || checkMutation.isPending}
              className="w-full py-3 rounded-full text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              {checkMutation.isPending ? 'Checking…' : 'Submit Answer →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function BonusSection() {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Keep practising today</p>

      <Link
        href={`/practice/roleplay/${todayRolePlay.mode}`}
        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <span className="text-3xl">{todayRolePlay.emoji}</span>
        <div>
          <p className="font-bold text-sm" style={{ color: '#141c52' }}>{todayRolePlay.label}</p>
          <p className="text-xs text-gray-400">Today's recommended session</p>
        </div>
        <span className="ml-auto text-gray-400 text-sm">→</span>
      </Link>

      <Link
        href="/practice/vocabulary-blitz"
        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <span className="text-3xl">⚡</span>
        <div>
          <p className="font-bold text-sm" style={{ color: '#141c52' }}>Vocabulary Blitz</p>
          <p className="text-xs text-gray-400">60-second rapid-fire quiz</p>
        </div>
        <span className="ml-auto text-gray-400 text-sm">→</span>
      </Link>

      <Link
        href="/practice/test-prep"
        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <span className="text-3xl">📝</span>
        <div>
          <p className="font-bold text-sm" style={{ color: '#141c52' }}>Test Prep</p>
          <p className="text-xs text-gray-400">IELTS, TOEFL and more</p>
        </div>
        <span className="ml-auto text-gray-400 text-sm">→</span>
      </Link>

      <Link
        href="/practice/history?game=daily"
        className="block text-center text-sm text-gray-400 hover:underline pt-1"
      >
        View session history →
      </Link>
    </div>
  );
}
