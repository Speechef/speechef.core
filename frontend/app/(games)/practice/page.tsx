'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ActiveSessionBanner from './ActiveSessionBanner';
import { type GameConfig } from './WordGamesSection';
import WordGamesHero from './WordGamesHero';
import AIToolsHero, { type ToolConfig } from './AIToolsHero';
import TestPrepHero, { type ExamConfig } from './TestPrepHero';
import AIRoleplayHero, { type RoleplayConfig } from './AIRoleplayHero';
import DailyStrip from './DailyStrip';
import PracticeHero from './PracticeHero';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

type SectionTab = 'all' | 'games' | 'roleplay' | 'testprep' | 'vocab' | 'tools';

const SECTION_TABS: { id: SectionTab; label: string; emoji: string; desc: string }[] = [
  { id: 'all',      label: 'All',        emoji: '✨', desc: 'Everything' },
  { id: 'games',    label: 'Word Games', emoji: '🎮', desc: '6 quick drills' },
  { id: 'roleplay', label: 'AI Roleplay',emoji: '🎭', desc: '5 conversations' },
  { id: 'testprep', label: 'Test Prep',  emoji: '📝', desc: 'IELTS, TOEFL & more' },
  { id: 'vocab',    label: 'Vocabulary', emoji: '📚', desc: '550+ words' },
  { id: 'tools',    label: 'AI Tools',   emoji: '🤖', desc: 'Writing & CV' },
];


