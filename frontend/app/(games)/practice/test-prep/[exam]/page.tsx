'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface ExamSection {
  id: number;
  name: string;
  slug: string;
  section_type: string;
  question_count: number;
  time_limit_minutes: number;
  description: string;
}

interface Exam {
  id: number;
  name: string;
  slug: string;
  description: string;
  sections: ExamSection[];
  scoring_info: {
    scale?: string;
    passing_score?: string;
    bands?: Record<string, string>;
    levels?: Record<string, string>;
    grades?: Record<string, string>;
    score_composition?: string;
  };
}

const SECTION_ICONS: Record<string, string> = {
  listening: '🎧',
  reading: '📖',
  writing: '✍️',
  speaking: '🎙️',
  general: '📝',
};

const SECTION_COLORS: Record<string, string> = {
  speaking: '#4f46e5',
  writing: '#0891b2',
  listening: '#059669',
  reading: '#d97706',
  general: '#6b7280',
};

export default function ExamDetailPage() {
  const { exam } = useParams<{ exam: string }>();

  const { data, isLoading } = useQuery<Exam>({
    queryKey: ['exam', exam],
    queryFn: () => api.get(`/testprep/exams/${exam}/`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-2">📋</p>
          <p>Exam not found.</p>
          <Link href="/practice/test-prep" className="text-indigo-600 text-sm mt-2 block hover:underline">
            ← Back to Test Prep
          </Link>
        </div>
      </div>
    );
  }

  const scoringMap = data.scoring_info?.bands ?? data.scoring_info?.levels ?? data.scoring_info?.grades ?? {};
  const scoringEntries = Object.entries(scoringMap);

  // Group sections by type
  const sectionsByType = data.sections.reduce<Record<string, ExamSection[]>>((acc, s) => {
    const type = s.section_type ?? 'general';
    if (!acc[type]) acc[type] = [];
    acc[type].push(s);
    return acc;
  }, {});
  const sectionTypeOrder = ['speaking', 'writing', 'listening', 'reading', 'general'];
  const orderedTypes = sectionTypeOrder.filter((t) => sectionsByType[t]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/practice/test-prep" className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">
          ← All Exams
        </Link>

        {/* Exam hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7 mb-6"
          style={{ background: 'linear-gradient(135deg,#f8faff,#f0f2ff)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>{data.name}</h1>
          <p className="text-gray-600 text-sm mb-4">{data.description}</p>
          {data.scoring_info?.scale && (
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">Score Scale</span>
                <span className="font-semibold" style={{ color: '#141c52' }}>{data.scoring_info.scale}</span>
              </div>
              {data.scoring_info.passing_score && (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">Typical Target</span>
                  <span className="font-semibold" style={{ color: '#141c52' }}>{data.scoring_info.passing_score}</span>
                </div>
              )}
              {data.scoring_info.score_composition && (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">Composed of</span>
                  <span className="font-semibold text-xs" style={{ color: '#141c52' }}>{data.scoring_info.score_composition}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scoring bands / levels */}
        {scoringEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: '#141c52' }}>
              Score Breakdown
            </h2>
            <div className="space-y-2">
              {scoringEntries.map(([band, desc]) => (
                <div key={band} className="flex items-start gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 whitespace-nowrap" style={{ color: '#141c52', minWidth: 48, textAlign: 'center' }}>
                    {band}
                  </span>
                  <p className="text-sm text-gray-600 pt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections grouped by type */}
        {orderedTypes.length > 0 ? (
          <div className="space-y-6">
            {orderedTypes.map((type) => (
              <div key={type}>
                <h2 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: SECTION_COLORS[type] ?? '#141c52' }}>
                  <span>{SECTION_ICONS[type] ?? '📝'}</span>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sectionsByType[type].map((section) => (
                    <Link
                      key={section.id}
                      href={`/practice/test-prep/${exam}/${section.slug}`}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                    >
                      <h3 className="font-bold mb-1" style={{ color: '#141c52' }}>{section.name}</h3>
                      {section.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{section.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{section.question_count > 0 ? `${section.question_count} questions` : 'Practice questions'}</span>
                        {section.time_limit_minutes > 0 && <span>⏱ {section.time_limit_minutes} min</span>}
                      </div>
                      <div className="mt-4 text-sm font-semibold flex items-center gap-1" style={{ color: '#141c52' }}>
                        Start Practice
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No sections available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
