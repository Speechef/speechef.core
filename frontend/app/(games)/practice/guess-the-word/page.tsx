'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MAX_WRONG = 3;
const POINTS_PER_CORRECT = 10;

interface Question {
  id: number;
  word: string;
  options: string[];
}

interface GuessResult {
  correct: boolean;
  correct_meaning: string;
}

function LivesDisplay({ wrongAttempts }: { wrongAttempts: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_WRONG }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: i < wrongAttempts ? '#dc2626' : '#16a34a' }}
        />
      ))}
    </div>
  );
}

export default function GuessTheWordPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const { data: question, isLoading, refetch } = useQuery<Question>({
    queryKey: ['guess-question'],
    queryFn: () => api.get('/practice/question/').then((r) => r.data),
  });

  const { data: bestData, refetch: refetchBest } = useQuery<{ best: number }>({
    queryKey: ['my-best-guess'],
    queryFn: () => api.get('/practice/my-best/?game=guess').then((r) => r.data),
    retry: false,
  });

  const personalBest = bestData?.best ?? 0;

  async function handleSubmit() {
    if (!selected || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post('/practice/guess/', {
        question_id: question.id,
        answer: selected,
      });
      setResult(res.data);

      if (res.data.correct) {
        setCurrentScore((prev) => prev + POINTS_PER_CORRECT);
      } else {
        const newWrong = wrongAttempts + 1;
        setWrongAttempts(newWrong);

        if (newWrong >= MAX_WRONG) {
          try {
            await api.post('/practice/guess/complete/', { score: currentScore });
            refetchBest();
          } catch {
            // not logged in — score not saved, continue to game over screen
          }
          setIsGameOver(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setSelected(null);
    setResult(null);
    refetch();
  }

  function handlePlayAgain() {
    setCurrentScore(0);
    setWrongAttempts(0);
    setIsGameOver(false);
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

  if (isGameOver) {
    const isNewBest = currentScore > 0 && currentScore >= personalBest;
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-5xl mb-4">💀</div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>
            Game Over
          </h2>
          <p className="text-gray-500 text-sm mb-6">3 wrong answers — better luck next time!</p>

          <div className="flex justify-center gap-8 mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your Score</p>
              <p className="text-4xl font-bold" style={{ color: '#141c52' }}>
                {currentScore}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Personal Best</p>
              <p className="text-4xl font-bold" style={{ color: '#FADB43' }}>
                {isNewBest ? currentScore : personalBest}
              </p>
            </div>
          </div>

          {isNewBest && (
            <p className="text-green-600 text-sm font-medium mb-4">New personal best!</p>
          )}

          <Button
            onClick={handlePlayAgain}
            className="w-full rounded-full font-medium text-[#141c52]"
            style={{ backgroundColor: '#FADB43' }}
          >
            Play Again
          </Button>
          <Link
            href="/practice"
            className="block text-sm text-gray-400 hover:underline mt-4"
          >
            ← Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold" style={{ color: '#141c52' }}>
            Guess the Word
          </h1>
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">
            ← Games
          </Link>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 mb-5 text-sm">
          <div>
            <span className="text-gray-400">Score </span>
            <span className="font-bold" style={{ color: '#141c52' }}>
              {currentScore} pts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Lives</span>
            <LivesDisplay wrongAttempts={wrongAttempts} />
          </div>
          <div>
            <span className="text-gray-400">Best </span>
            <span className="font-bold" style={{ color: '#141c52' }}>
              {personalBest} pts
            </span>
          </div>
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
            {result.correct
              ? `Correct! +${POINTS_PER_CORRECT} pts`
              : `Wrong — the answer was: ${result.correct_meaning}${
                  wrongAttempts >= MAX_WRONG - 1 && !isGameOver
                    ? ' (last life!)'
                    : ` (${MAX_WRONG - wrongAttempts} ${MAX_WRONG - wrongAttempts === 1 ? 'life' : 'lives'} left)`
                }`}
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
