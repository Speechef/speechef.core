'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Question {
  id: number;
  word: string;
  options: string[];
}

interface GuessResult {
  correct: boolean;
  correct_meaning: string;
}

export default function GuessTheWordPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: question, isLoading, refetch } = useQuery<Question>({
    queryKey: ['guess-question'],
    queryFn: () => api.get('/practice/question/').then((r) => r.data),
  });

  async function handleSubmit() {
    if (!selected || !question) return;
    setSubmitting(true);
    try {
      const res = await api.post('/practice/guess/', {
        question_id: question.id,
        selected_meaning: selected,
      });
      setResult(res.data);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setSelected(null);
    setResult(null);
    refetch();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading question…</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No questions available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: '#141c52' }}>
            Guess the Word
          </h1>
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">
            ← Games
          </Link>
        </div>

        <p className="text-gray-500 text-sm mb-2">What does this word mean?</p>
        <div
          className="text-3xl font-bold text-center py-6 rounded-xl mb-6"
          style={{ backgroundColor: '#141c52', color: '#FADB43' }}
        >
          {question.word}
        </div>

        <div className="space-y-3 mb-6">
          {question.options.map((option) => {
            let style: React.CSSProperties = { borderColor: '#e5e7eb', backgroundColor: '#fff' };
            if (result) {
              if (option === result.correct_meaning) {
                style = { borderColor: '#16a34a', backgroundColor: '#f0fdf4' };
              } else if (option === selected && !result.correct) {
                style = { borderColor: '#dc2626', backgroundColor: '#fef2f2' };
              }
            } else if (option === selected) {
              style = { borderColor: '#141c52', backgroundColor: '#eef0ff' };
            }

            return (
              <button
                key={option}
                onClick={() => !result && setSelected(option)}
                disabled={!!result}
                className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors"
                style={style}
              >
                {option}
              </button>
            );
          })}
        </div>

        {result && (
          <div
            className={`text-sm px-4 py-3 rounded-xl mb-4 font-medium ${
              result.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {result.correct ? 'Correct!' : `Wrong — the answer was: ${result.correct_meaning}`}
          </div>
        )}

        {!result ? (
          <Button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full rounded-full font-medium text-[#141c52]"
            style={{ backgroundColor: '#FADB43' }}
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full rounded-full font-medium text-[#141c52]"
            style={{ backgroundColor: '#FADB43' }}
          >
            Next Question →
          </Button>
        )}
      </div>
    </div>
  );
}
