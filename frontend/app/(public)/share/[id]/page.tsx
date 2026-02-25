'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface Scorecard {
  session_id: number;
  username: string;
  created_at: string;
  file_type: string;
  overall_score: number;
  fluency_score: number;
  vocabulary_score: number;
  pace_wpm: number;
  tone: string;
  narrative_feedback: string;
}

function ScoreArc({ score, size = 140 }: { score: number; size?: number }) {
  const r = size * 0.37;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const cx = size / 2;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.07} />
        <circle cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={size * 0.07}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold" style={{ fontSize: size * 0.22, color: '#141c52' }}>{score}</span>
        <span className="text-gray-400" style={{ fontSize: size * 0.09 }}>/100</span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function ShareScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  const { data: card, isLoading, isError } = useQuery<Scorecard>({
    queryKey: ['share-scorecard', id],
    queryFn: () => api.get(`/analysis/${id}/share/`).then((r) => r.data),
  });

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200"
          style={{ borderTopColor: '#FADB43' }} />
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">📊</p>
        <p className="font-semibold text-lg" style={{ color: '#141c52' }}>Scorecard not available</p>
        <p className="text-gray-400 text-sm">This scorecard may be private or not yet ready.</p>
        <Link href="/" className="text-sm font-semibold underline" style={{ color: '#141c52' }}>← Home</Link>
      </div>
    );
  }

  const grade =
    card.overall_score >= 85 ? 'Outstanding' :
    card.overall_score >= 70 ? 'Proficient' :
    card.overall_score >= 55 ? 'Developing' : 'Beginner';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-5">

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="px-6 py-5 text-center"
            style={{ background: 'linear-gradient(to right,#141c52,#1e2d7d)' }}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Speechef Score</p>
            <p className="text-white font-bold text-lg">@{card.username}</p>
          </div>

          <div className="px-6 py-8">
            {/* Overall score ring */}
            <ScoreArc score={card.overall_score} size={160} />
            <p className="text-center mt-3 font-bold text-lg" style={{ color: '#141c52' }}>{grade}</p>
            {card.tone && (
              <p className="text-center text-sm text-gray-400 mt-0.5">Tone: {card.tone}</p>
            )}

            {/* Sub scores */}
            <div className="mt-6 space-y-3">
              <SubScoreBar label="Fluency" score={card.fluency_score} />
              <SubScoreBar label="Vocabulary" score={card.vocabulary_score} />
              {card.pace_wpm > 0 && (
                <SubScoreBar
                  label={`Pace (${card.pace_wpm} wpm)`}
                  score={Math.min(100, Math.round((card.pace_wpm / 180) * 100))}
                />
              )}
            </div>

            {/* Narrative feedback */}
            {card.narrative_feedback && (
              <p className="mt-5 text-sm text-gray-500 leading-relaxed italic border-t border-gray-100 pt-4">
                "{card.narrative_feedback}"
              </p>
            )}

            {/* Date */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Analysed on {new Date(card.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between"
            style={{ backgroundColor: '#f9fafb' }}>
            <Link href="/" className="text-xs font-bold" style={{ color: '#141c52' }}>
              Powered by <span style={{ color: '#fe9940' }}>Speechef</span>
            </Link>
            <Link href="/register"
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Get Your Score →
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 py-3 rounded-full text-sm font-bold border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <Link href="/analyze"
            className="flex-1 py-3 rounded-full text-sm font-bold text-center transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            Analyse a Speech
          </Link>
        </div>

        {/* Social share */}
        <div className="flex gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${card.overall_score}/100 on Speechef! ${grade} communicator. Check out my score 🎙️`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-center border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e5e7eb', color: '#374151' }}
          >
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-center border transition-colors hover:bg-blue-50"
            style={{ borderColor: '#0077b5', color: '#0077b5' }}
          >
            Share on LinkedIn
          </a>
        </div>

      </div>
    </div>
  );
}
