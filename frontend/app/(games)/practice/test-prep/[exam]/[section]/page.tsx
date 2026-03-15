'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const SECTION_TYPE_META: Record<string, { bg: string; text: string; emoji: string }> = {
  speaking:  { bg: '#ede9fe', text: '#6d28d9', emoji: '🎙️' },
  writing:   { bg: '#dbeafe', text: '#1e40af', emoji: '✍️' },
  listening: { bg: '#d1fae5', text: '#065f46', emoji: '🎧' },
  reading:   { bg: '#fef9c3', text: '#92400e', emoji: '📖' },
  general:   { bg: '#f3f4f6', text: '#374151', emoji: '📝' },
};

interface Question {
  id: number;
  question_type: string;
  prompt: string;
  options: string[] | null;
  audio_url: string | null;
  image_url: string | null;
  time_limit_seconds: number | null;
  difficulty: string;
  band_descriptors: Record<string, string> | null;
}

interface SectionInfo {
  id: number;
  name: string;
  slug: string;
  instructions: string;
  duration_seconds: number;
}

interface ReviewItem {
  question_id: number;
  question_type: string;
  prompt: string;
  user_answer: string;
  correct_answer: string | null;
  is_correct: boolean | null;
  ai_score: number | null;
}

interface FinalData {
  predicted_score?: {
    overall?: number;
    answered?: number;
    scored?: number;
    band_estimate?: string;
  };
  review?: ReviewItem[];
}

const DIFFICULTY_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  easy:   { label: 'Easy',   bg: '#dcfce7', color: '#16a34a' },
  medium: { label: 'Medium', bg: '#fef9c3', color: '#a16207' },
  hard:   { label: 'Hard',   bg: '#fee2e2', color: '#dc2626' },
};

const SECTION_ICONS: Record<string, string> = {
  speaking: '🎙️',
  writing: '✍️',
  listening: '🎧',
  reading: '📖',
};

