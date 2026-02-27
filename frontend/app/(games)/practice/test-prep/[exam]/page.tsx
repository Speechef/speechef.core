'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const EXAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ielts:  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  toefl:  { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  pte:    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  oet:    { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  celpip: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
};

const SECTION_TYPE_META: Record<string, { bg: string; text: string; emoji: string; color: string }> = {
  speaking:  { bg: '#ede9fe', text: '#6d28d9', emoji: '🎙️', color: '#4f46e5' },
  writing:   { bg: '#dbeafe', text: '#1e40af', emoji: '✍️', color: '#0891b2' },
  listening: { bg: '#d1fae5', text: '#065f46', emoji: '🎧', color: '#059669' },
  reading:   { bg: '#fef9c3', text: '#92400e', emoji: '📖', color: '#d97706' },
  general:   { bg: '#f3f4f6', text: '#374151', emoji: '📝', color: '#6b7280' },
};

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
          <Link href="/practice/test-prep" className="text-sm mt-2 block hover:underline" style={{ color: BRAND.primary }}>
            ← Back to Test Prep
          </Link>
        </div>
      </div>
    );
  }

  const slugBase = data.slug.split('-')[0];
  const ec = EXAM_COLORS[slugBase] ?? { bg: '#f8faff', text: BRAND.primary, border: '#e5e7eb' };

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

        {/* Exam hero card — colored band */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: ec.border }}>
          <div className="relative overflow-hidden px-7 py-6" style={{ background: ec.bg }}>
            <div className="absolute top-[-24px] right-[-24px] w-28 h-28 rounded-full"
              style={{ background: ec.text, opacity: 0.1 }} />
            <div className="relative">
              <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>{data.name}</h1>
              {data.scoring_info?.scale && (
                <div className="flex flex-wrap gap-4 text-sm mt-3">
                  <div>
                    <span className="text-xs uppercase tracking-wide block mb-0.5" style={{ color: ec.text }}>Score Scale</span>
                    <span className="font-semibold" style={{ color: BRAND.primary }}>{data.scoring_info.scale}</span>
                  </div>
                  {data.scoring_info.passing_score && (
                    <div>
                      <span className="text-xs uppercase tracking-wide block mb-0.5" style={{ color: ec.text }}>Typical Target</span>
                      <span className="font-semibold" style={{ color: BRAND.primary }}>{data.scoring_info.passing_score}</span>
                    </div>
                  )}
                  {data.scoring_info.score_composition && (
                    <div>
                      <span className="text-xs uppercase tracking-wide block mb-0.5" style={{ color: ec.text }}>Composed of</span>
                      <span className="font-semibold text-xs" style={{ color: BRAND.primary }}>{data.scoring_info.score_composition}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="bg-white px-7 py-4">
            <p className="text-gray-600 text-sm">{data.description}</p>
          </div>
        </div>

        {/* Scoring bands / levels */}
        {scoringEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: BRAND.primary }}>
              Score Breakdown
            </h2>
            <div className="space-y-2">
              {scoringEntries.map(([band, desc]) => (
                <div key={band} className="flex items-start gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 whitespace-nowrap"
                    style={{ color: BRAND.primary, minWidth: 48, textAlign: 'center' }}>
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
            {orderedTypes.map((type) => {
              const stm = SECTION_TYPE_META[type] ?? SECTION_TYPE_META.general;
              return (
                <div key={type}>
                  {/* Colored emoji chip section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-sm font-semibold"
                      style={{ background: stm.bg, color: stm.text }}>
                      {stm.emoji}
                    </span>
                    <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: stm.color }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sectionsByType[type].map((section) => (
                      <Link
                        key={section.id}
                        href={`/practice/test-prep/${exam}/${section.slug}`}
                        className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                        style={{ borderLeftWidth: 3, borderLeftColor: stm.color }}
                      >
                        <h3 className="font-bold mb-1" style={{ color: BRAND.primary }}>{section.name}</h3>
                        {section.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{section.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{section.question_count > 0 ? `${section.question_count} questions` : 'Practice questions'}</span>
                          {section.time_limit_minutes > 0 && <span>⏱ {section.time_limit_minutes} min</span>}
                        </div>
                        <div className="mt-4 text-sm font-semibold flex items-center gap-1" style={{ color: BRAND.primary }}>
                          Start Practice
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
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
