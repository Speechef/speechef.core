import Link from 'next/link';
import ActiveSessionBanner from './ActiveSessionBanner';
import PracticeStatsBanner from './PracticeStatsBanner';
import WordGamesSection, { type GameConfig } from './WordGamesSection';
import TestPrepChips from './TestPrepChips';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Change these to retheme the entire practice hub at once.
const BRAND = {
  primary:  '#141c52',
  gradient: 'linear-gradient(to right, #FADB43, #fe9940)',
} as const;

// ─── Section accent colors ────────────────────────────────────────────────────
// Each section gets its own color chip in the section header.
// Add or reorder sections by changing the entries here.
const SECTION_META = {
  roleplay:  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe', emoji: '🎭' },
  wordGames: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', emoji: '🎮' },
  testPrep:  { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', emoji: '📝' },
} as const;

// ─── Difficulty badge styles ──────────────────────────────────────────────────
const DIFF_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  Easy:   { bg: '#dcfce7', text: '#166534', icon: '🟢' },
  Medium: { bg: '#fef9c3', text: '#92400e', icon: '🟡' },
  Hard:   { bg: '#fee2e2', text: '#991b1b', icon: '🔴' },
};

// ─── Role play mode definitions ───────────────────────────────────────────────
// featured: true → full-width hero card; false → compact grid card.
// Change any field here (color, difficulty, estimatedMin, featured) to reconfigure instantly.
const ROLEPLAY_MODES = [
  {
    href:         '/practice/roleplay/job_interview',
    title:        'Job Interview',
    description:  'Practice answering interview questions with an AI interviewer.',
    emoji:        '💼',
    difficulty:   'Hard',
    estimatedMin: 10,
    featured:     true,
    color:        { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  },
  {
    href:         '/practice/roleplay/presentation',
    title:        'Presentation Pitch',
    description:  'Deliver your pitch to an AI audience and handle follow-up questions.',
    emoji:        '🎤',
    difficulty:   'Medium',
    estimatedMin: 8,
    featured:     false,
    color:        { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href:         '/practice/roleplay/debate',
    title:        'Debate',
    description:  'Sharpen your argumentation against an AI debater.',
    emoji:        '🗣️',
    difficulty:   'Hard',
    estimatedMin: 12,
    featured:     false,
    color:        { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
  {
    href:         '/practice/roleplay/small_talk',
    title:        'Small Talk',
    description:  'Practice natural English conversation in everyday scenarios.',
    emoji:        '💬',
    difficulty:   'Easy',
    estimatedMin: 5,
    featured:     false,
    color:        { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
] as const;

// ─── Word game definitions ────────────────────────────────────────────────────
// Passed to WordGamesSection as props — component renders whatever it receives.
const WORD_GAMES: GameConfig[] = [
  {
    href: '/practice/vocabulary-blitz', title: 'Vocabulary Blitz',
    emoji: '⚡', badge: 'New', gameKey: 'blitz',
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

// ─── Test prep color map ──────────────────────────────────────────────────────
// Passed to TestPrepChips as props — override any exam's color by changing here.
const TESTPREP_COLORS: Record<string, { bg: string; text: string }> = {
  ielts:  { bg: '#dbeafe', text: '#1e40af' },
  toefl:  { bg: '#fce7f3', text: '#9d174d' },
  pte:    { bg: '#dcfce7', text: '#166534' },
  oet:    { bg: '#fef3c7', text: '#78350f' },
  celpip: { bg: '#ede9fe', text: '#6d28d9' },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
type SectionMeta = { bg: string; text: string; border: string; emoji: string };

function PracticeSection({
  meta,
  title,
  subtitle,
  seeAllHref,
  seeAllLabel,
  children,
}: {
  meta: SectionMeta;
  title: string;
  subtitle: string;
  seeAllHref: string;
  seeAllLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          {/* Colored accent chip */}
          <span
            className="flex items-center justify-center w-9 h-9 rounded-xl text-lg flex-shrink-0"
            style={{ background: meta.bg, border: `1.5px solid ${meta.border}` }}
          >
            {meta.emoji}
          </span>
          <div>
            <h2 className="text-xl font-bold leading-tight" style={{ color: BRAND.primary }}>
              {title}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
          </div>
        </div>
        <Link
          href={seeAllHref}
          className="shrink-0 text-sm font-medium hover:underline mt-1"
          style={{ color: BRAND.primary }}
        >
          {seeAllLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

// ─── Role play grid ───────────────────────────────────────────────────────────
type RolePlayMode = (typeof ROLEPLAY_MODES)[number];

function RolePlayGrid({ modes }: { modes: readonly RolePlayMode[] }) {
  const featured = modes.find((m) => m.featured);
  const rest = modes.filter((m) => !m.featured);

  return (
    <div className="space-y-4">
      {/* Featured (hero) card */}
      {featured && (
        <Link
          href={featured.href}
          className="block rounded-2xl border overflow-hidden hover:shadow-lg transition-all group"
          style={{ borderColor: featured.color.border }}
        >
          {/* Colored header band */}
          <div
            className="relative px-6 py-5 overflow-hidden"
            style={{ background: featured.color.bg }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute rounded-full"
              style={{
                background: featured.color.text,
                opacity: 0.12,
                width: 120,
                height: 120,
                top: -40,
                right: -30,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                background: featured.color.text,
                opacity: 0.08,
                width: 80,
                height: 80,
                bottom: -20,
                right: 80,
              }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{featured.emoji}</span>
                <div>
                  {/* Featured chip */}
                  <span
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}
                  >
                    ⭐ Featured
                  </span>
                  <h3 className="text-xl font-bold leading-tight" style={{ color: featured.color.text }}>
                    {featured.title}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {/* Difficulty */}
                {DIFF_STYLE[featured.difficulty] && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: DIFF_STYLE[featured.difficulty].bg,
                      color: DIFF_STYLE[featured.difficulty].text,
                    }}
                  >
                    {DIFF_STYLE[featured.difficulty].icon} {featured.difficulty}
                  </span>
                )}
                {/* Time */}
                <span className="text-xs text-gray-500">~{featured.estimatedMin} min</span>
              </div>
            </div>
          </div>
          {/* White body */}
          <div className="bg-white px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-gray-500 text-sm leading-relaxed">{featured.description}</p>
            <span
              className="shrink-0 text-sm font-bold px-4 py-2 rounded-full transition-opacity group-hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Start →
            </span>
          </div>
        </Link>
      )}

      {/* Remaining cards grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rest.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="block rounded-2xl border overflow-hidden hover:shadow-md transition-all"
              style={{ borderColor: mode.color.border }}
            >
              {/* Colored header band */}
              <div
                className="relative px-4 py-3 overflow-hidden"
                style={{ background: mode.color.bg }}
              >
                {/* Decorative blob */}
                <div
                  className="absolute rounded-full"
                  style={{
                    background: mode.color.text,
                    opacity: 0.12,
                    width: 56,
                    height: 56,
                    top: -18,
                    right: -10,
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-2xl">{mode.emoji}</span>
                  {DIFF_STYLE[mode.difficulty] && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: DIFF_STYLE[mode.difficulty].bg,
                        color: DIFF_STYLE[mode.difficulty].text,
                      }}
                    >
                      {DIFF_STYLE[mode.difficulty].icon} {mode.difficulty}
                    </span>
                  )}
                </div>
              </div>
              {/* White body */}
              <div className="bg-white px-4 py-3">
                <h3 className="font-bold text-sm mb-1" style={{ color: BRAND.primary }}>
                  {mode.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-2">{mode.description}</p>
                <span className="text-[10px] text-gray-300">~{mode.estimatedMin} min</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <ActiveSessionBanner />

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>Practice</h1>
            <a
              href="/practice/daily-challenge"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              🔥 Daily Challenge
            </a>
          </div>
          <p className="text-gray-500 mt-1">Games, AI role play, and test prep — all in one place.</p>
          <PracticeStatsBanner />
        </div>

        {/* Sections */}
        <div className="space-y-12">

          <PracticeSection
            meta={SECTION_META.roleplay}
            title="AI Role Play"
            subtitle="Real conversations with an AI coach — scored and reviewed."
            seeAllHref="/practice/roleplay"
            seeAllLabel="All modes"
          >
            <RolePlayGrid modes={ROLEPLAY_MODES} />
          </PracticeSection>

          <PracticeSection
            meta={SECTION_META.wordGames}
            title="Word Games"
            subtitle="Sharpen vocabulary and recall with gamified challenges."
            seeAllHref="/practice/leaderboard"
            seeAllLabel="Leaderboard"
          >
            <WordGamesSection games={WORD_GAMES} />
          </PracticeSection>

          <PracticeSection
            meta={SECTION_META.testPrep}
            title="Test Prep"
            subtitle="Mock exams and speaking tasks for major English proficiency tests."
            seeAllHref="/practice/test-prep"
            seeAllLabel="All exams"
          >
            <TestPrepChips colorMap={TESTPREP_COLORS} />
          </PracticeSection>

        </div>
      </div>
    </div>
  );
}
