'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface Question {
  id: number;
  question_type: string;
  prompt: string;
  options: string[] | null;
  audio_url: string | null;
  image_url: string | null;
  time_limit_seconds: number;
  difficulty: string;
}

function ExamTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const danger = remaining < 30;

  return (
    <div className={`text-xl font-mono font-bold ${danger ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

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

  const stop = useCallback(() => {
    mediaRef.current?.stop();
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {state === 'idle' && (
        <button onClick={start}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
          <svg className="w-7 h-7" style={{ color: '#141c52' }} fill="currentColor" viewBox="0 0 24 24">
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
        {state === 'idle' ? 'Tap to record' : state === 'recording' ? 'Recording… Tap to stop' : 'Recording saved ✓'}
      </p>
    </div>
  );
}

function QuestionView({
  question, index, total, onAnswer, onNext,
}: {
  question: Question; index: number; total: number;
  onAnswer: (qId: number, ans: string) => void; onNext: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    onAnswer(question.id, answer);
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Question {index + 1} of {total} · <span className="capitalize">{question.question_type.replace('_', ' ')}</span>
        </p>
        {question.time_limit_seconds > 0 && (
          <ExamTimer seconds={question.time_limit_seconds} onExpire={() => { if (!saved) save(); onNext(); }} />
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-5">
        <p className="text-gray-800 leading-relaxed">{question.prompt}</p>
      </div>

      {question.question_type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswer(opt)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all"
              style={{
                borderColor: answer === opt ? '#141c52' : '#e5e7eb',
                backgroundColor: answer === opt ? '#f0f2ff' : 'white',
                color: '#374151',
              }}>
              <span className="font-medium mr-2" style={{ color: '#141c52' }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {(question.question_type === 'free_speech' || question.question_type === 'essay') && (
        <>
          {question.question_type === 'free_speech' ? (
            <AudioRecorder onRecorded={(blob) => {
              setAnswer(`audio:${blob.size}`);
            }} />
          ) : (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here…"
              rows={6}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 resize-none"
            />
          )}
        </>
      )}

      {question.question_type === 'fill_blank' && (
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
        />
      )}

      <div className="flex gap-3">
        {!saved ? (
          <button onClick={save} disabled={!answer}
            className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            Save Answer
          </button>
        ) : (
          <button onClick={onNext}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            {index === total - 1 ? 'Finish Exam →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExamSessionPage() {
  const { exam, section } = useParams<{ exam: string; section: string }>();
  const router = useRouter();

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['testprep-questions', exam, section],
    queryFn: () => api.get(`/testprep/exams/${exam}/sections/${section}/questions/`).then((r) => r.data),
  });

  const startMutation = useMutation({
    mutationFn: () => api.post('/testprep/attempts/start/', { exam_slug: exam, section_slug: section }).then((r) => r.data),
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
  const [finalData, setFinalData] = useState<{ predicted_score?: { overall?: number; answered?: number } } | null>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (completed) {
    const score = finalData?.predicted_score;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
            <svg className="w-8 h-8" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>Section Complete!</h2>
          {score && (
            <p className="text-4xl font-black my-4" style={{ color: '#141c52' }}>
              {score.overall ?? '—'}<span className="text-lg font-normal text-gray-400"> pts avg</span>
            </p>
          )}
          <p className="text-gray-500 text-sm mb-6">Answered {score?.answered ?? questions.length} of {questions.length} questions.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/practice/test-prep')}
              className="py-3 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Back to Test Prep Hub →
            </button>
            <button onClick={() => { setStarted(false); setCompleted(false); setCurrentQ(0); setAttemptId(null); }}
              className="py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600">
              Retry This Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <span className="text-4xl mb-4 block">🎙️</span>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#141c52' }}>Ready to Begin?</h2>
          <p className="text-gray-500 text-sm mb-2">{questions.length} questions · {section.replace(/-/g, ' ')}</p>
          <p className="text-xs text-gray-400 mb-6">Find a quiet place, speak clearly, and answer each question fully.</p>
          <button onClick={handleStart} disabled={startMutation.isPending}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            {startMutation.isPending ? 'Starting…' : 'Start Session →'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal exam header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: '#141c52' }}>
          {exam.toUpperCase().replace(/-/g, ' ')} · {section.replace(/-/g, ' ')}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 bg-gray-100 rounded-full w-32 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${((currentQ) / questions.length) * 100}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
          </div>
          <p className="text-xs text-gray-400">{currentQ + 1}/{questions.length}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <QuestionView
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
