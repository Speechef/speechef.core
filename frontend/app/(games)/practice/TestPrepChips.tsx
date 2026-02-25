'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
  id: number;
  name: string;
  slug: string;
}

// Maps slug prefix → background color
const SLUG_COLORS: Record<string, string> = {
  'ielts':  '#dbeafe',
  'toefl':  '#fce7f3',
  'pte':    '#dcfce7',
  'oet':    '#fef3c7',
  'celpip': '#ede9fe',
  'dele':   '#ffedd5',
  'dalf':   '#ffedd5',
  'jlpt':   '#f0fdf4',
};

function colorFor(slug: string): string {
  // Try exact match first, then prefix (e.g. "ielts-academic" → "ielts")
  return SLUG_COLORS[slug] ?? SLUG_COLORS[slug.split('-')[0]] ?? '#f3f4f6';
}

// Shorten display name: "IELTS Academic" → "IELTS", "TOEFL iBT" → "TOEFL"
function shortName(name: string): string {
  return name.replace(/ Academic$/i, '').replace(/ iBT$/i, '').replace(/ General$/i, '');
}

export default function TestPrepChips() {
  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['testprep-exams'],
    queryFn: () => api.get('/testprep/exams/').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // If API returns nothing (e.g. no seed data), show sensible fallback
  const chips = exams.length > 0 ? exams : [
    { id: 1, name: 'IELTS Academic', slug: 'ielts-academic' },
    { id: 2, name: 'TOEFL iBT',      slug: 'toefl-ibt'     },
    { id: 3, name: 'PTE Academic',   slug: 'pte-academic'  },
    { id: 4, name: 'OET',            slug: 'oet'           },
    { id: 5, name: 'CELPIP',         slug: 'celpip'        },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {chips.map((exam) => (
        <Link
          key={exam.slug}
          href={`/practice/test-prep/${exam.slug}`}
          className="flex items-center justify-center py-4 rounded-xl font-bold text-sm hover:opacity-80 transition-opacity text-center"
          style={{ backgroundColor: colorFor(exam.slug), color: '#141c52' }}
        >
          {shortName(exam.name)}
        </Link>
      ))}
    </div>
  );
}
