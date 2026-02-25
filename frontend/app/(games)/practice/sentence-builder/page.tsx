'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const ROUNDS = 5;

interface Question {
  id: number;
  word: string;
  correct_meaning: string;
}

interface RoundResult {
  word: string;
  sentence: string;
  correct: boolean;
  feedback: string;
  score: number;
}

type Stage = 'idle' | 'playing' | 'finished';
type RoundStage = 'writing' | 'result';

async function fetchWord(): Promise<Question> {
  const { data } = await api.get('/practice/question/');
  return data;
}

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold w-10 text-right" style={{ color }}>
        {score}/{max}
      </span>
    </div>
  );
}

export default function SentenceBuilderPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [roundStage, setRoundStage] = useState<RoundStage>('writing');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentWord, setCurrentWord] = useState<Question | null>(null);
  const [sentence, setSentence] = useState('');
  const [roundResult, setRoundResult] = useState<{ correct: boolean; feedback: string; score: number } | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [loadingWord, setLoadingWord] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const checkMutation = useMutation({
    mutationFn: () =>
      api.post('/practice/sentence-check/', {
        word: currentWord?.word,
        definition: currentWord?.correct_meaning,
        sentence,
      }).then((r) => r.data),
    onSuccess: (data) => {
      setRoundResult(data);
      setTotalScore((t) => t + data.score);
      setResults((prev) => [
        ...prev,
        {
          word: currentWord!.word,
          sentence,
          correct: data.correct,
          feedback: data.feedback,
          score: data.score,
        },
      ]);
      setRoundStage('result');
    },
  });

  const loadWord = useCallback(async () => {
    setLoadingWord(true);
    try {
      const q = await fetchWord();
      setCurrentWord(q);
    } finally {
      setLoadingWord(false);
    }
  }, []);

  async function startGame() {
    setResults([]);
    setTotalScore(0);
    setCurrentRound(0);
    setSentence('');
    setRoundResult(null);
    setRoundStage('writing');
    setStage('playing');
    await loadWord();
  }

  async function nextRound() {
    const next = currentRound + 1;
    if (next >= ROUNDS) {
      // Save final score
      api.post('/practice/guess/complete/', {
        score: totalScore,
        game: 'sentence',
      }).catch(() => {});
      setStage('finished');
      return;
    }
    setCurrentRound(next);
    setSentence('');
    setRoundResult(null);
    setRoundStage('writing');
    await loadWord();
  }

  const maxScore = ROUNDS * 10;
  const pct = Math.round((totalScore / maxScore) * 100);

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block text-left">
            ← Practice
          </Link>
          <div className="text-5xl mb-4">✍️</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>Sentence Builder</h1>
          <p className="text-gray-500 text-sm mb-6">
            You'll see a word and its definition. Write a sentence using it correctly.
            AI will score your response out of 10 per round.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: '🔤', label: `${ROUNDS} rounds` },
              { icon: '🤖', label: 'AI-graded' },
              { icon: '📊', label: `Score / ${maxScore}` },
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
            Start Building →
          </button>
        </div>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (stage === 'finished') {
    const grade =
      pct >= 80 ? { emoji: '🏆', label: 'Excellent!' } :
      pct >= 60 ? { emoji: '🌟', label: 'Good job!' } :
      { emoji: '💪', label: 'Keep practising!' };

    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto space-y-5">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-3">{grade.emoji}</div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>{grade.label}</h1>
            <p className="text-4xl font-extrabold my-3" style={{ color: '#141c52' }}>
              {totalScore}<span className="text-lg font-normal text-gray-400"> / {maxScore}</span>
            </p>
            <p className="text-gray-400 text-sm">{pct}% accuracy across {ROUNDS} rounds</p>
          </div>

          {/* Round breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4" style={{ color: '#141c52' }}>Round Breakdown</h2>
            <div className="space-y-5">
              {results.map((r, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="font-bold text-sm" style={{ color: '#141c52' }}>{r.word}</span>
                      <p className="text-xs text-gray-500 mt-0.5 italic">"{r.sentence}"</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      r.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {r.correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <ScoreBar score={r.score} />
                  <p className="text-xs text-gray-400 mt-1">{r.feedback}</p>
                </div>
              ))}
            </div>
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
              className="flex-1 py-3 rounded-full text-sm font-bold text-center transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              More Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-gray-400">
            Round {currentRound + 1} of {ROUNDS}
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: ROUNDS }).map((_, i) => (
              <div key={i} className="w-8 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    i < currentRound ? '#22c55e' :
                    i === currentRound ? '#141c52' : '#e5e7eb',
                }} />
            ))}
          </div>
          <p className="text-sm font-bold" style={{ color: '#141c52' }}>
            {totalScore} pts
          </p>
        </div>

        {/* Word card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-5">
          {loadingWord || !currentWord ? (
            <div className="space-y-3">
              <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-32 mx-auto" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-48 mx-auto" />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Use this word in a sentence
              </p>
              <p className="text-3xl font-extrabold mb-2" style={{ color: '#141c52' }}>
                {currentWord.word}
              </p>
              <p className="text-sm text-gray-500 italic">
                <span className="font-medium not-italic text-gray-400">Definition: </span>
                {currentWord.correct_meaning}
              </p>
            </div>
          )}
        </div>

        {/* Writing stage */}
        {roundStage === 'writing' && (
          <>
            <div className="mb-4">
              <textarea
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder={`Write a sentence using "${currentWord?.word ?? '...'}"`}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-400"
                disabled={!currentWord || loadingWord}
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: make sure the word is used naturally and shows you understand its meaning.
              </p>
            </div>
            <button
              onClick={() => checkMutation.mutate()}
              disabled={
                !sentence.trim() ||
                checkMutation.isPending ||
                !currentWord ||
                loadingWord
              }
              className="w-full py-3 rounded-full text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              {checkMutation.isPending ? 'Checking…' : 'Submit Sentence →'}
            </button>
          </>
        )}

        {/* Result stage */}
        {roundStage === 'result' && roundResult && (
          <div className={`rounded-2xl border p-6 mb-4 ${
            roundResult.correct ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{roundResult.correct ? '✅' : '⚠️'}</span>
              <p className="font-bold text-sm" style={{ color: '#141c52' }}>
                {roundResult.correct ? 'Well done!' : 'Almost there!'}
              </p>
              <span className="ml-auto font-extrabold text-lg" style={{ color: '#141c52' }}>
                +{roundResult.score}
              </span>
            </div>
            <ScoreBar score={roundResult.score} />
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{roundResult.feedback}</p>
            <p className="text-xs text-gray-400 mt-2 italic">Your sentence: "{sentence}"</p>

            <button
              onClick={nextRound}
              className="w-full mt-4 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              {currentRound + 1 >= ROUNDS ? 'See Results →' : 'Next Word →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
