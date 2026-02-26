'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

type ColorSpec = { bg: string; text: string };

interface Props {
  colorMap?: Record<string, ColorSpec>;
}

const DEFAULT_COLORS: Record<string, ColorSpec> = {
  ielts:  { bg: '#dbeafe', text: '#1e40af' },
  toefl:  { bg: '#fce7f3', text: '#9d174d' },
  pte:    { bg: '#dcfce7', text: '#166534' },
  oet:    { bg: '#fef3c7', text: '#78350f' },
  celpip: { bg: '#ede9fe', text: '#6d28d9' },
  dele:   { bg: '#ffedd5', text: '#9a3412' },
  dalf:   { bg: '#ffedd5', text: '#9a3412' },
  jlpt:   { bg: '#f0fdf4', text: '#166534' },
};

const EXAM_EMOJIS: Record<string, string> = {
  ielts:  '🇬🇧',
  toefl:  '🇺🇸',
  pte:    '🌏',
  oet:    '🏥',
  celpip: '🍁',
  dele:   '🇪🇸',
  dalf:   '🇫🇷',
  jlpt:   '🇯🇵',
};

function colorFor(slug: string, colorMap: Record<string, ColorSpec>): ColorSpec {
  return colorMap[slug] ?? colorMap[slug.split('-')[0]] ?? { bg: '#f3f4f6', text: '#374151' };
}

function emojiFor(slug: string): string {
  return EXAM_EMOJIS[slug] ?? EXAM_EMOJIS[slug.split('-')[0]] ?? '📝';
}

function shortName(name: string): string {
  return name.replace(/ Academic$/i, '').replace(/ iBT$/i, '').replace(/ General$/i, '');
}

const FALLBACK_EXAMS: Exam[] = [
  { id: 1, name: 'IELTS Academic', slug: 'ielts-academic', description: 'International English Language Testing System' },
  { id: 2, name: 'TOEFL iBT',      slug: 'toefl-ibt',     description: 'Test of English as a Foreign Language' },
  { id: 3, name: 'PTE Academic',   slug: 'pte-academic',  description: 'Pearson Test of English' },
  { id: 4, name: 'OET',            slug: 'oet',           description: 'Occupational English Test for healthcare professionals' },
  { id: 5, name: 'CELPIP',         slug: 'celpip',        description: 'Canadian English Language Proficiency Index Program' },
];

export default function TestPrepChips({ colorMap }: Props) {
  const colors = colorMap ?? DEFAULT_COLORS;

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['testprep-exams'],
    queryFn: () => api.get('/testprep/exams/').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const chips = exams.length > 0 ? exams : FALLBACK_EXAMS;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {chips.map((exam) => {
        const examColor = colorFor(exam.slug, colors);
        const examEmoji = emojiFor(exam.slug);
        return (
          <Link
            key={exam.slug}
            href={`/practice/test-prep/${exam.slug}`}
            className="block rounded-2xl border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
          >
            {/* Colored header */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: examColor.bg }}
            >
              <span className="text-xl">{examEmoji}</span>
              <span
                className="font-extrabold text-sm leading-tight"
                style={{ color: examColor.text }}
              >
                {shortName(exam.name)}
              </span>
            </div>
            {/* White body */}
            <div className="px-4 py-2 pb-3 bg-white">
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {exam.description ?? 'Prepare for this English proficiency exam.'}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
