'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };
const GAME_COLOR = { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };

interface ScrambleQuestion {
  id: number;
  scrambled: string;
}

interface CheckResult {
  correct: boolean;
  word: string;
}

export default function WordScramblePage() {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: question, isLoading, isFetching, refetch } = useQuery<ScrambleQuestion>({
    queryKey: ['scramble-question'],
    queryFn: () => api.get('/practice/word-scramble/').then((r) => r.data),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;
    setSubmitting(true);
    try {
      const res = await api.post('/practice/word-scramble/check/', {
        question_id: question.id,
        answer: answer.trim(),
      });
      setResult(res.data);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setAnswer('');
    setResult(null);
    refetch();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No words available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto rounded-2xl border overflow-hidden" style={{ borderColor: GAME_COLOR.border }}>
        {/* Colored header band */}
        <div className="relative overflow-hidden px-6 py-5" style={{ background: GAME_COLOR.bg }}>
          <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
            style={{ background: GAME_COLOR.text, opacity: 0.12 }} />
          <Link href="/practice" className="relative text-xs font-medium mb-3 block hover:underline"
            style={{ color: GAME_COLOR.text, opacity: 0.7 }}>
            ← Practice
          </Link>
          <div className="relative flex items-center gap-3">
            <span className="text-3xl">🔤</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: GAME_COLOR.text }}>Word Game</p>
              <h1 className="text-xl font-bold" style={{ color: BRAND.primary }}>Word Scramble</h1>
            </div>
          </div>
        </div>

        {/* White body */}
        <div className="bg-white px-6 py-6">
          <p className="text-gray-500 text-sm mb-2">Unscramble these letters to form a word:</p>
          <div
            className="text-3xl font-bold text-center tracking-widest py-6 rounded-xl mb-6"
            style={{ backgroundColor: BRAND.primary, color: '#FADB43' }}
          >
            {question.scrambled.toUpperCase()}
          </div>

          {result ? (
            <>
              <div
                className={`text-sm px-4 py-3 rounded-xl mb-4 font-medium ${
                  result.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}
              >
                {result.correct
                  ? `Correct! The word was "${result.word}".`
                  : `Not quite. The word was "${result.word}". You answered: "${answer}".`}
              </div>
              <Button
                onClick={handleNext}
                disabled={isFetching}
                className="w-full rounded-full font-medium text-[#141c52]"
                style={{ backgroundColor: '#FADB43' }}
              >
                {isFetching ? 'Loading…' : 'Next Word →'}
              </Button>
              <Link
                href="/practice/history?game=scramble"
                className="block text-center text-sm text-gray-400 hover:underline mt-3"
              >
                View session history →
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer…"
                autoComplete="off"
                className="text-center text-lg"
                disabled={isFetching}
                required
              />
              <Button
                type="submit"
                disabled={!answer.trim() || submitting || isFetching}
                className="w-full rounded-full font-medium text-[#141c52]"
                style={{ backgroundColor: '#FADB43' }}
              >
                Submit
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
