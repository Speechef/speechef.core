'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const ROUNDS = 5;
const MAX_RECORD_MS = 8000; // 8 seconds max per round

const PHRASES = [
  'The quick brown fox jumps over the lazy dog',
  'She sells seashells by the seashore',
  'How much wood would a woodchuck chuck',
  'Peter Piper picked a peck of pickled peppers',
  'I scream you scream we all scream for ice cream',
  'Red lorry yellow lorry red lorry yellow lorry',
  'Unique New York unique New York you know you need unique New York',
  'Whether the weather is warm whether the weather is hot',
  'Betty Botter bought some butter but the butter was bitter',
  'Six sleek swans swam swiftly southwards',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RoundResult {
  phrase: string;
  transcript: string;
  accuracy: number;
  mismatches: string[];
}

type Stage = 'idle' | 'playing' | 'finished';
type RoundStage = 'ready' | 'recording' | 'processing' | 'result';

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const color = accuracy >= 80 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${accuracy}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right" style={{ color }}>
        {accuracy}%
      </span>
    </div>
  );
}

function HighlightedPhrase({ phrase, mismatches }: { phrase: string; mismatches: string[] }) {
  const words = phrase.split(' ');
  const missSet = new Set(mismatches.map((m) => m.toLowerCase()));
  return (
    <p className="text-lg leading-relaxed text-center">
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        const missed = missSet.has(clean);
        return (
          <span key={i}>
            <span className={missed ? 'text-red-500 font-bold underline' : 'text-green-600 font-semibold'}>
              {word}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </p>
  );
}

export default function PronunciationChallengePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [roundStage, setRoundStage] = useState<RoundStage>('ready');
  const [currentRound, setCurrentRound] = useState(0);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [roundResult, setRoundResult] = useState<{ transcript: string; accuracy: number; mismatches: string[] } | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPhrase = phrases[currentRound] ?? '';

  function startGame() {
    const selected = shuffle(PHRASES).slice(0, ROUNDS);
    setPhrases(selected);
    setResults([]);
    setTotalScore(0);
    setCurrentRound(0);
    setRoundResult(null);
    setRoundStage('ready');
    setError('');
    setStage('playing');
  }

  const startRecording = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await submitAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRoundStage('recording');

      // Auto-stop after max time
      autoStopRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_RECORD_MS);
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  }, [currentPhrase]); // eslint-disable-line react-hooks/exhaustive-deps

  function stopRecording() {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRoundStage('processing');
  }

  async function submitAudio(blob: Blob) {
    setRoundStage('processing');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('target', currentPhrase);

      const { data } = await api.post('/practice/pronunciation-check/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setRoundResult(data);
      setTotalScore((t) => t + data.accuracy);
      setResults((prev) => [
        ...prev,
        { phrase: currentPhrase, transcript: data.transcript, accuracy: data.accuracy, mismatches: data.mismatches },
      ]);
      setRoundStage('result');
    } catch {
      setError('Could not process your recording. Please try again.');
      setRoundStage('ready');
    }
  }

  function nextRound() {
    const next = currentRound + 1;
    if (next >= ROUNDS) {
      const finalScore = Math.round(totalScore / ROUNDS);
      api.post('/practice/guess/complete/', { score: finalScore, game: 'pronunciation' }).catch(() => {});
      setStage('finished');
      return;
    }
    setCurrentRound(next);
    setRoundResult(null);
    setRoundStage('ready');
    setError('');
  }

  const avgAccuracy = results.length ? Math.round(totalScore / results.length) : 0;
  const maxScore = ROUNDS * 100;

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block text-left">
            ← Practice
          </Link>
          <div className="text-5xl mb-4">🎙️</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>Pronunciation Challenge</h1>
          <p className="text-gray-500 text-sm mb-6">
            Read each phrase aloud. AI will transcribe your speech and score your pronunciation accuracy.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: '📢', label: `${ROUNDS} phrases` },
              { icon: '🤖', label: 'AI-scored' },
              { icon: '🎯', label: 'Accuracy %' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl py-3">
                <p className="text-xl mb-0.5">{item.icon}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Requires microphone access. Speak clearly in a quiet environment for best results.
          </p>
          <button
            onClick={startGame}
            className="w-full py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Start Challenge →
          </button>
        </div>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (stage === 'finished') {
    const grade =
      avgAccuracy >= 85 ? { emoji: '🏆', label: 'Outstanding!' } :
      avgAccuracy >= 65 ? { emoji: '🌟', label: 'Well done!' } :
      { emoji: '💪', label: 'Keep practising!' };

    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-3">{grade.emoji}</div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>{grade.label}</h1>
            <p className="text-4xl font-extrabold my-3" style={{ color: '#141c52' }}>
              {avgAccuracy}<span className="text-lg font-normal text-gray-400">% avg accuracy</span>
            </p>
            <p className="text-gray-400 text-sm">{ROUNDS} phrases completed</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4" style={{ color: '#141c52' }}>Round Breakdown</h2>
            <div className="space-y-5">
              {results.map((r, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-400 mb-1 italic">"{r.phrase}"</p>
                  <AccuracyBar accuracy={r.accuracy} />
                  {r.transcript && (
                    <p className="text-xs text-gray-500 mt-1">
                      You said: <span className="italic">"{r.transcript}"</span>
                    </p>
                  )}
                  {r.mismatches.length > 0 && (
                    <p className="text-xs text-red-400 mt-0.5">
                      Missed: {r.mismatches.join(', ')}
                    </p>
                  )}
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
          <Link
            href="/practice/history?game=pronunciation"
            className="block text-center text-sm text-gray-400 hover:underline mt-3"
          >
            View session history →
          </Link>
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
            {results.length ? `${Math.round(totalScore / results.length)}% avg` : '—'}
          </p>
        </div>

        {/* Phrase card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Say this phrase aloud
          </p>
          {roundStage === 'result' && roundResult ? (
            <HighlightedPhrase phrase={currentPhrase} mismatches={roundResult.mismatches} />
          ) : (
            <p className="text-lg font-semibold leading-relaxed" style={{ color: '#141c52' }}>
              {currentPhrase}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        {/* Ready stage */}
        {roundStage === 'ready' && (
          <button
            onClick={startRecording}
            className="w-full py-4 rounded-full text-sm font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            <span className="text-xl">🎙️</span> Start Recording
          </button>
        )}

        {/* Recording stage */}
        {roundStage === 'recording' && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-red-600">Recording…</span>
              <span className="text-xs text-gray-400">(max {MAX_RECORD_MS / 1000}s)</span>
            </div>
            <button
              onClick={stopRecording}
              className="w-full py-4 rounded-full text-sm font-bold border-2 transition-colors hover:bg-red-50"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              ⏹ Stop Recording
            </button>
          </div>
        )}

        {/* Processing stage */}
        {roundStage === 'processing' && (
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Analysing your pronunciation…</span>
            </div>
          </div>
        )}

        {/* Result stage */}
        {roundStage === 'result' && roundResult && (
          <div className={`rounded-2xl border p-6 mb-4 ${
            roundResult.accuracy >= 80 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{roundResult.accuracy >= 80 ? '✅' : '⚠️'}</span>
              <p className="font-bold text-sm" style={{ color: '#141c52' }}>
                {roundResult.accuracy >= 80 ? 'Great pronunciation!' : 'Keep practising!'}
              </p>
            </div>
            <AccuracyBar accuracy={roundResult.accuracy} />
            {roundResult.transcript && (
              <p className="text-sm text-gray-500 mt-3">
                Heard: <span className="italic">"{roundResult.transcript}"</span>
              </p>
            )}
            {roundResult.mismatches.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Words to work on: <span className="font-semibold">{roundResult.mismatches.join(', ')}</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Red = missed/unclear · Green = correct
            </p>
            <button
              onClick={nextRound}
              className="w-full mt-4 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              {currentRound + 1 >= ROUNDS ? 'See Results →' : 'Next Phrase →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
