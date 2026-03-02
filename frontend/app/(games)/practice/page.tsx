'use client';

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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


// ─── Roleplay modes ────────────────────────────────────────────────────────────
const ROLEPLAY_ITEMS: RoleplayConfig[] = [
  {
    href: '/practice/roleplay/job_interview',
    title: 'Job Interview',
    description: 'Practice answering tough interview questions with a real-time AI interviewer.',
    emoji: '💼', badge: 'Featured', difficulty: 'Hard', estimatedMin: 10,
    color: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  },
  {
    href: '/practice/roleplay/presentation',
    title: 'Presentation Pitch',
    description: 'Deliver your pitch to an AI audience and handle follow-up questions.',
    emoji: '🎤', badge: null, difficulty: 'Medium', estimatedMin: 8,
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/roleplay/debate',
    title: 'Debate',
    description: 'Sharpen your argumentation skills against a challenging AI debater.',
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
    emoji: '🎯', badge: 'AI', difficulty: 'Medium', estimatedMin: 15,
    color: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  },
];

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

// ─── AI Tools ──────────────────────────────────────────────────────────────────
const AI_TOOLS: ToolConfig[] = [
  {
    href: '/practice/writing-coach',
    emoji: '✍️', title: 'AI Writing Coach',
    description: 'Get grammar, vocabulary and structure feedback on your essays and emails.',
    badge: 'GPT-4o',
    color: { bg: '#fdf4ff', text: '#7c3aed', border: '#e9d5ff' },
  },
  {
    href: '/practice/resume-analyzer',
    emoji: '📄', title: 'Resume Analyzer',
    description: 'ATS compatibility score, phrase improvements and keyword suggestions.',
    badge: 'GPT-4o',
    color: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  },
  {
    href: '/practice/interview',
    emoji: '🎯', title: 'Interview Simulation',
    description: 'Text-based mock interviews with per-answer scoring and final report.',
    badge: 'New',
    color: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  },
  {
    href: '/practice/saved-words',
    emoji: '🔖', title: 'Saved Words',
    description: 'Build your personal vocabulary list — save and review any word.',
    badge: null,
    color: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  },
];

// ─── Test prep exams ───────────────────────────────────────────────────────────
const TEST_PREP_EXAMS: ExamConfig[] = [
  {
    href: '/practice/test-prep/ielts-academic',
    emoji: '🇬🇧', title: 'IELTS Academic',
    description: 'International English Language Testing System — listening, reading, writing and speaking tasks.',
    badge: 'Popular',
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
  {
    href: '/practice/vocab-list',
    emoji: '📖', title: 'Vocabulary Tracker',
    description: '150 academic words for IELTS, TOEFL & more — track and review what you know.',
    badge: null,
    color: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  },
];



interface GameSession { id: number; score: number; played_at: string; }

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const { isLoggedIn } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);

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

          {/* Sections */}
          <div className="space-y-14">

            <section>
              <WordGamesHero games={WORD_GAMES} />
            </section>

            <section>
              <AIRoleplayHero modes={ROLEPLAY_ITEMS} />
            </section>

            <section>
              <TestPrepHero exams={TEST_PREP_EXAMS} />
            </section>

            <section>
              <AIToolsHero tools={AI_TOOLS} />
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
