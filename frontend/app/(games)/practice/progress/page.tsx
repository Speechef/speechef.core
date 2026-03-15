'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

interface GameSession { id: number; score: number; played_at: string; }
interface Profile {
  current_streak: number;
  goal: string;
  level: string;
  onboarding_complete: boolean;
}
interface UserProfile { username: string; profile: Profile; }

const TIERS = [
  {
    id: 'foundation',
    name: 'Foundation',
    emoji: '🌱',
    desc: 'Build your vocabulary and get comfortable with English games.',
    goal: 10,
    unit: 'games',
    unlock: 'Available from day 1',
    features: ['Word games', 'Daily challenge', 'Vocabulary tracker'],
    color: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', accent: '#22c55e' },
  },
  {
    id: 'conversations',
    name: 'Conversations',
    emoji: '💬',
    desc: 'Practice real conversations and get AI feedback on your speaking.',
    goal: 5,
    unit: 'roleplay sessions',
    unlock: 'Unlocks after 5 practice games',
    features: ['AI Roleplay', 'Pronunciation challenge', 'Sentence builder'],
    color: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', accent: '#3b82f6' },
  },
  {
    id: 'fluency',
    name: 'Fluency',
    emoji: '🌿',
    desc: 'Polish your writing, get detailed AI coaching, and prepare for exams.',
    goal: 3,
    unit: 'AI tool sessions',
    unlock: 'Unlocks after 3 Learn articles',
    features: ['AI Writing Coach', 'Resume Analyzer', 'Interview simulation'],
    color: { bg: '#fef3c7', border: '#fde68a', text: '#92400e', accent: '#f59e0b' },
  },
  {
    id: 'advanced',
    name: 'Advanced',
    emoji: '🏆',
    desc: 'Master test preparation, mentor sessions, and career-ready English.',
    goal: 1,
    unit: 'exam prep sessions',
    unlock: 'Unlocks after your first interview simulation',
    features: ['Test Prep (IELTS, TOEFL, PTE)', 'Mentor sessions', 'Job applications'],
    color: { bg: '#fdf4ff', border: '#e9d5ff', text: '#6d28d9', accent: '#8b5cf6' },
  },
];

export default function ProgressPathPage() {
  const { isLoggedIn } = useAuthStore();

  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['progress-sessions'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/practice/sessions/?limit=500').then((r) => r.data).catch(() => []),
  });

  const { data: user } = useQuery<UserProfile>({
    queryKey: ['profile'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const totalGames = sessions.length;
  const profile = user?.profile;

  // Determine which tier the user is on
  const tierIdx =
    totalGames >= 20 ? 3 :
    totalGames >= 10 ? 2 :
    totalGames >= 5  ? 1 : 0;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/practice" className="text-sm text-gray-400 hover:underline mb-3 block">
            ← Practice
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: BRAND.primary, color: 'white' }}>
              Your Progress Path
            </div>
          </div>
          <h1 className="text-2xl font-black" style={{ color: BRAND.primary }}>
            {user ? `${user.username}'s journey` : 'Your English Journey'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalGames > 0
              ? `${totalGames} game${totalGames !== 1 ? 's' : ''} played · You're on tier ${tierIdx + 1} of 4`
              : 'Start playing to unlock your path.'}
          </p>
        </div>

        {/* Stats strip */}
        {isLoggedIn && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Games played', value: totalGames },
              { label: 'Day streak', value: profile?.current_streak ?? 0 },
              { label: 'Current tier', value: TIERS[tierIdx].name },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                <p className="text-xl font-extrabold" style={{ color: BRAND.primary }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Path */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200" style={{ zIndex: 0 }} />

          <div className="space-y-5 relative" style={{ zIndex: 1 }}>
            {TIERS.map((tier, i) => {
              const isPast    = i < tierIdx;
              const isCurrent = i === tierIdx;
              const isFuture  = i > tierIdx;

              return (
                <div key={tier.id} className="flex gap-5">
                  {/* Node */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all"
                      style={{
                        background: isPast
                          ? BRAND.primary
                          : isCurrent
                          ? `linear-gradient(135deg,#FADB43,#fe9940)`
                          : '#f3f4f6',
                        border: isFuture ? '2px solid #e5e7eb' : 'none',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(250,219,67,0.2), 0 4px 16px rgba(250,219,67,0.3)' : undefined,
                      }}
                    >
                      {isPast ? <span style={{ fontSize: 24 }}>✓</span> : tier.emoji}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 rounded-2xl border p-5 mb-1"
                    style={{
                      background: isFuture ? '#f9fafb' : 'white',
                      borderColor: isCurrent ? '#FADB43' : isFuture ? '#e5e7eb' : tier.color.border,
                      opacity: isFuture ? 0.7 : 1,
                      boxShadow: isCurrent ? '0 2px 16px rgba(250,219,67,0.15)' : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="font-black text-base" style={{ color: isFuture ? '#9ca3af' : BRAND.primary }}>
                            {tier.name}
                          </h2>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: '#FADB43', color: BRAND.primary }}>
                              You are here
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: '#dcfce7', color: '#166534' }}>
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{tier.desc}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tier.features.map((f) => (
                        <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: isFuture ? '#f3f4f6' : tier.color.bg,
                            color: isFuture ? '#9ca3af' : tier.color.text,
                          }}>
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Progress within this tier */}
                    {isCurrent && totalGames > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{totalGames} games played</span>
                          <span>Need {TIERS[tierIdx + 1] ? `${Math.max(0, (tierIdx + 1) * 5 + 5 - totalGames)} more` : 'Max reached'}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (totalGames / ((tierIdx + 1) * 5 + 5)) * 100)}%`, background: BRAND.gradient }} />
                        </div>
                      </div>
                    )}

                    {isFuture && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        🔒 {tier.unlock}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Continue practicing →
          </Link>
        </div>

      </div>
    </div>
  );
}