// ─── Service simulations ───────────────────────────────────────────────────────
const ROLEPLAY_ITEMS: RoleplayConfig[] = [
  {
    href: '/practice/roleplay/job_interview',
    title: 'Job Interview',
    description: "Step into service — nail tough interview questions with a real-time AI interviewer.",
    emoji: '💼', badge: "Chef's Special", difficulty: 'Hard', estimatedMin: 10,
    color: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  },
  {
    href: '/practice/roleplay/presentation',
    title: 'Presentation Pitch',
    description: 'Plate your pitch to an AI audience and handle follow-up questions.',
    emoji: '🎤', badge: null, difficulty: 'Medium', estimatedMin: 8,
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/roleplay/debate',
    title: 'Debate',
    description: 'Season your argumentation skills against a challenging AI debater.',
    emoji: '🗣️', badge: null, difficulty: 'Hard', estimatedMin: 12,
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
  {
    href: '/practice/roleplay/small_talk',
    title: 'Small Talk',
    description: 'Simmer through natural English in everyday social and networking scenarios.',
    emoji: '💬', badge: null, difficulty: 'Easy', estimatedMin: 5,
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
  {
    href: '/practice/interview',
    title: 'Interview Simulation',
    description: 'Text-based mock interviews — behavioral, technical, HR & mixed, with per-answer scoring.',
    emoji: '🎯', badge: 'AI Sous Chef', difficulty: 'Medium', estimatedMin: 15,
    color: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  },
];

// ─── Kitchen drills ────────────────────────────────────────────────────────────
const WORD_GAMES: GameConfig[] = [
  {
    href: '/practice/vocabulary-blitz', title: 'Vocabulary Blitz',
    emoji: '⚡', badge: 'Sizzling', gameKey: 'blitz',
    description: 'Fire through as many vocabulary drills as possible in 60 seconds.',
    color: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  },
  {
    href: '/practice/guess-the-word', title: 'Guess the Word',
    emoji: '🧠', badge: null, gameKey: 'guess',
    description: 'Identify the correct meaning for a mystery ingredient — the word.',
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/memory-match', title: 'Memory Match',
    emoji: '🃏', badge: null, gameKey: 'memory',
    description: 'Flip cards to pair words with their meanings — mise en place style.',
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
  {
    href: '/practice/word-scramble', title: 'Word Scramble',
    emoji: '🔤', badge: null, gameKey: 'scramble',
    description: "Unscramble the letters to reveal the chef's secret ingredient.",
    color: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  },
  {
    href: '/practice/sentence-builder', title: 'Sentence Builder',
    emoji: '✍️', badge: null, gameKey: 'sentence',
    description: 'Plate vocabulary words into sentences — graded by your AI sous chef.',
    color: { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  },
  {
    href: '/practice/pronunciation-challenge', title: 'Pronunciation Challenge',
    emoji: '🎙️', badge: 'Fresh', gameKey: 'pronunciation',
    description: 'Read phrases aloud and get real-time feedback from your AI sous chef.',
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
];

// ─── Chef's toolkit ────────────────────────────────────────────────────────────
const AI_TOOLS: ToolConfig[] = [
  {
    href: '/practice/writing-coach',
    emoji: '✍️', title: 'AI Writing Coach',
    description: 'Get grammar, vocabulary and structure feedback on your written work — from your AI sous chef.',
    badge: 'GPT-4o',
    color: { bg: '#fdf4ff', text: '#7c3aed', border: '#e9d5ff' },
  },
  {
    href: '/practice/resume-analyzer',
    emoji: '📄', title: 'Resume Analyzer',
    description: 'ATS compatibility score, phrase improvements and keyword suggestions — plate your best self.',
    badge: 'GPT-4o',
    color: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  },
];

// ─── Chef's exam prep ──────────────────────────────────────────────────────────
const TEST_PREP_EXAMS: ExamConfig[] = [
  {
    href: '/practice/test-prep/ielts-academic',
    emoji: '🇬🇧', title: 'IELTS Academic',
    description: "Earn your stripes — listening, reading, writing and speaking tasks for IELTS mastery.",
    badge: "Chef's Pick",
    color: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  },
  {
    href: '/practice/test-prep/toefl-ibt',
    emoji: '🇺🇸', title: 'TOEFL iBT',
    description: 'Build skills for TOEFL iBT with integrated speaking and academic writing practice.',
    badge: null,
    color: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  },
  {
    href: '/practice/test-prep/pte-academic',
    emoji: '🌏', title: 'PTE Academic',
    description: 'Computer-based PTE preparation with AI-scored speaking and writing tasks.',
    badge: null,
    color: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  },
  {
    href: '/practice/test-prep/oet',
    emoji: '🏥', title: 'OET',
    description: 'Occupational English Test — medical communication scenarios for healthcare professionals.',
    badge: null,
    color: { bg: '#fef3c7', text: '#78350f', border: '#fcd34d' },
  },
  {
    href: '/practice/test-prep/celpip',
    emoji: '🍁', title: 'CELPIP',
    description: 'Canadian English Language Proficiency Index Program — listening and reading practice.',
    badge: null,
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
  },
];



interface GameSession { id: number; score: number; played_at: string; }

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const { isLoggedIn } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const tabBarRef  = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<SectionTab>('all');

  function switchTab(tab: SectionTab) {
    setActiveTab(tab);
    tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['practice-stats-banner'],
    enabled: isLoggedIn,
    staleTime: 0,
    queryFn: () => api.get('/practice/sessions/?limit=200').then((r) => r.data).catch(() => []),
  });

  const totalGames = sessions.length;
  const bestScore  = totalGames > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const playedDays = new Set(sessions.map((s) => { const d = new Date(s.played_at); d.setHours(0,0,0,0); return d.getTime(); }));
  let streak = 0;
  const cursor = new Date(today);
  while (playedDays.has(cursor.getTime())) { streak++; cursor.setDate(cursor.getDate() - 1); }

  return (
    <>
      {/* ── Hero ── */}
      <PracticeHero
        onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
        isLoggedIn={isLoggedIn}
        totalGames={totalGames}
        bestScore={bestScore}
        streak={streak}
      />

      <div ref={contentRef} className="min-h-screen" style={{ background: '#f4f6fb' }}>

        {/* ── Sticky category tab bar ─────────────────────────────────────── */}
        <div ref={tabBarRef} className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2" style={{ scrollbarWidth: 'none' }}>
              {SECTION_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0"
                    style={isActive
                      ? { background: '#141c52', color: '#fff' }
                      : { color: '#6b7280', background: 'transparent' }
                    }
                  >
                    <span className="text-base leading-none">{tab.emoji}</span>
                    {tab.label}
                    {tab.id !== 'all' && (
                      <span className="text-[10px] font-medium opacity-60 hidden sm:inline">{tab.desc}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="py-8 px-4">
          <div className="max-w-5xl mx-auto">

            <ActiveSessionBanner />

            {/* Daily challenge — always visible */}
            <DailyStrip />

            {/* ── "Not sure where to start?" spotlight (first-time users, All tab) ── */}
            {activeTab === 'all' && totalGames === 0 && (
              <div className="mb-10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                style={{ background: 'linear-gradient(135deg,#141c52 0%,#1e2d78 100%)' }}>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>New here?</p>
                  <p className="text-white font-extrabold text-lg leading-tight">Not sure where to start?</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Pick one of these — each takes under 5 minutes.</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {[
                    { href: '/practice/daily-challenge',    emoji: '🔥', label: 'Daily Challenge',    sub: '2 min · Free' },
                    { href: '/practice/vocabulary-blitz',   emoji: '⚡', label: 'Vocabulary Blitz',   sub: '1 min · Games' },
                    { href: '/practice/roleplay/small_talk',emoji: '💬', label: 'Small Talk',         sub: '5 min · Roleplay' },
                  ].map(({ href, emoji, label, sub }) => (
                    <Link key={href} href={href}
                      className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-center transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', minWidth: 100 }}>
                      <span className="text-2xl">{emoji}</span>
                      <p className="text-xs font-bold text-white leading-tight">{label}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{sub}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Sections — filtered by active tab ─────────────────────────── */}
            <div className="space-y-14">

              {(activeTab === 'all' || activeTab === 'games') && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-1">
                      <span />
                      <button onClick={() => switchTab('games')}
                        className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                        See all Word Games →
                      </button>
                    </div>
                  )}
                  <WordGamesHero games={WORD_GAMES} />
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'roleplay') && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-1">
                      <span />
                      <button onClick={() => switchTab('roleplay')}
                        className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                        See all Roleplay modes →
                      </button>
                    </div>
                  )}
                  <AIRoleplayHero modes={ROLEPLAY_ITEMS} />
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'testprep') && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-1">
                      <span />
                      <button onClick={() => switchTab('testprep')}
                        className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                        See all Test Prep →
                      </button>
                    </div>
                  )}
                  <TestPrepHero exams={TEST_PREP_EXAMS} />
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'vocab') && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-1">
                      <span />
                      <button onClick={() => switchTab('vocab')}
                        className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                        See Vocabulary Hub →
                      </button>
                    </div>
                  )}
                  <div className="rounded-3xl overflow-hidden border border-gray-100" style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                      <div className="p-8 flex flex-col justify-center" style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)' }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 self-start"
                          style={{ background: '#1e40af', color: 'white' }}>
                          📚 Your Pantry
                        </div>
                        <h2 className="text-2xl font-black mb-2" style={{ color: '#141c52' }}>Vocabulary Hub</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          Track, save and master every word in your English arsenal — from academic lists to your personal collection.
                        </p>
                      </div>
                      <div className="p-6 flex flex-col gap-3 justify-center">
                        <Link href="/practice/vocab-list"
                          className="flex items-start gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-sm"
                          style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                          <span className="text-3xl leading-none">📖</span>
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#1e40af' }}>Academic Vocabulary Tracker</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">550+ academic words for IELTS, TOEFL & more — track your progress word by word</p>
                          </div>
                        </Link>
                        <Link href="/practice/saved-words"
                          className="flex items-start gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-sm"
                          style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                          <span className="text-3xl leading-none">🔖</span>
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#166534' }}>My Saved Words</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">Your personal word collection — save any word you want to master</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'tools') && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-1">
                      <span />
                      <button onClick={() => switchTab('tools')}
                        className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                        See all AI Tools →
                      </button>
                    </div>
                  )}
                  <AIToolsHero tools={AI_TOOLS} />
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
