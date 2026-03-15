'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const GOALS = [
  { value: 'speaking', emoji: '💬', label: 'Speaking in conversations', desc: 'Fluency, confidence, and everyday English' },
  { value: 'writing', emoji: '✍️', label: 'Writing emails and documents', desc: 'Grammar, vocabulary, and professional tone' },
  { value: 'exam', emoji: '📝', label: 'Preparing for IELTS / TOEFL / PTE', desc: 'Test-specific skills and exam strategy' },
  { value: 'interview', emoji: '💼', label: 'Job interviews in English', desc: 'Behavioral answers, vocabulary, and confidence' },
];

const LEVELS = [
  { value: 'beginner', emoji: '🌱', label: 'I know very little', desc: 'Beginner — just starting out' },
  { value: 'intermediate', emoji: '🌿', label: 'I can have simple conversations', desc: 'Intermediate — building up' },
  { value: 'advanced', emoji: '🌳', label: 'I speak well but want to improve', desc: 'Advanced — refining and perfecting' },
];

const TIMES = [
  { value: 5, emoji: '⚡', label: '5 minutes', desc: 'Quick daily practice' },
  { value: 15, emoji: '📚', label: '15 minutes', desc: 'Focused learning session' },
  { value: 30, emoji: '🏆', label: '30+ minutes', desc: 'Deep practice and review' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(15);

  const mutation = useMutation({
    mutationFn: () => api.post('/auth/onboarding/', { goal, level, daily_minutes: dailyMinutes }),
    onSuccess: () => router.push('/dashboard'),
  });

  function handleGoalSelect(value: string) {
    setGoal(value);
    setTimeout(() => setStep(1), 200);
  }

  function handleLevelSelect(value: string) {
    setLevel(value);
    setTimeout(() => setStep(2), 200);
  }

  function handleTimeSelect(value: number) {
    setDailyMinutes(value);
    mutation.mutate();
  }

  const steps = ['Goal', 'Level', 'Time'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#f4f6fb' }}>
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= step ? BRAND.primary : '#d1d5db', transform: i === step ? 'scale(1.3)' : 'scale(1)' }}
            />
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Step 0 — Goal */}
        {step === 0 && (
          <div>
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Step 1 of 3</p>
              <h1 className="text-2xl font-black" style={{ color: BRAND.primary }}>What do you want to improve?</h1>
              <p className="text-sm text-gray-500 mt-2">We'll personalise your plan around your goal.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleGoalSelect(g.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: goal === g.value ? BRAND.primary : '#e5e7eb',
                    backgroundColor: goal === g.value ? '#eef0ff' : 'white',
                  }}
                >
                  <span className="text-3xl leading-none flex-shrink-0">{g.emoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>{g.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Level */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Step 2 of 3</p>
              <h1 className="text-2xl font-black" style={{ color: BRAND.primary }}>How would you describe your English right now?</h1>
              <p className="text-sm text-gray-500 mt-2">Be honest — we'll match you to the right content.</p>
            </div>
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => handleLevelSelect(l.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: level === l.value ? BRAND.primary : '#e5e7eb',
                    backgroundColor: level === l.value ? '#eef0ff' : 'white',
                  }}
                >
                  <span className="text-3xl leading-none flex-shrink-0">{l.emoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>{l.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(0)}
              className="w-full mt-4 text-sm text-gray-400 hover:underline text-center"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 2 — Time */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Step 3 of 3</p>
              <h1 className="text-2xl font-black" style={{ color: BRAND.primary }}>How much time can you spend each day?</h1>
              <p className="text-sm text-gray-500 mt-2">Even 5 minutes daily builds real habits.</p>
            </div>
            <div className="space-y-3">
              {TIMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTimeSelect(t.value)}
                  disabled={mutation.isPending}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{
                    borderColor: dailyMinutes === t.value ? BRAND.primary : '#e5e7eb',
                    backgroundColor: dailyMinutes === t.value ? '#eef0ff' : 'white',
                  }}
                >
                  <span className="text-3xl leading-none flex-shrink-0">{t.emoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: BRAND.primary }}>{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 text-sm text-gray-400 hover:underline text-center"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
