'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface Badge {
  badge_type: string;
  name: string;
  description: string;
  emoji: string;
}

interface UserBadge {
  id: number;
  badge: Badge;
  earned_at: string;
}

interface PublicProfile {
  username: string;
  current_streak: number | null;
  longest_streak: number | null;
  latest_score: number | null;
  badges: UserBadge[];
}

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{score}</span>
        <span className="text-xs text-gray-400">/100</span>
      </div>
    </div>
  );
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading, isError } = useQuery<PublicProfile>({
    queryKey: ['public-profile', username],
    queryFn: () => api.get(`/auth/users/${username}/`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">👤</p>
        <p className="font-semibold text-lg" style={{ color: '#141c52' }}>User not found</p>
        <p className="text-gray-400 text-sm">The profile @{username} doesn't exist.</p>
        <Link href="/" className="text-sm font-semibold underline" style={{ color: '#141c52' }}>← Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{ backgroundColor: '#141c52' }}
          >
            {profile.username[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>@{profile.username}</h1>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors hover:bg-gray-50 mb-4"
            style={{ borderColor: '#e5e7eb', color: copied ? '#166534' : '#6b7280' }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Profile Link'}
          </button>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-5">
            {profile.current_streak !== null && (
              <div>
                <p className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{profile.current_streak}</p>
                <p className="text-xs text-gray-400">Day Streak</p>
              </div>
            )}
            {profile.longest_streak !== null && (
              <div>
                <p className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{profile.longest_streak}</p>
                <p className="text-xs text-gray-400">Best Streak</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-extrabold" style={{ color: '#141c52' }}>{profile.badges.length}</p>
              <p className="text-xs text-gray-400">Badges</p>
            </div>
          </div>
        </div>

        {/* Speechef Score */}
        {profile.latest_score !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-4">
              Communication Score
            </h2>
            <ScoreRing score={profile.latest_score} />
            <p className="text-xs text-gray-400 mt-3">Latest Speechef analysis score</p>
          </div>
        )}

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4" style={{ color: '#141c52' }}>
              Badges & Achievements
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {profile.badges.map((ub) => (
                <div
                  key={ub.id}
                  title={ub.badge.description}
                  className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center"
                >
                  <span className="text-3xl">{ub.badge.emoji}</span>
                  <p className="text-xs font-semibold leading-tight" style={{ color: '#141c52' }}>
                    {ub.badge.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ub.earned_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.badges.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">🏅</p>
            <p className="text-sm">No badges earned yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
