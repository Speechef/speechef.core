'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShareButton from '@/components/analyze/ShareButton';

interface Result {
  overall_score: number;
  fluency_score: number;
  vocabulary_score: number;
  pace_wpm: number;
  tone: string;
  narrative_feedback: string;
  improvement_priorities: string[];
}

function ScoreArc({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const fill = (score / 100) * arc;
  return (
    <svg width="140" height="110" viewBox="0 0 140 110">
      <defs>
        <linearGradient id="pr-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FADB43" />
          <stop offset="100%" stopColor="#fe9940" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="84" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10"
        strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
        strokeLinecap="round" transform="rotate(-135 70 84)" />
      <circle cx="70" cy="84" r={r} fill="none" stroke="url(#pr-grad)" strokeWidth="10"
        strokeDasharray={`${fill} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
        strokeLinecap="round" transform="rotate(-135 70 84)" />
      <text x="70" y="87" textAnchor="middle" fontSize="22" fontWeight="900" fill="white">{score}</text>
    </svg>
  );
}

export default function PublicResults({ sessionId }: { sessionId: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
    fetch(`${apiBase}/analysis/${sessionId}/results/`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#141c52' }}>
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#141c52' }}>
        <div className="text-center text-white">
          <p className="text-4xl mb-3">🎤</p>
          <p className="text-lg font-bold mb-2">Results not available</p>
          <p className="text-white/60 text-sm mb-5">This score card may have expired or be private.</p>
          <Link href="/" className="text-sm font-semibold px-5 py-2.5 rounded-full"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            Try Speechef Free →
          </Link>
        </div>
      </div>
    );
  }

  const skills = [
    { label: 'Fluency', value: result.fluency_score },
    { label: 'Vocabulary', value: result.vocabulary_score },
    { label: 'Pace', value: Math.min(100, Math.round((result.pace_wpm / 180) * 100)), raw: `${result.pace_wpm} wpm` },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}>
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white font-black text-xl">🎤 Speechef</Link>
          <ShareButton sessionId={sessionId} score={result.overall_score} />
        </div>

        {/* Score card */}
        <div className="bg-white/10 rounded-3xl p-8 mb-6 text-center backdrop-blur-sm border border-white/20">
          <p className="text-white/60 text-sm mb-2">Communication Score</p>
          <ScoreArc score={result.overall_score} />
          <p className="text-white/50 text-sm mt-2 capitalize">Tone: {result.tone || 'Neutral'}</p>
        </div>

        {/* Skill bars */}
        <div className="bg-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm border border-white/20">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-4">Skill Breakdown</p>
          <div className="space-y-4">
            {skills.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/80">{s.label}</span>
                  <span className="text-white font-bold">{s.raw ?? s.value}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative */}
        {result.narrative_feedback && (
          <div className="bg-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm border border-white/20">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">AI Feedback</p>
            <p className="text-white/85 text-sm leading-relaxed">{result.narrative_feedback}</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/60 text-sm mb-3">Get your own communication score</p>
          <Link href="/register"
            className="inline-block font-bold px-8 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            Try Speechef Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
