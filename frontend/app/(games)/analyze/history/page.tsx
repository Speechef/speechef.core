'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface AnalysisResult {
  overall_score: number;
  fluency_score: number;
  vocabulary_score: number;
  tone: string;
}

interface AnalysisSession {
  id: number;
  file_type: 'audio' | 'video';
  status: 'pending' | 'processing' | 'done' | 'failed';
  created_at: string;
  completed_at: string | null;
  error: string | null;
  result: AnalysisResult | null;
}

const STATUS_STYLES: Record<string, string> = {
  done:       'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  failed:     'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  done:       'Done',
  pending:    'Pending',
  processing: 'Processing',
  failed:     'Failed',
};

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#166534' : score >= 60 ? '#92400e' : '#991b1b';
  const bg    = score >= 80 ? '#dcfce7' : score >= 60 ? '#fef3c7' : '#fee2e2';
  return (
    <span className="text-sm font-extrabold px-3 py-1 rounded-full"
      style={{ color, backgroundColor: bg }}>
      {score}
    </span>
  );
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'done', label: 'Done' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'failed', label: 'Failed' },
];

export default function AnalysisHistoryPage() {
  const [filterStatus, setFilterStatus] = useState('');

  const { data: sessions = [], isLoading } = useQuery<AnalysisSession[]>({
    queryKey: ['analysis-sessions'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data),
  });

  const displayedSessions = filterStatus
    ? sessions.filter((s) => s.status === filterStatus)
    : sessions;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>Analysis History</h1>
            <p className="text-gray-500 mt-1">All your past speech analysis sessions.</p>
          </div>
          <Link href="/analyze"
            className="text-sm font-medium hover:underline"
            style={{ color: '#141c52' }}>
            ← New Analysis
          </Link>
        </div>

        {/* Status filter tabs */}
        {!isLoading && sessions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((tab) => {
              const count = tab.key ? sessions.filter((s) => s.status === tab.key).length : sessions.length;
              const isActive = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: '#141c52', color: '#fff' }
                      : { backgroundColor: '#e5e7eb', color: '#374151' }
                  }
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20' : 'bg-white text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">🎙️</p>
            <p className="font-semibold text-lg mb-1" style={{ color: '#141c52' }}>No analyses yet</p>
            <p className="text-gray-400 text-sm mb-6">Upload a speech recording to get your first Speechef score.</p>
            <Link href="/analyze"
              className="inline-block px-6 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Analyze a Speech →
            </Link>
          </div>
        ) : displayedSessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold">No {STATUS_LABELS[filterStatus]} sessions</p>
            <button onClick={() => setFilterStatus('')}
              className="mt-3 text-sm font-semibold underline"
              style={{ color: '#141c52' }}>
              View all sessions
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedSessions.map((s) => (
              <div key={s.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">

                {/* Left: icon + meta */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: '#e8f4fa' }}>
                    {s.file_type === 'video' ? '🎬' : '🎙️'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#141c52' }}>
                      {s.file_type === 'video' ? 'Video' : 'Audio'} Analysis
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                    {s.result?.tone && (
                      <p className="text-xs text-gray-400 mt-0.5">Tone: {s.result.tone}</p>
                    )}
                  </div>
                </div>

                {/* Right: score + status + action */}
                <div className="flex items-center gap-3 shrink-0">
                  {s.result && <ScorePill score={s.result.overall_score} />}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                  {s.status === 'done' && (
                    <Link href={`/analyze?session=${s.id}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#141c52', color: '#141c52' }}>
                      View →
                    </Link>
                  )}
                  {s.status === 'done' && (
                    <Link href={`/share/${s.id}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                      Share
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-gray-400 pt-2">
              {displayedSessions.length}{filterStatus ? ` ${STATUS_LABELS[filterStatus].toLowerCase()}` : ''} session{displayedSessions.length !== 1 ? 's' : ''}{filterStatus ? ` · ${sessions.length} total` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
