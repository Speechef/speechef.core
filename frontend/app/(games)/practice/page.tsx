import Link from 'next/link';
import ActiveSessionBanner from './ActiveSessionBanner';
import PracticeStatsBanner from './PracticeStatsBanner';
import WordGamesSection, { type GameConfig } from './WordGamesSection';
import TestPrepChips from './TestPrepChips';
import DailyStrip from './DailyStrip';

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = {
  primary:  '#141c52',
  gradient: 'linear-gradient(to right, #FADB43, #fe9940)',
} as const;

// ─── Section themes ────────────────────────────────────────────────────────────
const SECTIONS = {
  wordGames: {
    emoji: '🎮', label: 'Word Games',
    bg: '#d1fae5', text: '#065f46', border: '#6ee7b7',
    gradFrom: '#d1fae5', gradTo: '#a7f3d0',
  },
  roleplay: {
    emoji: '🎭', label: 'AI Roleplay',
    bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd',
    gradFrom: '#ede9fe', gradTo: '#ddd6fe',
  },
  testPrep: {
    emoji: '📝', label: 'Test Prep',
    bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd',
    gradFrom: '#dbeafe', gradTo: '#bfdbfe',
  },
} as const;

// ─── Difficulty styles ─────────────────────────────────────────────────────────
const DIFF: Record<string, { bg: string; text: string; dot: string }> = {
  Easy:   { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  Medium: { bg: '#fef9c3', text: '#92400e', dot: '#f59e0b' },
  Hard:   { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

// ─── Roleplay modes ────────────────────────────────────────────────────────────
const ROLEPLAY_MODES = [
  {
    href: '/practice/roleplay/job_interview',
    title: 'Job Interview',
    description: 'Practice answering tough interview questions with a real-time AI interviewer.',
    emoji: '💼', difficulty: 'Hard', estimatedMin: 10, featured: true,
    color: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  },
  {
    href: '/practice/roleplay/presentation',
    title: 'Presentation Pitch',
    description: 'Deliver your pitch to an AI audience and handle follow-up questions.',
    emoji: '🎤', difficulty: 'Medium', estimatedMin: 8, featured: false,
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/roleplay/debate',
    title: 'Debate',
    description: 'Sharpen your argumentation skills against a challenging AI debater.',
    emoji: '🗣️', difficulty: 'Hard', estimatedMin: 12, featured: false,
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
  {
    href: '/practice/roleplay/small_talk',
    title: 'Small Talk',
    description: 'Practice natural English in everyday social and networking scenarios.',
    emoji: '💬', difficulty: 'Easy', estimatedMin: 5, featured: false,
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
] as const;

// ─── Word games ────────────────────────────────────────────────────────────────
const WORD_GAMES: GameConfig[] = [
  {
    href: '/practice/vocabulary-blitz', title: 'Vocabulary Blitz',
    emoji: '⚡', badge: 'Hot', gameKey: 'blitz',
    description: 'Answer as many word questions as possible in 60 seconds.',
    color: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  },
  {
    href: '/practice/guess-the-word', title: 'Guess the Word',
    emoji: '🧠', badge: null, gameKey: 'guess',
    description: 'Select the correct meaning for a random word.',
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/memory-match', title: 'Memory Match',
    emoji: '🃏', badge: null, gameKey: 'memory',
    description: 'Flip cards to match words with their meanings.',
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
  {
    href: '/practice/word-scramble', title: 'Word Scramble',
    emoji: '🔤', badge: null, gameKey: 'scramble',
    description: 'Unscramble the letters to reveal the hidden word.',
    color: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  },
  {
    href: '/practice/sentence-builder', title: 'Sentence Builder',
    emoji: '✍️', badge: null, gameKey: 'sentence',
    description: 'Use vocabulary words correctly in sentences — graded by AI.',
    color: { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  },
  {
    href: '/practice/pronunciation-challenge', title: 'Pronunciation Challenge',
    emoji: '🎙️', badge: 'New', gameKey: 'pronunciation',
    description: 'Read phrases aloud and get AI feedback on your accuracy.',
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
];

// ─── Test prep color map ───────────────────────────────────────────────────────
const TESTPREP_COLORS: Record<string, { bg: string; text: string }> = {
  ielts:  { bg: '#dbeafe', text: '#1e40af' },
  toefl:  { bg: '#fce7f3', text: '#9d174d' },
  pte:    { bg: '#dcfce7', text: '#166534' },
  oet:    { bg: '#fef3c7', text: '#78350f' },
  celpip: { bg: '#ede9fe', text: '#6d28d9' },
};

// ─── Section header band ───────────────────────────────────────────────────────
type SectionTheme = typeof SECTIONS[keyof typeof SECTIONS];

function SectionHeader({
  theme, title, subtitle, seeAllHref, seeAllLabel, count,
}: {
  theme: SectionTheme;
  title: string;
  subtitle: string;
  seeAllHref: string;
  seeAllLabel: string;
  count?: number;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 mb-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.gradFrom} 0%, ${theme.gradTo} 100%)`,
        border: `1.5px solid ${theme.border}`,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full pointer-events-none"
        style={{ background: theme.text, opacity: 0.1 }}
      />
      <div
        className="absolute right-[56px] bottom-[-28px] w-16 h-16 rounded-full pointer-events-none"
        style={{ background: theme.text, opacity: 0.06 }}
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* Icon + text */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
            style={{ background: 'rgba(255,255,255,0.55)', border: `1.5px solid ${theme.border}` }}
          >
            {theme.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold leading-tight" style={{ color: theme.text }}>
                {title}
              </h2>
              {count !== undefined && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.55)', color: theme.text }}
                >
                  {count}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5 font-medium" style={{ color: theme.text, opacity: 0.72 }}>
              {subtitle}
            </p>
          </div>
        </div>
        {/* See all */}
        <Link
          href={seeAllHref}
          className="flex-shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.6)',
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        >
          {seeAllLabel} →
        </Link>
      </div>
    </div>
  );
}

// ─── Quick-play pill strip (Word Games) ───────────────────────────────────────
function QuickPlayStrip() {
  const pills = [
    { href: '/practice/vocabulary-blitz', label: 'Vocabulary Blitz', emoji: '⚡', color: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' } },
    { href: '/practice/guess-the-word',   label: 'Guess the Word',   emoji: '🧠', color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' } },
    { href: '/practice/word-scramble',    label: 'Word Scramble',    emoji: '🔤', color: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' } },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <span className="text-xs font-semibold text-gray-400 self-center mr-1 uppercase tracking-wide">
        Quick play:
      </span>
      {pills.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 hover:shadow-sm"
          style={{ background: p.color.bg, color: p.color.text, borderColor: p.color.border }}
        >
          {p.emoji} {p.label}
        </Link>
      ))}
    </div>
  );
}

// ─── AI Roleplay grid ─────────────────────────────────────────────────────────
type RolePlayMode = (typeof ROLEPLAY_MODES)[number];

function RolePlayFeatured({ mode }: { mode: RolePlayMode }) {
  const diff = DIFF[mode.difficulty];
  return (
    <Link
      href={mode.href}
      className="block rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group mb-4"
      style={{ border: '1.5px solid rgba(255,255,255,0.12)' }}
    >
      {/* Dark navy header */}
      <div
        className="relative px-6 py-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #141c52 0%, #1e2d78 60%, #2d3a8c 100%)' }}
      >
        {/* Decorative glows */}
        <div className="absolute right-[-30px] top-[-30px] w-40 h-40 rounded-full"
          style={{ background: 'rgba(250,219,67,0.08)' }} />
        <div className="absolute right-[80px] bottom-[-20px] w-24 h-24 rounded-full"
          style={{ background: 'rgba(250,219,67,0.05)' }} />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Emoji circle */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
              {mode.emoji}
            </div>
            <div>
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ background: BRAND.gradient, color: '#141c52' }}
                >
                  ⭐ Featured
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                >
                  🤖 AI-Powered
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white leading-tight">{mode.title}</h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {mode.description}
              </p>
            </div>
          </div>
          {/* Right meta */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {diff && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: diff.bg, color: diff.text }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 -mb-px"
                  style={{ background: diff.dot }} />
                {mode.difficulty}
              </span>
            )}
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ~{mode.estimatedMin} min
            </span>
          </div>
        </div>
      </div>

      {/* White footer */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: '#0f1640' }}
      >
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Speak, get scored, improve — instantly
        </p>
        <span
          className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 group-hover:scale-105"
          style={{ background: BRAND.gradient, color: '#141c52' }}
        >
          Start Session →
        </span>
      </div>
    </Link>
  );
}

function RolePlayGrid({ modes }: { modes: readonly RolePlayMode[] }) {
  const featured = modes.find((m) => m.featured);
  const rest = modes.filter((m) => !m.featured);
  return (
    <div>
      {featured && <RolePlayFeatured mode={featured} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {rest.map((mode) => {
          const diff = DIFF[mode.difficulty];
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className="group block rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-200"
              style={{ borderColor: mode.color.border }}
            >
              {/* Colored band */}
              <div
                className="relative px-4 py-4 overflow-hidden"
                style={{ background: mode.color.bg }}
              >
                <div className="absolute right-[-14px] top-[-14px] w-16 h-16 rounded-full"
                  style={{ background: mode.color.text, opacity: 0.1 }} />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{mode.emoji}</span>
                    <div>
                      <h3 className="font-extrabold text-sm leading-tight" style={{ color: mode.color.text }}>
                        {mode.title}
                      </h3>
                      <span className="text-[10px] font-medium" style={{ color: mode.color.text, opacity: 0.6 }}>
                        ~{mode.estimatedMin} min
                      </span>
                    </div>
                  </div>
                  {diff && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: diff.bg, color: diff.text }}>
                      {mode.difficulty}
                    </span>
                  )}
                </div>
              </div>
              {/* White body */}
              <div className="bg-white px-4 py-3.5 flex items-end justify-between gap-3">
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{mode.description}</p>
                <span
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all group-hover:scale-105"
                  style={{ background: mode.color.bg, color: mode.color.text, border: `1px solid ${mode.color.border}` }}
                >
                  Start →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-5xl mx-auto">

        <ActiveSessionBanner />

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: BRAND.primary }}>
                Practice Hub
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Word games · AI roleplay · Test prep — all in one place
              </p>
            </div>
          </div>
          <PracticeStatsBanner />
        </div>

        {/* Daily challenge */}
        <DailyStrip />

        {/* Sections */}
        <div className="space-y-14">

          {/* ── Word Games ─────────────────────────────────────────────── */}
          <section>
            <SectionHeader
              theme={SECTIONS.wordGames}
              title="Word Games"
              subtitle="Sharpen vocabulary &amp; recall with gamified challenges"
              seeAllHref="/practice/leaderboard"
              seeAllLabel="Leaderboard"
              count={WORD_GAMES.length}
            />
            <QuickPlayStrip />
            <WordGamesSection games={WORD_GAMES} />
          </section>

          {/* ── AI Roleplay ────────────────────────────────────────────── */}
          <section>
            <SectionHeader
              theme={SECTIONS.roleplay}
              title="AI Roleplay"
              subtitle="Real conversations with an AI coach — scored &amp; reviewed"
              seeAllHref="/practice/roleplay"
              seeAllLabel="All modes"
              count={ROLEPLAY_MODES.length}
            />
            <RolePlayGrid modes={ROLEPLAY_MODES} />
          </section>

          {/* ── Test Prep ──────────────────────────────────────────────── */}
          <section>
            <SectionHeader
              theme={SECTIONS.testPrep}
              title="Test Prep"
              subtitle="Mock exams &amp; speaking tasks for major English proficiency tests"
              seeAllHref="/practice/test-prep"
              seeAllLabel="All exams"
            />
            <TestPrepChips colorMap={TESTPREP_COLORS} />

            {/* Vocabulary Tracker card */}
            <Link
              href="/practice/vocab-list"
              className="group mt-4 flex items-center justify-between gap-4 rounded-2xl px-5 py-4 hover:shadow-md transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                border: '1.5px solid #93c5fd',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid #93c5fd' }}
                >
                  📖
                </div>
                <div>
                  <p className="font-extrabold text-sm leading-tight" style={{ color: '#1e40af' }}>
                    Vocabulary Tracker
                  </p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: '#1d4ed8', opacity: 0.7 }}>
                    150 academic words for IELTS, TOEFL &amp; more — track what you know
                  </p>
                </div>
              </div>
              <span
                className="flex-shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all group-hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.6)', color: '#1e40af', border: '1px solid #93c5fd' }}
              >
                Open →
              </span>
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
