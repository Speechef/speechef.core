'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface AnalysisSession {
  id: string;
  status: string;
  created_at: string;
  result?: {
    overall_score: number;
    fluency_score: number;
    vocabulary_score: number;
    pace_wpm: number;
    tone: string;
  };
}

function MiniGauge({ score }: { score: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const fill = (score / 100) * arc;
  return (
    <svg width="80" height="64" viewBox="0 0 80 64">
      <defs>
        <linearGradient id="sg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FADB43" />
          <stop offset="100%" stopColor="#fe9940" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6"
        strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
        strokeLinecap="round" transform="rotate(-135 40 48)" />
      <circle cx="40" cy="48" r={r} fill="none" stroke="url(#sg-grad)" strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
        strokeLinecap="round" transform="rotate(-135 40 48)" />
      <text x="40" y="50" textAnchor="middle" fontSize="14" fontWeight="800" fill="#141c52">{score}</text>
    </svg>
  );
}

function SkillBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
      </div>
    </div>
  );
}

export default function ScorecardWidget() {
  const { data: sessions, isLoading } = useQuery<AnalysisSession[]>({
    queryKey: ['analysis-sessions-widget'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data),
    retry: false,
  });

  const latest = sessions?.find((s) => s.status === 'done');

  const { data: result } = useQuery({
    queryKey: ['analysis-result-widget', latest?.id],
    enabled: !!latest && !latest.result,
    queryFn: () => api.get(`/analysis/${latest!.id}/results/`).then((r) => r.data),
    retry: false,
  });

  const data = latest?.result ?? result;
  const sessionId = latest?.id;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h6 className="font-semibold text-[#141c52] mb-3">Communication Score</h6>
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h6 className="font-semibold text-[#141c52] mb-3">Communication Score</h6>
        <p className="text-sm text-gray-500 mb-3 text-center py-1">No analysis yet. Upload a recording to get your score.</p>
        <Link href="/analyze"
          className="block text-center text-sm font-semibold py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
          Analyze My Speech →
        </Link>
      </div>
    );
  }

  const analyzedAt = latest?.created_at
    ? new Date(latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h6 className="font-semibold text-[#141c52]">Communication Score</h6>
        {analyzedAt && <p className="text-xs text-gray-400">{analyzedAt}</p>}
      </div>
      <div className="flex items-center gap-4 mb-4">
        <MiniGauge score={data.overall_score ?? 0} />
        <div className="flex-1 space-y-2 min-w-0">
          <SkillBar label="Fluency" value={data.fluency_score ?? 0} />
          <SkillBar label="Vocabulary" value={data.vocabulary_score ?? 0} />
          <SkillBar label="Pace" value={Math.min(100, Math.round(((data.pace_wpm ?? 0) / 180) * 100))} />
        </div>
      </div>
      <div className="flex gap-2">
        {sessionId && (
          <Link href="/analyze"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-[#141c52] text-[#141c52] hover:bg-white/50 transition-colors">
            View Results →
          </Link>
        )}
        <Link href="/analyze"
          className="flex-1 text-center text-xs font-semibold py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
          Analyze Again →
        </Link>
      </div>
    </div>
  );
}
