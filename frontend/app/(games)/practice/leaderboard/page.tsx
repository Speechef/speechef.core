'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';

// ─── Constants ───────────────────────────────────────────────────────────────

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };
const MEDAL = ['🥇', '🥈', '🥉'];

const GAME_FILTERS = [
  { label: 'All Games',          value: '',             emoji: '🏆' },
  { label: 'Guess the Word',    value: 'guess',        emoji: '🧠' },
  { label: 'Memory Match',      value: 'memory',       emoji: '🃏' },
  { label: 'Word Scramble',     value: 'scramble',     emoji: '🔤' },
  { label: 'Vocabulary Blitz',  value: 'blitz',        emoji: '⚡' },
  { label: 'Sentence Builder',  value: 'sentence',     emoji: '✍️' },
  { label: 'Daily Challenge',   value: 'daily',        emoji: '📅' },
  { label: 'Pronunciation',     value: 'pronunciation',emoji: '🎙️' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  user__username: string;
  total_score: number;
  games_played: number;
}

// ─── ScoreBarChart (SVG) ─────────────────────────────────────────────────────

function ScoreBarChart({
  entries,
  maxScore,
  currentUser,
}: {
  entries: LeaderboardEntry[];
  maxScore: number;
  currentUser: string | undefined;
}) {
  const top = entries.slice(0, 10);
  const BAR_H   = 26;
  const GAP     = 9;
  const LABEL_W = 88;
  const VALUE_W = 38;
  const CHART_W = 280 - LABEL_W - VALUE_W;
  const SVG_H   = top.length * (BAR_H + GAP) + 12;

  return (
    <svg width="100%" viewBox={`0 0 280 ${SVG_H}`} className="overflow-visible">
      {top.map((entry, i) => {
        const isMe  = currentUser === entry.user__username;
        const barW  = maxScore > 0 ? (entry.total_score / maxScore) * CHART_W : 4;
        const y     = 6 + i * (BAR_H + GAP);
        const fill  = isMe     ? '#FADB43'
                    : i === 0  ? '#fe9940'
                    : i < 3    ? '#818cf8'
                    : '#c7d2fe';

        const label = entry.user__username.length > 9
          ? entry.user__username.slice(0, 8) + '…'
          : entry.user__username;

        return (
          <g key={entry.user__username}>
            {/* Name */}
            <text x={LABEL_W - 6} y={y + BAR_H / 2 + 4} textAnchor="end"
              fontSize="11" fill={isMe ? '#141c52' : '#6b7280'}
              fontWeight={isMe ? '700' : '400'}>
              {i < 3 ? `${MEDAL[i]} ` : `${i + 1}. `}{label}
            </text>
            {/* Track */}
            <rect x={LABEL_W} y={y} width={CHART_W} height={BAR_H} rx="5" fill="#f3f4f6" />
            {/* Bar */}
            <rect x={LABEL_W} y={y} width={Math.max(barW, 6)} height={BAR_H} rx="5" fill={fill} />
            {/* Score */}
            <text x={LABEL_W + CHART_W + 6} y={y + BAR_H / 2 + 4}
              fontSize="11" fill="#6b7280" fontWeight="600">
              {entry.total_score.toLocaleString()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── AvgScoreChart ───────────────────────────────────────────────────────────

function AvgScoreChart({
  entries,
  currentUser,
}: {
  entries: LeaderboardEntry[];
  currentUser: string | undefined;
}) {
  const withAvg = entries
    .slice(0, 8)
    .map((e) => ({
      ...e,
      avg: e.games_played > 0 ? Math.round(e.total_score / e.games_played) : 0,
    }))
    .sort((a, b) => b.avg - a.avg);

  const maxAvg = withAvg[0]?.avg || 1;

  return (
    <div className="space-y-2.5">
      {withAvg.map((entry, i) => {
        const isMe = currentUser === entry.user__username;
        const pct  = (entry.avg / maxAvg) * 100;
        return (
          <div key={entry.user__username} className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold truncate text-right flex-shrink-0"
              style={{ width: 72, color: isMe ? BRAND.primary : '#9ca3af' }}
            >
              {entry.user__username}
            </span>
            <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: isMe
                    ? BRAND.gradient
                    : i === 0
                    ? 'linear-gradient(to right,#6366f1,#818cf8)'
                    : 'linear-gradient(to right,#a5b4fc,#818cf8)',
                }}
              />
            </div>
            <span className="text-[10px] font-black flex-shrink-0" style={{ width: 28, textAlign: 'right', color: '#141c52' }}>
              {entry.avg}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── GamesPlayedChart ────────────────────────────────────────────────────────

function GamesPlayedChart({
  entries,
  currentUser,
}: {
  entries: LeaderboardEntry[];
  currentUser: string | undefined;
}) {
  const top = entries
    .slice()
    .sort((a, b) => b.games_played - a.games_played)
    .slice(0, 6);
  const maxG = top[0]?.games_played || 1;

  return (
    <div className="space-y-2.5">
      {top.map((entry, i) => {
        const isMe = currentUser === entry.user__username;
        const pct  = (entry.games_played / maxG) * 100;
        return (
          <div key={entry.user__username} className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold truncate text-right flex-shrink-0"
              style={{ width: 72, color: isMe ? BRAND.primary : '#9ca3af' }}
            >
              {entry.user__username}
            </span>
            <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: isMe
                    ? BRAND.gradient
                    : i === 0
                    ? 'linear-gradient(to right,#22c55e,#16a34a)'
                    : 'linear-gradient(to right,#86efac,#4ade80)',
                }}
              />
            </div>
            <span className="text-[10px] font-black flex-shrink-0" style={{ width: 24, textAlign: 'right', color: '#141c52' }}>
              {entry.games_played}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Podium ──────────────────────────────────────────────────────────────────

const PODIUM_SLOTS = [
  { placeIdx: 1, height: 80,  avatarSize: 48, gradient: 'linear-gradient(160deg,#6366f1,#818cf8)', avatarStyle: { background: '#e0e7ff', color: '#3730a3' } },
  { placeIdx: 0, height: 110, avatarSize: 56, gradient: BRAND.gradient,                            avatarStyle: { background: 'linear-gradient(135deg,#FADB43,#fe9940)', color: '#78350f' } },
  { placeIdx: 2, height: 58,  avatarSize: 42, gradient: 'linear-gradient(160deg,#f59e0b,#d97706)', avatarStyle: { background: '#fef3c7', color: '#92400e' } },
];

function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
  return (
    <div className="flex items-end justify-center gap-2 pt-2">
      {PODIUM_SLOTS.map(({ placeIdx, height, avatarSize, gradient, avatarStyle }) => {
        const entry = top3[placeIdx];
        if (!entry) return null;
        return (
          <div key={placeIdx} className="flex flex-col items-center gap-2 flex-1">
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center font-black shadow-sm flex-shrink-0"
              style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.38, ...avatarStyle }}
            >
              {entry.user__username[0].toUpperCase()}
            </div>
            {/* Name + score */}
            <div className="text-center">
              <p className="text-xs font-extrabold truncate max-w-[80px]" style={{ color: BRAND.primary }}>
                {entry.user__username}
              </p>
              <p className="text-[10px] text-gray-400">{entry.total_score.toLocaleString()} pts</p>
            </div>
            {/* Podium block */}
            <div
              className="w-full rounded-t-xl flex items-center justify-center text-white font-black"
              style={{ height, background: gradient, fontSize: placeIdx === 0 ? 28 : 22 }}
            >
              {MEDAL[placeIdx]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Hero styles & component ─────────────────────────────────────────────────

const LB_STYLES = `
  @keyframes lbOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(-44px,34px) scale(1.1); }
    66%      { transform:translate(28px,-26px) scale(0.93); }
  }
  @keyframes lbRise {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes lbChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes lbCta {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  @keyframes lbCount {
    from { opacity:0; transform:scale(0.6) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .lb-orb-a  { animation:lbOrbDrift 14s ease-in-out infinite; }
  .lb-orb-b  { animation:lbOrbDrift 19s ease-in-out infinite reverse; }
  .lb-orb-c  { animation:lbOrbDrift 11s ease-in-out infinite 3s; }
  .lb-rise-1 { animation:lbRise .85s ease both; }
  .lb-rise-2 { animation:lbRise .85s .18s ease both; }
  .lb-rise-3 { animation:lbRise .85s .34s ease both; }
  .lb-rise-4 { animation:lbRise .85s .52s ease both; }
  .lb-chev   { animation:lbChev 1.9s ease-in-out infinite; }
  .lb-cta    { animation:lbCta 3s ease-in-out infinite; }
  .lb-stat   { animation:lbCount .6s ease both; }
  .lb-stat-1 { animation-delay:.55s; }
  .lb-stat-2 { animation-delay:.72s; }
  .lb-stat-3 { animation-delay:.89s; }
`;

function LeaderboardHero({
  onScrollDown,
  gameLabel,
  playerCount,
  totalGames,
  maxScore,
  hasData,
}: {
  onScrollDown: () => void;
  gameLabel: string;
  playerCount: number;
  totalGames: number;
  maxScore: number;
  hasData: boolean;
}) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const wipe        = e * 110;
  const textOpacity = Math.max(0, 1 - e * 1.9);
  const textScale   = 1 - e * 0.07;
  const chevOpacity = Math.max(0, 1 - e * 3.5);

  const STATS = [
    { value: hasData ? playerCount.toString()         : '—', label: 'Players' },
    { value: hasData ? totalGames.toLocaleString()    : '—', label: 'Games Played' },
    { value: hasData ? maxScore.toLocaleString()      : '—', label: 'Top Score' },
  ];

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: LB_STYLES }} />

      {/* Background — upward curtain wipe */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
          clipPath: `inset(0 0 ${wipe}% 0)`,
        }}
      />

      {/* Orbs */}
      <div className="lb-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 560, height: 560, top: -160, right: -120,
          background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div className="lb-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, bottom: -100, left: -130,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div className="lb-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 300, height: 300, top: '35%', left: '18%',
          background: 'radial-gradient(circle,rgba(167,139,250,.11) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: Math.max(0, 0.035 - e * 0.035),
          clipPath: `inset(0 0 ${wipe}% 0)`,
        }} />

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
        style={{ opacity: textOpacity, transform: `scale(${textScale})` }}
      >
        {/* Eyebrow label */}
        <div className="lb-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
          {gameLabel} Rankings
        </div>

        {/* Headline */}
        <h1 className="lb-rise-2 font-black leading-[1.02] mb-4"
          style={{ fontSize: 'clamp(2.8rem,8vw,5.5rem)' }}>
          <span style={{ color: '#fff' }}>Climb the</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Rankings.
          </span>
        </h1>

        {/* Subhead */}
        <p className="lb-rise-3 text-base font-medium mb-9 max-w-sm mx-auto"
          style={{ color: 'rgba(255,255,255,0.48)' }}>
          Compete and claim your spot at the top.
        </p>

        {/* Live stat row */}
        <div className="lb-rise-3 flex items-center justify-center gap-10 mb-10">
          {STATS.map((s, i) => (
            <div key={s.label} className={`lb-stat lb-stat-${i + 1} text-center`}>
              <p className="text-3xl font-black text-white leading-none">{s.value}</p>
              <p className="text-xs font-semibold mt-1.5 uppercase tracking-wide"
                style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="lb-rise-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onScrollDown}
            className="lb-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            See the Rankings ↓
          </button>
          <Link
            href="/practice/word-games"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
          >
            Play Now →
          </Link>
        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="lb-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
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

// ─── Main content ─────────────────────────────────────────────────────────────

function LeaderboardContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const game         = searchParams.get('game') ?? '';
  const { isLoggedIn } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);

  function setGame(value: string) {
    router.push(value ? `/practice/leaderboard?game=${value}` : '/practice/leaderboard');
  }

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', game],
    queryFn: () =>
      api.get(`/practice/leaderboard/${game ? `?game=${game}` : ''}`).then((r) => r.data),
  });

  const { data: profile } = useQuery<{ username: string }>({
    queryKey: ['profile'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const currentUsername = profile?.username;
  const myEntry = currentUsername ? entries.find((e) => e.user__username === currentUsername) : null;
  const myRank  = currentUsername ? entries.findIndex((e) => e.user__username === currentUsername) + 1 : 0;

  // Derived stats
  const maxScore   = entries[0]?.total_score ?? 0;
  const totalGames = entries.reduce((s, e) => s + e.games_played, 0);
  const avgScore   = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + e.total_score, 0) / entries.length)
    : 0;
  const mostActive = [...entries].sort((a, b) => b.games_played - a.games_played)[0];
  const top3       = entries.slice(0, 3);
  const gameLabel  = GAME_FILTERS.find((f) => f.value === game)?.label ?? 'All Games';

  const topPct = entries.length > 0 && myRank > 0
    ? Math.round((1 - (myRank - 1) / entries.length) * 100)
    : 0;

  const myAvg = myEntry && myEntry.games_played > 0
    ? Math.round(myEntry.total_score / myEntry.games_played)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: '#f4f6fb' }}>

      {/* ── Full-screen hero ── */}
      <LeaderboardHero
        onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
        gameLabel={gameLabel}
        playerCount={entries.length}
        totalGames={totalGames}
        maxScore={maxScore}
        hasData={!isLoading && entries.length > 0}
      />

      <div ref={contentRef} className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Game filter tabs ── */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {GAME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setGame(f.value)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap"
              style={
                game === f.value
                  ? { background: BRAND.gradient, color: BRAND.primary, borderColor: '#FADB43' }
                  : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
              }
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* ── My rank banner ── */}
        {myEntry && myRank > 0 && (
          <div
            className="rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg,#141c52,#1e2d78)',
              boxShadow: '0 4px 24px rgba(20,28,82,0.28)',
            }}
          >
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { label: 'Your Rank',   value: `#${myRank}`,                        dot: true },
                { label: 'Score',       value: myEntry.total_score.toLocaleString() },
                { label: 'Games',       value: myEntry.games_played.toString() },
                { label: 'Avg / Game',  value: myAvg.toString() },
                { label: 'Top',         value: `${topPct}%` },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-5">
                  {i > 0 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.12)' }} />}
                  <div>
                    <div className="flex items-center gap-1.5">
                      {s.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                      <p className="text-xl font-black text-white leading-none">{s.value}</p>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/practice/history"
              className="shrink-0 text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              My History →
            </Link>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && entries.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-5xl mb-3">🏆</p>
            <p className="font-bold text-lg mb-1" style={{ color: BRAND.primary }}>No scores yet</p>
            <p className="text-gray-400 text-sm mb-5">Be the first to play and claim the top spot!</p>
            <Link
              href="/practice"
              className="inline-block px-6 py-2.5 rounded-full text-sm font-bold"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Start Playing →
            </Link>
          </div>
        )}

        {/* ── Full dashboard ── */}
        {!isLoading && entries.length > 0 && (
          <>
            {/* Podium + Score bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Podium */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Top 3 Players
                </p>
                <Podium top3={top3} />
              </div>

              {/* Score bar chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  📊 Score Rankings
                </p>
                <p className="text-[10px] text-gray-400 mb-4">Top 10 total scores</p>
                <ScoreBarChart entries={entries} maxScore={maxScore} currentUser={currentUsername} />
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: '📈', label: 'Avg Score',
                  value: avgScore.toLocaleString(),
                  sub: 'across all players',
                  accent: false,
                },
                {
                  icon: '🎮', label: 'Games Played',
                  value: totalGames.toLocaleString(),
                  sub: 'all-time games',
                  accent: false,
                },
                {
                  icon: '🔥', label: 'Most Active',
                  value: mostActive?.user__username ?? '—',
                  sub: `${mostActive?.games_played ?? 0} games`,
                  accent: false,
                },
                {
                  icon: '⭐', label: 'Top Score',
                  value: maxScore.toLocaleString(),
                  sub: `by ${entries[0]?.user__username ?? '—'}`,
                  accent: true,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border shadow-sm p-4"
                  style={{ borderColor: s.accent ? '#fde68a' : '#f3f4f6' }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-base">{s.icon}</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                  </div>
                  <p className="text-lg font-black leading-none mb-1 truncate" style={{ color: BRAND.primary }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts row + full table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Left: Avg / Game + Activity + Distribution */}
              <div className="space-y-5">

                {/* Avg score per game */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                    ⚡ Avg Score / Game
                  </p>
                  <p className="text-[10px] text-gray-400 mb-4">Efficiency — who scores most per game</p>
                  <AvgScoreChart entries={entries} currentUser={currentUsername} />
                </div>

                {/* Most games played */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                    Most Games Played
                  </p>
                  <p className="text-[10px] text-gray-400 mb-4">Activity leaders</p>
                  <GamesPlayedChart entries={entries} currentUser={currentUsername} />
                </div>

                {/* Score distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Score Tiers
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: 'Elite        (>75%)',      color: '#FADB43', textColor: '#78350f', pctMin: 0.75, pctMax: 1 },
                      { label: 'Advanced     (50–75%)',    color: '#6366f1', textColor: '#fff', pctMin: 0.5, pctMax: 0.75 },
                      { label: 'Intermediate (25–50%)',    color: '#a5b4fc', textColor: '#fff', pctMin: 0.25, pctMax: 0.5 },
                      { label: 'Beginner     (<25%)',      color: '#e5e7eb', textColor: '#6b7280', pctMin: 0, pctMax: 0.25 },
                    ].map((tier) => {
                      const count = entries.filter(
                        (e) => e.total_score > maxScore * tier.pctMin && e.total_score <= maxScore * tier.pctMax,
                      ).length;
                      const pct   = entries.length > 0 ? (count / entries.length) * 100 : 0;
                      return (
                        <div key={tier.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-500">{tier.label}</span>
                            <span className="text-[11px] font-bold" style={{ color: BRAND.primary }}>{count}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: tier.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Full rankings table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Rankings</p>
                  <span className="text-[10px] text-gray-400">{entries.length} players</span>
                </div>

                <div className="overflow-auto flex-1" style={{ maxHeight: 560 }}>
                  <table className="w-full text-sm">
                    <thead
                      className="sticky top-0 z-10"
                      style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
                    >
                      <tr>
                        <th className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 w-8">#</th>
                        <th className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Player</th>
                        <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Score</th>
                        <th className="text-right px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Avg</th>
                        <th className="text-right px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Dishes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => {
                        const isMe    = !!(currentUsername && entry.user__username === currentUsername);
                        const barPct  = maxScore > 0 ? (entry.total_score / maxScore) * 100 : 0;
                        const avg     = entry.games_played > 0
                          ? Math.round(entry.total_score / entry.games_played)
                          : 0;

                        const avatarStyle =
                          i === 0 ? { background: 'linear-gradient(135deg,#FADB43,#fe9940)', color: '#78350f' }
                          : i === 1 ? { background: '#e0e7ff', color: '#3730a3' }
                          : i === 2 ? { background: '#fef3c7', color: '#92400e' }
                          : { background: '#f3f4f6', color: '#6b7280' };

                        const barColor = isMe   ? BRAND.gradient
                          : i === 0 ? 'linear-gradient(to right,#FADB43,#fe9940)'
                          : i < 3   ? 'linear-gradient(to right,#818cf8,#6366f1)'
                          : 'linear-gradient(to right,#c7d2fe,#a5b4fc)';

                        return (
                          <tr
                            key={entry.user__username}
                            className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60"
                            style={isMe ? { background: '#eef0fa' } : undefined}
                          >
                            {/* Rank */}
                            <td className="px-4 py-3 text-xs font-mono text-gray-400 w-8">
                              {i < 3 ? MEDAL[i] : i + 1}
                            </td>

                            {/* Player */}
                            <td className="px-4 py-3 min-w-[110px]">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                                  style={avatarStyle}
                                >
                                  {entry.user__username[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold" style={{ color: BRAND.primary }}>
                                  {entry.user__username}
                                </span>
                                {isMe && (
                                  <span
                                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                                    style={{ background: BRAND.primary, color: '#FADB43' }}
                                  >
                                    YOU
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Score with inline bar */}
                            <td className="px-4 py-3" style={{ minWidth: 140 }}>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${barPct}%`, background: barColor }}
                                  />
                                </div>
                                <span className="text-xs font-black flex-shrink-0" style={{ color: BRAND.primary }}>
                                  {entry.total_score.toLocaleString()}
                                </span>
                              </div>
                            </td>

                            {/* Avg */}
                            <td className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{avg}</td>

                            {/* Games */}
                            <td className="px-4 py-3 text-right text-xs text-gray-400">{entry.games_played}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div
                  className="px-5 py-3 border-t border-gray-50 flex items-center justify-between flex-shrink-0"
                  style={{ background: '#fafafa' }}
                >
                  <span className="text-[10px] text-gray-400">
                    Avg score across all players: <strong style={{ color: BRAND.primary }}>{avgScore.toLocaleString()}</strong>
                  </span>
                  <Link
                    href="/practice"
                    className="text-[10px] font-bold hover:underline"
                    style={{ color: BRAND.primary }}
                  >
                    Play to climb →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardContent />
    </Suspense>
  );
}
