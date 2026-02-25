import Link from 'next/link';
import ActiveSessionBanner from './ActiveSessionBanner';
import PracticeStatsBanner from './PracticeStatsBanner';
import WordGamesSection from './WordGamesSection';

const rolePlayModes = [
  {
    href: '/practice/roleplay/job_interview',
    title: 'Job Interview',
    description: 'Practice answering interview questions with an AI interviewer.',
    emoji: '💼',
  },
  {
    href: '/practice/roleplay/presentation',
    title: 'Presentation Pitch',
    description: 'Deliver your pitch to an AI audience and handle follow-up questions.',
    emoji: '🎤',
  },
  {
    href: '/practice/roleplay/debate',
    title: 'Debate',
    description: 'Sharpen your argumentation against an AI debater.',
    emoji: '🗣️',
  },
  {
    href: '/practice/roleplay/small_talk',
    title: 'Small Talk',
    description: 'Practice natural English conversation in everyday scenarios.',
    emoji: '💬',
  },
];

const testPrepExams = [
  { href: '/practice/test-prep/ielts', label: 'IELTS', color: '#dbeafe' },
  { href: '/practice/test-prep/toefl', label: 'TOEFL', color: '#fce7f3' },
  { href: '/practice/test-prep/pte', label: 'PTE', color: '#dcfce7' },
  { href: '/practice/test-prep/oet', label: 'OET', color: '#fef3c7' },
  { href: '/practice/test-prep/celpip', label: 'CELPIP', color: '#ede9fe' },
  { href: '/practice/test-prep/dele', label: 'DELE', color: '#ffedd5' },
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-14">

        <ActiveSessionBanner />
        <PracticeStatsBanner />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#141c52' }}>Practice</h1>
            <p className="text-gray-500">Games, AI role play, and test prep — all in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/practice/history"
              className="text-sm font-medium hover:underline"
              style={{ color: '#141c52' }}>
              History →
            </Link>
            <a
              href="/practice/daily-challenge"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              🔥 Daily Challenge
            </a>
          </div>
        </div>

        {/* ── Role Play ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#141c52' }}>AI Role Play</h2>
              <p className="text-gray-500 text-sm mt-0.5">Have real conversations with an AI coach and get scored.</p>
            </div>
            <Link href="/practice/roleplay"
              className="text-sm font-medium hover:underline"
              style={{ color: '#141c52' }}>
              See all modes →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rolePlayModes.map((m) => (
              <Link key={m.href} href={m.href}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{m.emoji}</div>
                <h3 className="font-bold text-sm mb-1" style={{ color: '#141c52' }}>{m.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{m.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Word Games ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#141c52' }}>Word Games</h2>
              <p className="text-gray-500 text-sm mt-0.5">Sharpen vocabulary and recall with gamified challenges.</p>
            </div>
            <Link href="/practice/leaderboard"
              className="text-sm font-medium hover:underline"
              style={{ color: '#141c52' }}>
              Leaderboard →
            </Link>
          </div>
          <WordGamesSection />
        </section>

        {/* ── Test Prep ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#141c52' }}>Test Prep</h2>
              <p className="text-gray-500 text-sm mt-0.5">Mock exams and speaking tasks for major English proficiency tests.</p>
            </div>
            <Link href="/practice/test-prep"
              className="text-sm font-medium hover:underline"
              style={{ color: '#141c52' }}>
              All exams →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {testPrepExams.map((exam) => (
              <Link key={exam.href} href={exam.href}
                className="flex items-center justify-center py-4 rounded-xl font-bold text-sm hover:opacity-80 transition-opacity"
                style={{ backgroundColor: exam.color, color: '#141c52' }}>
                {exam.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 text-center">
            <Link href="/practice/test-prep"
              className="text-sm text-gray-400 hover:text-gray-600">
              + More exams (PTE, OET, CELPIP, DALF, JLPT…)
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