// ──────────────────────────────────────────────── ExamTimer
function ExamTimer({
  seconds, onExpire, compact = false,
}: {
  seconds: number; onExpire: () => void; compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);
  useEffect(() => { onExpireRef.current = onExpire; });

  useEffect(() => {
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
      }
      return;
    }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const danger = remaining < 60;

  if (compact) {
    return (
      <span className={`font-mono font-bold text-sm ${danger ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className={`text-xl font-mono font-bold ${danger ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

// ──────────────────────────────────────────────── AudioRecorder
function AudioRecorder({ onRecorded }: { onRecorded: (blob: Blob) => void }) {
  const [state, setState] = useState<'idle' | 'recording' | 'done'>('idle');
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onRecorded(blob);
      stream.getTracks().forEach((t) => t.stop());
      setState('done');
    };
    mr.start();
    setState('recording');
  }, [onRecorded]);

  const stop = useCallback(() => { mediaRef.current?.stop(); }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {state === 'idle' && (
        <button onClick={start}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: BRAND.gradient }}>
          <svg className="w-7 h-7" style={{ color: BRAND.primary }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
          </svg>
        </button>
      )}
      {state === 'recording' && (
        <button onClick={stop}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 bg-white rounded-sm" />
        </button>
      )}
      {state === 'done' && (
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <p className="text-sm font-medium text-gray-500">
        {state === 'idle' ? 'Tap to record your answer'
          : state === 'recording' ? 'Recording… tap to stop'
          : 'Recording saved ✓'}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────── QuestionView
function QuestionView({
  question, index, total, onAnswer, onNext,
}: {
  question: Question; index: number; total: number;
  onAnswer: (qId: number, ans: string) => void; onNext: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  const diffStyle = DIFFICULTY_STYLES[question.difficulty] ?? DIFFICULTY_STYLES.medium;

  const save = () => {
    onAnswer(question.id, answer);
    setSaved(true);
  };

  const qTypeLabel = question.question_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-5">
      {/* Meta row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Q{index + 1} of {total}
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: diffStyle.bg, color: diffStyle.color }}>
            {diffStyle.label}
          </span>
          <span className="text-xs text-gray-400 capitalize">{qTypeLabel}</span>
        </div>
        {question.time_limit_seconds && question.time_limit_seconds > 0 && (
          <ExamTimer
            seconds={question.time_limit_seconds}
            onExpire={() => { if (!saved) save(); onNext(); }}
          />
        )}
      </div>

      {/* Prompt */}
      <div className="bg-gray-50 rounded-xl p-5">
        <p className="text-gray-800 leading-relaxed whitespace-pre-line">{question.prompt}</p>
      </div>

      {/* Band descriptors */}
      {question.band_descriptors && Object.keys(question.band_descriptors).length > 0 && (
        <BandDescriptorHint descriptors={question.band_descriptors} />
      )}

      {/* Answer inputs */}
      {question.question_type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswer(opt)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all"
              style={{
                borderColor: answer === opt ? BRAND.primary : '#e5e7eb',
                backgroundColor: answer === opt ? '#f0f2ff' : 'white',
                color: '#374151',
              }}>
              <span className="font-medium mr-2" style={{ color: BRAND.primary }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.question_type === 'free_speech' && (
        <AudioRecorder onRecorded={(blob) => setAnswer(`audio:${blob.size}`)} />
      )}

      {question.question_type === 'essay_prompt' && (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your essay response here…"
          rows={8}
          className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:border-gray-400 resize-none"
        />
      )}

      {question.question_type === 'fill_blank' && (
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
        />
      )}

      {(question.question_type === 'read_and_respond' || question.question_type === 'listen_and_answer') && (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your response…"
          rows={5}
          className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:border-gray-400 resize-none"
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!saved ? (
          <button onClick={save} disabled={!answer}
            className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ background: BRAND.gradient, color: BRAND.primary }}>
            Save Answer
          </button>
        ) : (
          <button onClick={onNext}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{ background: BRAND.gradient, color: BRAND.primary }}>
            {index === total - 1 ? 'Finish Section →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

function BandDescriptorHint({ descriptors }: { descriptors: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 transition-colors"
        style={{ color: BRAND.primary }}>
        <span>Scoring Criteria</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 bg-white">
          {Object.entries(descriptors).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs font-semibold text-gray-500 capitalize">{k.replace(/_/g, ' ')}</p>
              <p className="text-xs text-gray-600">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────── Results screen
function ResultsScreen({
  finalData, questions, sectionType, onRetry, onBack,
}: {
  finalData: FinalData; questions: Question[]; sectionType: string; onRetry: () => void; onBack: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const score = finalData.predicted_score;
  const review = finalData.review ?? [];
  const reviewable = review.filter((r) => r.correct_answer !== null);
  const stm = SECTION_TYPE_META[sectionType] ?? SECTION_TYPE_META.general;

  const scoreColor = score?.overall !== undefined
    ? (score.overall >= 7 ? { color: '#166534', bg: '#dcfce7' }
      : score.overall >= 5 ? { color: '#92400e', bg: '#fef3c7' }
      : { color: '#991b1b', bg: '#fee2e2' })
    : { color: BRAND.primary, bg: stm.bg };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full space-y-4">
        {/* Score card with colored band */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: scoreColor.bg }}>
          <div className="px-8 py-6 text-center" style={{ background: scoreColor.bg }}>
            <h2 className="text-2xl font-bold mb-1" style={{ color: BRAND.primary }}>Section Complete!</h2>

            {score?.band_estimate && (
              <div className="my-4">
                <p className="text-4xl font-black" style={{ color: BRAND.primary }}>{score.band_estimate}</p>
                <p className="text-sm mt-1" style={{ color: scoreColor.color }}>Estimated score</p>
              </div>
            )}
            {score && !score.band_estimate && (
              <p className="text-4xl font-black my-4" style={{ color: BRAND.primary }}>
                {score.overall ?? '—'}<span className="text-lg font-normal text-gray-400">/10</span>
              </p>
            )}
          </div>
          {score && (
            <div className="bg-white px-6 py-3">
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <span>Answered: {score.answered ?? questions.length}</span>
                {score.scored !== undefined && score.scored > 0 && (
                  <span>Auto-scored: {score.scored}</span>
                )}
                {score.overall !== undefined && (
                  <span>Avg: {score.overall}/10</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Review accordion */}
        {reviewable.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowReview((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold"
              style={{ color: BRAND.primary }}
            >
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-xs" style={{ background: stm.bg, color: stm.text }}>📋</span>
                Review Answers ({reviewable.length} questions)
              </span>
              <span>{showReview ? '▲' : '▼'}</span>
            </button>
            {showReview && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {review.map((item, i) => {
                  if (item.correct_answer === null) return null;
                  const correct = item.is_correct;
                  return (
                    <div key={item.question_id} className="px-6 py-4">
                      <p className="text-xs text-gray-400 mb-1">Q{i + 1} · {item.question_type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-3">{item.prompt}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`rounded-lg px-3 py-2 text-xs ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                          <p className="text-gray-400 mb-0.5">Your answer</p>
                          <p className={`font-medium ${correct ? 'text-green-700' : 'text-red-700'}`}>
                            {item.user_answer || '(no answer)'}
                          </p>
                        </div>
                        {!correct && (
                          <div className="rounded-lg px-3 py-2 text-xs bg-green-50">
                            <p className="text-gray-400 mb-0.5">Correct answer</p>
                            <p className="font-medium text-green-700">{item.correct_answer}</p>
                          </div>
                        )}
                        {correct && (
                          <div className="rounded-lg px-3 py-2 text-xs bg-green-50 flex items-center justify-center">
                            <span className="text-green-600 font-bold">✓ Correct!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI scoring notice */}
        {review.some((r) => r.question_type === 'free_speech' || r.question_type === 'essay_prompt') && (
          <div className="rounded-2xl border p-5" style={{ background: stm.bg, borderColor: stm.bg }}>
            <p className="text-sm font-semibold mb-2" style={{ color: BRAND.primary }}>AI Scoring</p>
            <p className="text-xs text-gray-600">Your spoken and written responses are queued for AI analysis. Full band scores and detailed feedback will appear in your profile once processing is complete (usually within a few minutes).</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={onBack}
            className="py-3 rounded-xl text-sm font-bold"
            style={{ background: BRAND.gradient, color: BRAND.primary }}>
            Back to Test Prep Hub →
          </button>
          <button onClick={onRetry}
            className="py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600">
            Retry This Section
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────── Main page
export default function ExamSessionPage() {
  const { exam, section } = useParams<{ exam: string; section: string }>();
  const router = useRouter();

  const { data: sessionData, isLoading } = useQuery<{ section: SectionInfo; questions: Question[] }>({
    queryKey: ['testprep-questions', exam, section],
    queryFn: () =>
      api.get(`/testprep/exams/${exam}/sections/${section}/questions/`).then((r) => r.data),
  });

  const questions = sessionData?.questions ?? [];
  const sectionInfo = sessionData?.section ?? null;

  const startMutation = useMutation({
    mutationFn: () =>
      api.post('/testprep/attempts/start/', { exam_slug: exam, section_slug: section }).then((r) => r.data),
  });

  const answerMutation = useMutation({
    mutationFn: ({ attemptId, questionId, answer }: { attemptId: number; questionId: number; answer: string }) =>
      api.post(`/testprep/attempts/${attemptId}/answer/`, { question_id: questionId, answer }).then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (attemptId: number) =>
      api.post(`/testprep/attempts/${attemptId}/complete/`).then((r) => r.data),
  });

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finalData, setFinalData] = useState<FinalData | null>(null);

  const handleStart = async () => {
    const res = await startMutation.mutateAsync();
    setAttemptId(res.attempt_id);
    setStarted(true);
  };

  const handleAnswer = useCallback((qId: number, ans: string) => {
    if (!attemptId) return;
    answerMutation.mutate({ attemptId, questionId: qId, answer: ans });
  }, [attemptId, answerMutation]);

  const handleNext = useCallback(async () => {
    if (currentQ === questions.length - 1) {
      if (attemptId) {
        const res = await completeMutation.mutateAsync(attemptId);
        setFinalData(res);
        setCompleted(true);
      }
    } else {
      setCurrentQ((q) => q + 1);
    }
  }, [currentQ, questions.length, attemptId, completeMutation]);

  const handleRetry = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentQ(0);
    setAttemptId(null);
    setFinalData(null);
  };

  // Derive section type for styling
  const sectionType = sectionInfo
    ? (['speaking', 'writing', 'listening', 'reading'].find((t) => sectionInfo.name.toLowerCase().includes(t)) ?? 'general')
    : 'general';
  const stm = SECTION_TYPE_META[sectionType] ?? SECTION_TYPE_META.general;

  // ── Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Completed
  if (completed && finalData) {
    return (
      <ResultsScreen
        finalData={finalData}
        questions={questions}
        sectionType={sectionType}
        onRetry={handleRetry}
        onBack={() => router.push('/practice/test-prep')}
      />
    );
  }

  // ── Not started — intro screen
  if (!started) {
    const icon = SECTION_ICONS[sectionType] ?? '📋';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border overflow-hidden" style={{ borderColor: stm.bg }}>
          {/* Colored intro band */}
          <div className="px-8 py-6 text-center" style={{ background: stm.bg }}>
            <span className="text-5xl block mb-3">{icon}</span>
            <h2 className="text-xl font-bold mb-1" style={{ color: BRAND.primary }}>
              {sectionInfo?.name ?? section.replace(/-/g, ' ')}
            </h2>
            <p className="text-sm" style={{ color: stm.text }}>{exam.toUpperCase().replace(/-/g, ' ')}</p>
          </div>

          {/* White body */}
          <div className="bg-white px-8 py-6">
            {/* Stats row */}
            <div className="flex justify-center gap-6 mb-6 text-center">
              <div>
                <p className="text-xl font-bold" style={{ color: BRAND.primary }}>{questions.length}</p>
                <p className="text-xs text-gray-400">Questions</p>
              </div>
              {sectionInfo && sectionInfo.duration_seconds > 0 && (
                <div>
                  <p className="text-xl font-bold" style={{ color: BRAND.primary }}>
                    {Math.round(sectionInfo.duration_seconds / 60)} min
                  </p>
                  <p className="text-xs text-gray-400">Time Limit</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            {sectionInfo?.instructions && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Instructions</p>
                <p className="text-sm text-gray-600 leading-relaxed">{sectionInfo.instructions}</p>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={startMutation.isPending || questions.length === 0}
              className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              {startMutation.isPending ? 'Starting…' : questions.length === 0 ? 'No questions available' : 'Start Session →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  // ── Active session
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal exam header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <p className="text-sm font-bold" style={{ color: BRAND.primary }}>
          {exam.toUpperCase().replace(/-/g, ' ')} · {sectionInfo?.name ?? section.replace(/-/g, ' ')}
        </p>
        <div className="flex items-center gap-4">
          {sectionInfo && sectionInfo.duration_seconds > 0 && (
            <ExamTimer
              compact
              seconds={sectionInfo.duration_seconds}
              onExpire={handleNext}
            />
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 bg-gray-100 rounded-full w-24 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(currentQ / questions.length) * 100}%`,
                  background: BRAND.gradient,
                }}
              />
            </div>
            <p className="text-xs text-gray-400">{currentQ + 1}/{questions.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <QuestionView
          key={currentQ}
          question={q}
          index={currentQ}
          total={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
