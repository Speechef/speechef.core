'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const STYLES = `
  @keyframes wgOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(-44px,34px) scale(1.1); }
    66%      { transform:translate(28px,-26px) scale(0.93); }
  }
  @keyframes wgRise {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes wgChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes wgCta {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  .wg-orb-a { animation:wgOrbDrift 14s ease-in-out infinite; }
  .wg-orb-b { animation:wgOrbDrift 19s ease-in-out infinite reverse; }
  .wg-orb-c { animation:wgOrbDrift 11s ease-in-out infinite 3s; }
  .wg-rise-1 { animation:wgRise .85s ease both; }
  .wg-rise-2 { animation:wgRise .85s .18s ease both; }
  .wg-rise-3 { animation:wgRise .85s .34s ease both; }
  .wg-rise-4 { animation:wgRise .85s .52s ease both; }
  .wg-chev   { animation:wgChev 1.9s ease-in-out infinite; }
  .wg-cta    { animation:wgCta 3s ease-in-out infinite; }
`;


const WORD_GAMES = [
  {
    href: '/practice/vocabulary-blitz', emoji: '⚡', title: 'Vocabulary Blitz',
    badge: 'Hot', difficulty: 'Medium',
    description: 'Answer as many word questions as possible in 60 seconds. Race against the clock.',
    color: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  },
  {
    href: '/practice/guess-the-word', emoji: '🧠', title: 'Guess the Word',
    badge: null, difficulty: 'Easy',
    description: 'Select the correct meaning for a random word. Test the depth of your vocabulary.',
    color: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  },
  {
    href: '/practice/memory-match', emoji: '🃏', title: 'Memory Match',
    badge: null, difficulty: 'Easy',
    description: 'Flip cards to match words with their meanings. Train your memory and recall speed.',
    color: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  },
  {
    href: '/practice/word-scramble', emoji: '🔤', title: 'Word Scramble',
    badge: null, difficulty: 'Medium',
    description: 'Unscramble the letters to reveal the hidden word. Speed and pattern-recognition count.',
    color: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  },
  {
    href: '/practice/sentence-builder', emoji: '✍️', title: 'Sentence Builder',
    badge: null, difficulty: 'Hard',
    description: 'Use vocabulary words correctly in your own sentences — each one graded by AI in real time.',
    color: { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  },
  {
    href: '/practice/pronunciation-challenge', emoji: '🎙️', title: 'Pronunciation Challenge',
    badge: 'New', difficulty: 'Hard',
    description: 'Read phrases aloud and get instant AI feedback on your accuracy and clarity.',
    color: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
];

const DIFF_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Easy:   { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  Medium: { bg: '#fef9c3', text: '#92400e', dot: '#f59e0b' },
  Hard:   { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

function WordGamesHero({ onScrollDown }: { onScrollDown: () => void }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Ease-in-out cubic
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  // Background: wipes rightward — right inset grows from 0% → 110%
  const wipe = e * 110;

  const textOpacity = Math.max(0, 1 - e * 1.9);
  const textScale   = 1 - e * 0.07;
  const chevOpacity = Math.max(0, 1 - e * 3.5);

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Background — right-to-left wipe (right inset grows) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
          clipPath: `inset(0 ${wipe}% 0 0)`,
        }}
      />

      {/* Orbs */}
      <div className="wg-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 520, height: 520, top: -140, left: -110,
          background: 'radial-gradient(circle,rgba(250,219,67,.13) 0%,transparent 68%)',
          clipPath: `inset(0 ${wipe}% 0 0)` }} />
      <div className="wg-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 400, height: 400, bottom: -90, right: -100,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `inset(0 ${wipe}% 0 0)` }} />
      <div className="wg-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, top: '32%', right: '16%',
          background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 68%)',
          clipPath: `inset(0 ${wipe}% 0 0)` }} />

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: Math.max(0, 0.035 - e * 0.035),
          clipPath: `inset(0 ${wipe}% 0 0)`,
        }} />


      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
        style={{ opacity: textOpacity, transform: `scale(${textScale})` }}
      >
        {/* Label */}
        <div className="wg-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
          Word Games Hub
        </div>

        {/* Headline */}
        <h1 className="wg-rise-2 font-black leading-[1.02] mb-4"
          style={{ fontSize: 'clamp(2.8rem,8vw,5.5rem)' }}>
          <span style={{ color: '#fff' }}>Play Your Way</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            to Fluency.
          </span>
        </h1>

        {/* Sub */}
        <p className="wg-rise-3 text-base font-medium mb-10 max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.48)' }}>
          6 word games to sharpen vocabulary, grammar &amp; speaking — in minutes a day.
        </p>

        {/* CTAs */}
        <div className="wg-rise-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onScrollDown}
            className="wg-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Choose a Game ↓
          </button>
          <Link
            href="/practice/vocabulary-blitz"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
          >
            ⚡ Quick Blitz →
          </Link>
        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="wg-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
        style={{ opacity: chevOpacity }}
        aria-label="Scroll down"
      >
        <span className="text-[0.58rem] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.32)' }}>Scroll</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Gradient fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom,transparent,#f4f6fb)' }} />
    </div>
  );
}

export default function WordGamesPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <WordGamesHero
        onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <div ref={contentRef} className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
        <div className="max-w-4xl mx-auto">

          {/* Section header */}
          <div className="mb-8">
            <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
              ← Practice Hub
            </Link>
            <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#fe9940' }}>
              Word Games
            </p>
            <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.primary }}>
              Choose Your Game
            </h2>
            <p className="text-gray-500 text-sm">
              From quick 60-second blitzes to AI-graded sentence challenges — pick your level and play.
            </p>
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WORD_GAMES.map((game) => {
              const diff = DIFF_STYLES[game.difficulty];
              return (
                <Link
                  key={game.href}
                  href={game.href}
                  className="group rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ borderColor: game.color.border }}
                >
                  {/* Colored header */}
                  <div className="relative overflow-hidden p-5" style={{ background: game.color.bg }}>
                    <div className="absolute top-[-16px] right-[-16px] w-16 h-16 rounded-full"
                      style={{ background: game.color.text, opacity: 0.1 }} />
                    <div className="relative flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{game.emoji}</span>
                          {game.badge && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                              style={{ background: BRAND.gradient, color: BRAND.primary }}>
                              {game.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base leading-tight" style={{ color: game.color.text }}>
                          {game.title}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-1"
                        style={{ background: diff.bg, color: diff.text }}>
                        <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 -mb-px"
                          style={{ background: diff.dot }} />
                        {game.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* White body */}
                  <div className="bg-white p-5">
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Tap to play</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        style={{ color: game.color.text }} fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/practice"
              className="text-sm font-medium hover:underline"
              style={{ color: BRAND.primary }}>
              ← Back to Practice Hub
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
