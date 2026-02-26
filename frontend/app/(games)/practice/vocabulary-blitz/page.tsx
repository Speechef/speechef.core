'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const GAME_DURATION = 60; // seconds

interface Question {
  id: number;
  word: string;
  correct_meaning: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

type AnswerState = 'idle' | 'correct' | 'wrong';
type Stage = 'idle' | 'playing' | 'finished';

async function fetchQuestion(): Promise<Question> {
  const { data } = await api.get('/practice/question/');
  return data;
}

async function checkAnswer(questionId: number, answer: string): Promise<boolean> {
  const { data } = await api.post('/practice/guess/', { question_id: questionId, answer });
  return data.correct;
}

export default function VocabularyBlitzPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingRef = useRef(false);

  const saveMutation = useMutation({
    mutationFn: (finalScore: number) =>
      api.post('/practice/guess/complete/', { score: finalScore, game: 'blitz' }),
  });

  const loadNextQuestion = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const q = await fetchQuestion();
      setQuestion(q);
      setAnswerState('idle');
    } catch {
      // ignore
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const endGame = useCallback((finalScore: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    saveMutation.mutate(finalScore);
    setStage('finished');
  }, [saveMutation]);

  // Start game
  const startGame = useCallback(async () => {
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(GAME_DURATION);
    setStage('playing');
    await loadNextQuestion();
  }, [loadNextQuestion]);

  // Timer
  useEffect(() => {
    if (stage !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setScore((s) => {
            endGame(s);
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, endGame]);

  async function handleAnswer(option: string) {
    if (!question || answerState !== 'idle' || stage !== 'playing') return;

    const correct = await checkAnswer(question.id, option);
    setQuestionsAnswered((q) => q + 1);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setAnswerState('correct');
      setTimeout(() => loadNextQuestion(), 300);
    } else {
      setStreak(0);
      setAnswerState('wrong');
      setTimeout(() => loadNextQuestion(), 600);
    }
  }

  const options = question
    ? [question.option_a, question.option_b, question.option_c, question.option_d]
    : [];

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#141c52';
  const timerBg = timeLeft <= 10 ? '#fee2e2' : timeLeft <= 20 ? '#fef3c7' : '#dbeafe';

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block text-left">
            ← Practice
          </Link>
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>Vocabulary Blitz</h1>
          <p className="text-gray-500 text-sm mb-6">
            Answer as many word questions as you can in <strong>60 seconds</strong>.
            Questions advance automatically on correct answers.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8 text-center text-sm">
            {[
              { icon: '⏱', label: '60 seconds' },
              { icon: '✅', label: '+1 per correct' },
              { icon: '🔥', label: 'Streak bonus' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl py-3">
                <p className="text-xl mb-0.5">{item.icon}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            className="w-full py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Start Blitz →
          </button>
        </div>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (stage === 'finished') {
    const accuracy = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="text-5xl mb-4">
            {score >= 20 ? '🏆' : score >= 10 ? '🌟' : '⚡'}
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>Blitz Complete!</h1>
          <p className="text-5xl font-extrabold my-4" style={{ color: '#141c52' }}>{score}</p>
          <p className="text-gray-400 text-sm mb-6">correct answers in 60 seconds</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Answered', value: questionsAnswered },
              { label: 'Accuracy', value: `${accuracy}%` },
              { label: 'Best Streak', value: `${bestStreak}🔥` },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl py-3">
                <p className="font-bold text-lg" style={{ color: '#141c52' }}>{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-full text-sm font-bold border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: '#141c52', color: '#141c52' }}
            >
              Play Again
            </button>
            <Link
              href="/practice"
              className="flex-1 py-3 rounded-full text-sm font-bold text-center"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              More Games
            </Link>
          </div>
          <Link
            href="/practice/history?game=blitz"
            className="block text-center text-sm text-gray-400 hover:underline mt-4"
          >
            View session history →
          </Link>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* HUD */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{score}</span>
            <span className="text-sm text-gray-400">pts</span>
            {streak >= 3 && (
              <span className="text-sm font-bold text-orange-500">{streak}🔥</span>
            )}
          </div>
          <div
            className="px-4 py-1.5 rounded-full text-lg font-extrabold tabular-nums"
            style={{ color: timerColor, backgroundColor: timerBg }}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(timeLeft / GAME_DURATION) * 100}%`,
              backgroundColor: timerColor,
            }}
          />
        </div>

        {/* Question card */}
        <div
          className={`bg-white rounded-2xl border p-8 text-center mb-5 transition-colors ${
            answerState === 'correct'
              ? 'border-green-400 bg-green-50'
              : answerState === 'wrong'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-100'
          }`}
        >
          {question ? (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                What does this word mean?
              </p>
              <p className="text-3xl font-extrabold" style={{ color: '#141c52' }}>
                {question.word}
              </p>
            </>
          ) : (
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isCorrect = opt === question?.correct_meaning;
            const btnStyle =
              answerState === 'correct' && isCorrect
                ? { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }
                : answerState === 'wrong' && isCorrect
                ? { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#22c55e' }
                : {};

            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={answerState !== 'idle'}
                className="py-4 px-3 rounded-xl border-2 text-sm font-medium text-left transition-all disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                style={{
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  ...btnStyle,
                }}
              >
                <span className="font-bold text-gray-400 mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
