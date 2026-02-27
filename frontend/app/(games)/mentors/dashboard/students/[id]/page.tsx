'use client';

import { use, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface AnalysisEntry {
  created_at: string;
  overall_score: number | null;
  fluency_score: number | null;
  grammar_score: number | null;
  pace_score: number | null;
  pronunciation_score: number | null;
  vocabulary_score: number | null;
}

interface SessionEntry {
  id: number;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  homework: string;
}

interface ProgressData {
  student_id: number;
  student_name: string;
  student_initial: string;
  analysis_history: AnalysisEntry[];
  sessions: SessionEntry[];
  note: string;
}

const DIMS: { key: keyof AnalysisEntry; label: string; color: string }[] = [
  { key: 'fluency_score',       label: 'Fluency',       color: '#6366f1' },
  { key: 'grammar_score',       label: 'Grammar',       color: '#10b981' },
  { key: 'pace_score',          label: 'Pace',          color: '#f59e0b' },
  { key: 'pronunciation_score', label: 'Pronunciation', color: '#ef4444' },
  { key: 'vocabulary_score',    label: 'Vocabulary',    color: '#8b5cf6' },
];

function ScoreBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  const v = value ?? 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold" style={{ color }}>{value ?? '—'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}

export default function StudentProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
  }, [isLoggedIn, router]);

  const { data, isLoading, isError } = useQuery<ProgressData>({
    queryKey: ['student-progress', id],
    enabled: isLoggedIn,
    queryFn: () => api.get(`/mentors/students/${id}/progress/`).then((r) => r.data),
    retry: false,
  });

  useEffect(() => {
    if (data) setNote(data.note ?? '');
  }, [data]);

  const saveNote = useMutation({
    mutationFn: () => api.put(`/mentors/students/${id}/note/`, { note }),
    onSuccess: () => { setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000); },
  });

  useEffect(() => {
    if (isError) router.replace('/mentors/dashboard');
  }, [isError, router]);

  if (!isLoggedIn) return null;

  const latest = data?.analysis_history[0];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/mentors/dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 hover:bg-indigo-50 transition-colors flex-shrink-0"
            style={{ borderColor: '#141c52', color: '#141c52' }}>
            ← Dashboard
          </Link>
          {data && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}>
                {data.student_initial}
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#141c52' }}>{data.student_name}</h1>
                <p className="text-xs text-gray-400">{data.sessions.length} session{data.sessions.length !== 1 ? 's' : ''} together</p>
              </div>
            </div>
          )}
        </div>

        {isLoading || !data ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Goal / Note */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold mb-3" style={{ color: '#141c52' }}>Goal / Notes (private)</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Set a goal or note for this student…"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-indigo-400 mb-3"
              />
              <button
                onClick={() => saveNote.mutate()}
                disabled={saveNote.isPending}
                className="text-sm font-bold px-5 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}>
                {noteSaved ? 'Saved ✓' : saveNote.isPending ? 'Saving…' : 'Save Note'}
              </button>
            </div>

            {/* Latest scorecard */}
            {latest && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: '#141c52' }}>Latest Scores</h2>
                  <span className="text-xs text-gray-400">
                    {new Date(latest.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {latest.overall_score != null && (
                  <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: '#f0f4ff' }}>
                    <span className="text-3xl font-bold" style={{ color: '#141c52' }}>{latest.overall_score}</span>
                    <span className="text-sm text-gray-500">/ 100 overall</span>
                  </div>
                )}
                <div className="space-y-3">
                  {DIMS.map(({ key, label, color }) => (
                    <ScoreBar key={key} label={label} value={latest[key] as number | null} color={color} />
                  ))}
                </div>
              </div>
            )}

            {/* Score history (simple list) */}
            {data.analysis_history.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#141c52' }}>Score History</h2>
                <div className="space-y-2">
                  {data.analysis_history.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-gray-400 w-24 flex-shrink-0">
                        {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {a.overall_score != null && (
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${a.overall_score}%`,
                            background: 'linear-gradient(to right,#141c52,#6366f1)',
                          }} />
                        </div>
                      )}
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: '#141c52' }}>
                        {a.overall_score ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold" style={{ color: '#141c52' }}>Sessions Together</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {data.sessions.map((s) => (
                  <div key={s.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {new Date(s.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}{s.duration_minutes} min
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={s.status === 'completed'
                          ? { background: '#dcfce7', color: '#166534' }
                          : { background: '#dbeafe', color: '#1e40af' }}>
                        {s.status}
                      </span>
                    </div>
                    {s.homework && (
                      <p className="text-xs text-gray-400 mt-1 truncate">📚 {s.homework}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
