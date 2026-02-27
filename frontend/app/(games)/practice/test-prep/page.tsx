'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const SECTION_TYPE_META: Record<string, { bg: string; text: string; emoji: string }> = {
  Speaking:  { bg: '#ede9fe', text: '#6d28d9', emoji: '🎤' },
  Writing:   { bg: '#dbeafe', text: '#1e40af', emoji: '✍️' },
  Listening: { bg: '#d1fae5', text: '#065f46', emoji: '🎧' },
  Reading:   { bg: '#fef9c3', text: '#92400e', emoji: '📖' },
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
  scoring_info: Record<string, unknown>;
}

const EXAM_ICONS: Record<string, string> = {
  ielts: '🎓',
  toefl: '📘',
  pte: '💡',
  oet: '🏥',
  celpip: '🍁',
};

const EXAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ielts:  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  toefl:  { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  pte:    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  oet:    { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  celpip: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  listening: '🎧 Listening',
  reading: '📖 Reading',
  writing: '✍️ Writing',
  speaking: '🎙️ Speaking',
};

const SECTION_FILTER_TABS = [
  { id: 'all', label: 'All Sections' },
  { id: 'speaking', label: '🎙️ Speaking' },
  { id: 'writing', label: '✍️ Writing' },
  { id: 'listening', label: '🎧 Listening' },
  { id: 'reading', label: '📖 Reading' },
];

const SCORING_GUIDES = [
  { slug_key: 'ielts',  label: 'IELTS',   scale: '0–9 bands',  target: 'Band 6.5–7.0' },
  { slug_key: 'toefl',  label: 'TOEFL',   scale: '0–120 pts',  target: '80–100 pts' },
  { slug_key: 'pte',    label: 'PTE',     scale: '10–90 pts',  target: '65+ pts' },
  { slug_key: 'oet',    label: 'OET',     scale: 'Grade A–E',  target: 'Grade B' },
  { slug_key: 'celpip', label: 'CELPIP',  scale: 'Level 1–12', target: 'Level 7+' },
];

export default function TestPrepHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFilter = searchParams.get('section') ?? 'all';
  function setSectionFilter(val: string) {
    const url = val && val !== 'all' ? `/practice/test-prep?section=${val}` : '/practice/test-prep';
    router.push(url);
  }

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['testprep-exams'],
    queryFn: () => api.get('/testprep/exams/').then((r) => r.data),
  });

  const filteredExams = exams
    .map((exam) => ({
      ...exam,
      sections: sectionFilter === 'all'
        ? exam.sections
        : exam.sections.filter((s) => s.section_type === sectionFilter),
    }))
    .filter((exam) => sectionFilter === 'all' || exam.sections.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Practice</Link>
          <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#fe9940' }}>Test Prep</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND.primary }}>Prepare for Your Exam</h1>
          <p className="text-gray-500 text-sm">Timed, distraction-free practice sessions for IELTS, TOEFL, PTE, OET, and CELPIP. Each attempt is scored by our AI.</p>
        </div>

        {/* Scoring quick-reference — card style with colored header bands */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {SCORING_GUIDES.map((g) => {
            const ec = EXAM_COLORS[g.slug_key] ?? { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
            return (
              <div key={g.slug_key} className="rounded-xl border overflow-hidden" style={{ borderColor: ec.border }}>
                <div className="py-2 text-center" style={{ background: ec.bg }}>
                  <p className="text-xs font-bold" style={{ color: ec.text }}>{g.label}</p>
                </div>
                <div className="bg-white px-2 py-2 text-center">
                  <p className="text-xs text-gray-500">{g.scale}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Target: {g.target}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section type filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {SECTION_FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSectionFilter(tab.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={sectionFilter === tab.id
                ? { background: BRAND.gradient, color: BRAND.primary, borderColor: 'transparent' }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold">No exams match this filter</p>
            <button
              onClick={() => setSectionFilter('all')}
              className="mt-3 text-sm hover:underline"
              style={{ color: BRAND.primary }}
            >
              View all exams
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExams.map((exam) => {
              const slugBase = exam.slug.split('-')[0];
              const icon = EXAM_ICONS[slugBase] ?? '📋';
              const ec = EXAM_COLORS[slugBase] ?? { bg: '#f8faff', text: BRAND.primary, border: '#e5e7eb' };
              return (
                <div key={exam.id} className="rounded-2xl border overflow-hidden hover:shadow-md transition-shadow"
                  style={{ borderColor: ec.border }}>
                  {/* Colored card header */}
                  <div className="relative overflow-hidden p-6" style={{ background: ec.bg }}>
                    <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full"
                      style={{ background: ec.text, opacity: 0.1 }} />
                    <div className="relative flex items-center gap-3 mb-2">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: BRAND.primary }}>{exam.name}</h2>
                        <p className="text-xs uppercase tracking-wide" style={{ color: ec.text }}>{exam.slug}</p>
                      </div>
                    </div>
                    <p className="relative text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                  </div>

                  {/* Sections list */}
                  <div className="bg-white p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      {sectionFilter === 'all' ? 'All Sections' : `${sectionFilter.charAt(0).toUpperCase() + sectionFilter.slice(1)} Sections`}
                    </p>
                    <div className="space-y-2">
                      {exam.sections.map((section) => (
                        <Link
                          key={section.id}
                          href={`/practice/test-prep/${exam.slug}/${section.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: BRAND.primary }}>
                              {SECTION_TYPE_LABELS[section.section_type] ?? section.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {section.name}
                            </span>
                            {section.question_count > 0 && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                {section.question_count}q
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {section.time_limit_minutes > 0 && (
                              <span className="text-xs text-gray-400">⏱ {section.time_limit_minutes}m</span>
                            )}
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/practice/test-prep/${exam.slug}`}
                      className="mt-4 block text-center text-sm font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90"
                      style={{ background: BRAND.gradient, color: BRAND.primary }}
                    >
                      View Full Exam →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent attempts */}
        <section className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: '#fef9c3', color: '#92400e' }}>📋</span>
            <h2 className="font-bold" style={{ color: BRAND.primary }}>Recent Attempts</h2>
            <Link href="/practice" className="text-sm ml-auto hover:underline" style={{ color: BRAND.primary }}>← Practice</Link>
          </div>
          <RecentAttempts />
        </section>
      </div>
    </div>
  );
}

function RecentAttempts() {
  const { data: attempts = [], isLoading } = useQuery<{
    id: number;
    exam: { name: string; slug: string };
    section: { title: string; slug: string } | null;
    started_at: string;
    completed_at: string | null;
    predicted_score: { overall?: number; band_estimate?: string } | null;
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
      {attempts.slice(0, 6).map((a) => (
        <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div>
            <p className="text-sm font-medium" style={{ color: '#141c52' }}>
              {a.exam.name}{a.section ? ` — ${a.section.title}` : ''}
            </p>
            <p className="text-xs text-gray-400">{new Date(a.started_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {a.completed_at ? (
              <div>
                {a.predicted_score?.band_estimate && (
                  <p className="text-sm font-bold" style={{ color: '#141c52' }}>{a.predicted_score.band_estimate}</p>
                )}
                <p className="text-xs text-gray-400">avg {a.predicted_score?.overall ?? '—'}/10</p>
              </div>
            ) : (
              <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Incomplete</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
