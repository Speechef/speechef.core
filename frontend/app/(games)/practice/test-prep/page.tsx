'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface ExamSection {
  id: number;
  title: string;
  slug: string;
  section_type: string;
  question_count: number;
  time_limit_minutes: number;
}

interface Exam {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  sections: ExamSection[];
}

const EXAM_ICONS: Record<string, string> = {
  ielts: '🎓',
  toefl: '📘',
  pte: '💡',
  oet: '🏥',
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  listening: '🎧 Listening',
  reading: '📖 Reading',
  writing: '✍️ Writing',
  speaking: '🎙️ Speaking',
};

export default function TestPrepHubPage() {
  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['testprep-exams'],
    queryFn: () => api.get('/testprep/exams/').then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#fe9940' }}>Test Prep</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#141c52' }}>Prepare for Your Exam</h1>
          <p className="text-gray-500">Timed, distraction-free practice sessions for IELTS, TOEFL, and more. Each attempt is analyzed by our AI.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold">Exams loading soon</p>
            <p className="text-sm mt-1">Check back in a moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const icon = EXAM_ICONS[exam.slug.split('-')[0]] ?? '📋';
              return (
                <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-50" style={{ background: 'linear-gradient(135deg,#f8faff,#f0f2ff)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: '#141c52' }}>{exam.name}</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{exam.slug}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{exam.description}</p>
                  </div>

                  {/* Sections */}
                  <div className="p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Sections</p>
                    <div className="space-y-2">
                      {(exam.sections ?? []).map((section) => (
                        <Link
                          key={section.id}
                          href={`/practice/test-prep/${exam.slug}/${section.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{SECTION_TYPE_LABELS[section.section_type] ?? section.title}</span>
                            {section.question_count > 0 && (
                              <span className="text-xs text-gray-400">{section.question_count} questions</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {section.time_limit_minutes > 0 && (
                              <span className="text-xs text-gray-400">⏱ {section.time_limit_minutes}m</span>
                            )}
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/practice/test-prep/${exam.slug}`}
                      className="mt-4 block text-center text-sm font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                    >
                      Full Practice Exam →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My attempts */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: '#141c52' }}>Recent Attempts</h2>
            <Link href="/practice" className="text-sm text-indigo-600 hover:underline">← Back to Practice</Link>
          </div>
          <RecentAttempts />
        </div>
      </div>
    </div>
  );
}

function RecentAttempts() {
  const { data: attempts = [], isLoading } = useQuery<{
    id: number; exam: { name: string }; section: { title: string } | null;
    started_at: string; completed_at: string | null; predicted_score: Record<string, unknown> | null;
  }[]>({
    queryKey: ['testprep-my-attempts'],
    queryFn: () => api.get('/testprep/attempts/my/').then((r) => r.data),
    retry: false,
  });

  if (isLoading) return <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />;
  if (attempts.length === 0) return (
    <p className="text-gray-400 text-sm text-center py-6">No attempts yet. Start a practice session above.</p>
  );

  return (
    <div className="space-y-2">
      {attempts.slice(0, 5).map((a) => (
        <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div>
            <p className="text-sm font-medium" style={{ color: '#141c52' }}>{a.exam.name} {a.section ? `— ${a.section.title}` : ''}</p>
            <p className="text-xs text-gray-400">{new Date(a.started_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {a.completed_at ? (
              <span className="text-sm font-bold" style={{ color: '#141c52' }}>
                {(a.predicted_score as { overall?: number })?.overall ?? '—'}
              </span>
            ) : (
              <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Incomplete</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
