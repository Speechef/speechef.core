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


// ─── Service simulations ───────────────────────────────────────────────────────
const ROLEPLAY_ITEMS: RoleplayConfig[] = [
  {
    href: '/practice/roleplay/job_interview',
    title: 'Job Interview',
    description: "Step into service — nail tough interview questions with a real-time AI interviewer.",
    emoji: '💼', badge: "Popular", difficulty: 'Hard', estimatedMin: 10,
    color: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  },
  {
    href: '/practice/roleplay/presentation',
    title: 'Presentation Pitch',
    description: 'Present your pitch to an AI audience and handle follow-up questions.',
    emoji: '🎤', badge: null, difficulty: 'Medium', estimatedMin: 8,
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/roleplay/debate',
    title: 'Debate',
    description: 'Strengthen your argumentation skills against a challenging AI debater.',
    emoji: '🗣️', badge: null, difficulty: 'Hard', estimatedMin: 12,
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
  {
    href: '/practice/roleplay/small_talk',
    title: 'Small Talk',
    description: 'Practice natural English in everyday social and networking scenarios.',
    emoji: '💬', badge: null, difficulty: 'Easy', estimatedMin: 5,
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
  {
    href: '/practice/interview',
    title: 'Interview Simulation',
    description: 'Text-based mock interviews — behavioral, technical, HR & mixed, with per-answer scoring.',
    emoji: '🎯', badge: 'AI Scored', difficulty: 'Medium', estimatedMin: 15,
    color: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  },
];

// ─── Word games ────────────────────────────────────────────────────────────────
const WORD_GAMES: GameConfig[] = [
  {
    href: '/practice/vocabulary-blitz', title: 'Vocabulary Blitz',
    emoji: '⚡', badge: 'Sizzling', gameKey: 'blitz',
    description: 'Fire through as many vocabulary questions as possible in 60 seconds.',
    color: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  },
  {
    href: '/practice/guess-the-word', title: 'Guess the Word',
    emoji: '🧠', badge: null, gameKey: 'guess',
    description: 'Identify the correct meaning for each word shown.',
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/memory-match', title: 'Memory Match',
    emoji: '🃏', badge: null, gameKey: 'memory',
    description: 'Flip cards to pair words with their meanings — test your recall.',
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
  {
    href: '/practice/word-scramble', title: 'Word Scramble',
    emoji: '🔤', badge: null, gameKey: 'scramble',
    description: "Unscramble the letters to reveal the hidden word.",
    color: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  },
  {
    href: '/practice/sentence-builder', title: 'Sentence Builder',
    emoji: '✍️', badge: null, gameKey: 'sentence',
    description: 'Write sentences using vocabulary words — graded by AI.',
    color: { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  },
  {
    href: '/practice/pronunciation-challenge', title: 'Pronunciation Challenge',
    emoji: '🎙️', badge: 'Fresh', gameKey: 'pronunciation',
    description: 'Read phrases aloud and get real-time AI pronunciation feedback.',
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
];

// ─── AI tools ──────────────────────────────────────────────────────────────────
const AI_TOOLS: ToolConfig[] = [
  {
    href: '/practice/writing-coach',
    emoji: '✍️', title: 'AI Writing Coach',
    description: 'Get grammar, vocabulary and structure feedback on your written work — powered by GPT-4o.',
    badge: 'GPT-4o',
    color: { bg: '#fdf4ff', text: '#7c3aed', border: '#e9d5ff' },
  },
  {
    href: '/practice/resume-analyzer',
    emoji: '📄', title: 'Resume Analyzer',
    description: 'ATS compatibility score, phrase improvements and keyword suggestions — powered by GPT-4o.',
    badge: 'GPT-4o',
    color: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  },
];

// ─── Exam prep ─────────────────────────────────────────────────────────────────
const TEST_PREP_EXAMS: ExamConfig[] = [
  {
    href: '/practice/test-prep/ielts-academic',
    emoji: '🇬🇧', title: 'IELTS Academic',
    description: "Master listening, reading, writing and speaking with full IELTS practice tasks.",
    badge: "Recommended",
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

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const { isLoggedIn } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [deepOpen, setDeepOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);

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

      <div ref={contentRef} className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
        <div className="max-w-5xl mx-auto">

          <ActiveSessionBanner />

          {/* Daily challenge */}
          <DailyStrip />

          {/* Sections — 3 progressive groups */}
          <div className="space-y-6">

            {/* ── Group 1: Quick (always visible) ── */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Quick · 5 min</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <WordGamesHero games={WORD_GAMES} />
            </section>

            {/* ── Group 2: Deep Practice (collapsible) ── */}
            <section>
              <button
                onClick={() => setDeepOpen((o) => !o)}
                className="w-full flex items-center gap-3 mb-4 group"
              >
                <div className="h-px flex-1 bg-gray-200" />
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-2 transition-colors"
                  style={{ color: deepOpen ? BRAND.primary : '#9ca3af' }}>
                  Deep Practice · 15–20 min
                  <svg className="w-3.5 h-3.5 transition-transform" style={{ transform: deepOpen ? 'rotate(180deg)' : 'none' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </button>
              {deepOpen && (
                <div className="space-y-14">
                  <AIRoleplayHero modes={ROLEPLAY_ITEMS} />
                  {/* Vocabulary Hub */}
                  <div className="rounded-3xl overflow-hidden border border-gray-100" style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                      <div className="p-8 flex flex-col justify-center" style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)' }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 self-start"
                          style={{ background: '#1e40af', color: 'white' }}>
                          📚 Vocabulary
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
                  <AIToolsHero tools={AI_TOOLS} />
                </div>
              )}
              {!deepOpen && (
                <button
                  onClick={() => setDeepOpen(true)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold border border-dashed transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db', color: '#9ca3af' }}
                >
                  Show AI Roleplay, Writing Coach & Vocabulary Hub ↓
                </button>
              )}
            </section>

            {/* ── Group 3: Exam / Career (collapsible) ── */}
            <section>
              <button
                onClick={() => setExamOpen((o) => !o)}
                className="w-full flex items-center gap-3 mb-4 group"
              >
                <div className="h-px flex-1 bg-gray-200" />
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-2 transition-colors"
                  style={{ color: examOpen ? BRAND.primary : '#9ca3af' }}>
                  Exam &amp; Career
                  <svg className="w-3.5 h-3.5 transition-transform" style={{ transform: examOpen ? 'rotate(180deg)' : 'none' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </button>
              {examOpen && (
                <TestPrepHero exams={TEST_PREP_EXAMS} />
              )}
              {!examOpen && (
                <button
                  onClick={() => setExamOpen(true)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold border border-dashed transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db', color: '#9ca3af' }}
                >
                  Show IELTS, TOEFL, PTE, OET & CELPIP prep ↓
                </button>
              )}
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
