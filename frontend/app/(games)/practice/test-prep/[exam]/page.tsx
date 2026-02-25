'use client';

import { useParams } from 'next/navigation';
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
  description: string;
}

interface Exam {
  id: number;
  name: string;
  slug: string;
  description: string;
  sections: ExamSection[];
}

const SECTION_ICONS: Record<string, string> = {
  listening: '🎧',
  reading: '📖',
  writing: '✍️',
  speaking: '🎙️',
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
          <Link href="/practice/test-prep" className="text-indigo-600 text-sm mt-2 block hover:underline">← Back to Test Prep</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/practice/test-prep" className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← All Exams</Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-7 mb-6"
          style={{ background: 'linear-gradient(135deg,#f8faff,#f0f2ff)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>{data.name}</h1>
          <p className="text-gray-600 text-sm">{data.description}</p>
        </div>

        <h2 className="font-bold text-lg mb-4" style={{ color: '#141c52' }}>Practice by Section</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(data.sections ?? []).map((section) => (
            <Link
              key={section.id}
              href={`/practice/test-prep/${exam}/${section.slug}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{SECTION_ICONS[section.section_type] ?? '📝'}</span>
                <h3 className="font-bold" style={{ color: '#141c52' }}>{section.title}</h3>
              </div>
              {section.description && (
                <p className="text-xs text-gray-500 mb-3">{section.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{section.question_count > 0 ? `${section.question_count} questions` : 'Practice questions'}</span>
                {section.time_limit_minutes > 0 && <span>⏱ {section.time_limit_minutes} min</span>}
              </div>
              <div className="mt-4 text-sm font-semibold flex items-center gap-1"
                style={{ color: '#141c52' }}>
                Start Practice
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {data.sections?.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No sections available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
