'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { type GameConfig } from './WordGamesSection';

interface Props {
  games: readonly GameConfig[];
}

const GRADIENT = 'linear-gradient(to right, #FADB43, #fe9940)';
const AUTO_MS  = 4000;

export default function WordGamesHero({ games }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── auto-advance ────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActive(p => (p + 1) % games.length),
      AUTO_MS,
    );
  }, [games.length]);

  useEffect(() => {
    if (!paused) restart();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, restart]);

  const goTo = useCallback((i: number) => {
    setActive(i);
    restart();
  }, [restart]);

  const goPrev = () => goTo((active - 1 + games.length) % games.length);
  const goNext = () => goTo((active + 1) % games.length);

  return (
    <>
      <style>{`
        /* ── Progress bar fill ── */
        @keyframes wg-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        /* ── Floating background orbs ── */
        @keyframes wg-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.06); }
          66%       { transform: translate(-20px, 35px) scale(0.94); }
        }
        @keyframes wg-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-35px, 20px) scale(1.09); }
          70%       { transform: translate(28px, -40px) scale(0.92); }
        }
        @keyframes wg-orb-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(18px, 25px) scale(1.12); }
        }
        /* ── Dot grid slow drift ── */
        @keyframes wg-grid {
          0%   { background-position: 0 0; }
          100% { background-position: 22px 22px; }
        }
        /* ── Left-panel staggered entrance ── */
        @keyframes wg-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* ── Accent bar glow pulse ── */
        @keyframes wg-bar-glow {
          0%, 100% { box-shadow: 0 0 10px 2px rgba(250,219,67,0.35); }
          50%       { box-shadow: 0 0 26px 8px rgba(254,153,64,0.55); }
        }
        /* ── Card content stagger ── */
        @keyframes wg-card-in {
          from { opacity: 0; transform: translateY(16px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        /* ── Emoji gentle breathe ── */
        @keyframes wg-breathe {
          0%, 100% { transform: scale(1)    rotate(0deg);  }
          25%       { transform: scale(1.09) rotate(-4deg); }
          75%       { transform: scale(1.06) rotate(4deg);  }
        }
        /* ── Badge pop-in ── */
        @keyframes wg-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          65%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        /* ── CTA button shimmer ── */
        @keyframes wg-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        /* ── Progress bar glow ── */
        @keyframes wg-progress-glow {
          0%, 100% { box-shadow: 0 0 6px rgba(250,219,67,0.4); }
          50%       { box-shadow: 0 0 16px rgba(254,153,64,0.7); }
        }

        /* ── Staggered card-content children ── */
        .wg-stagger > *:nth-child(1) { animation: wg-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.04s both; }
        .wg-stagger > *:nth-child(2) { animation: wg-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.11s both; }
        .wg-stagger > *:nth-child(3) { animation: wg-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.18s both; }
        .wg-stagger > *:nth-child(4) { animation: wg-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.25s both; }

        .wg-shimmer-btn {
          background-size: 200% auto !important;
          animation: wg-shimmer 2.8s linear infinite;
        }
        .wg-shimmer-btn:hover { animation-duration: 1.2s; }
      `}</style>

      <div
        className="rounded-3xl overflow-hidden relative flex flex-col lg:h-[min(85vh,860px)]"
        style={{
          background: 'linear-gradient(160deg, #0c1338 0%, #141c52 45%, #1a1060 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >

        {/* ── Animated background layer ────────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {/* Orb A — top-left, yellow tint */}
          <div style={{
            position: 'absolute', width: '650px', height: '650px',
            top: '-220px', left: '-180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,219,67,0.07) 0%, transparent 68%)',
            animation: 'wg-orb-a 20s ease-in-out infinite',
          }} />
          {/* Orb B — bottom-right, orange tint */}
          <div style={{
            position: 'absolute', width: '520px', height: '520px',
            bottom: '-160px', right: '-120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254,153,64,0.065) 0%, transparent 68%)',
            animation: 'wg-orb-b 25s ease-in-out infinite',
          }} />
          {/* Orb C — centre, indigo tint */}
          <div style={{
            position: 'absolute', width: '320px', height: '320px',
            top: '38%', left: '42%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,82,255,0.055) 0%, transparent 68%)',
            animation: 'wg-orb-c 16s ease-in-out infinite',
          }} />
          {/* Animated dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.038) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            animation: 'wg-grid 10s linear infinite',
          }} />
          {/* Horizontal light streak */}
          <div style={{
            position: 'absolute', height: '1px',
            left: '8%', right: '8%', top: '50%',
            background: 'linear-gradient(to right, transparent, rgba(250,219,67,0.12), transparent)',
          }} />
          {/* Bottom gradient fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
            background: 'linear-gradient(to top, rgba(20,28,82,0.5), transparent)',
          }} />
        </div>

        {/* ── Main layout ─────────────────────────────────────────────────────── */}
        <div className="relative flex-1 flex flex-col lg:flex-row-reverse">

          {/* ════════════════════════════════════════════════
              RIGHT PANEL — title + stats + CTA
          ════════════════════════════════════════════════ */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 relative px-10 py-12 flex flex-col justify-center gap-9">

            {/* Accent bar */}
            <div
              className="absolute right-0 rounded-full"
              style={{
                top: '15%', bottom: '15%', width: '3px',
                background: GRADIENT, opacity: 0.55,
                animation: 'wg-bar-glow 3.5s ease-in-out infinite',
              }}
            />

            {/* Top content block */}
            <div>
              {/* Label chip */}
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 tracking-widest uppercase"
                style={{
                  background: 'rgba(250,219,67,0.1)',
                  border: '1px solid rgba(250,219,67,0.22)',
                  color: '#FADB43',
                  boxShadow: '0 0 20px rgba(250,219,67,0.1)',
                  animation: 'wg-fade-up 0.55s ease both',
                  animationDelay: '0.05s',
                }}
              >
                🎮 Word Games
              </span>

              {/* Headline */}
              <h2
                className="font-extrabold text-white leading-[1.15] mb-5"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  animation: 'wg-fade-up 0.55s ease both',
                  animationDelay: '0.12s',
                }}
              >
                Sharpen Your{' '}
                <span style={{
                  background: GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Vocabulary
                </span>
                <br />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.62em', fontWeight: 700, letterSpacing: '0.01em' }}>
                  One Game at a Time
                </span>
              </h2>

              <p
                className="text-sm leading-loose"
                style={{
                  color: 'rgba(255,255,255,0.42)',
                  animation: 'wg-fade-up 0.55s ease both',
                  animationDelay: '0.19s',
                }}
              >
                {games.length} games designed to build recall, fluency and
                speed — keep your daily streak alive with bite-sized challenges.
              </p>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-6"
              style={{ animation: 'wg-fade-up 0.55s ease both', animationDelay: '0.26s' }}
            >
              {[
                { value: String(games.length), label: 'Games' },
                { value: 'Daily',              label: 'Challenge' },
                { value: '🔥',                 label: 'Streak' },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-6">
                  <div>
                    <div className="text-xl font-extrabold text-white leading-none">{s.value}</div>
                    <div
                      className="text-[9px] font-semibold uppercase tracking-widest mt-1.5"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                    >
                      {s.label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ animation: 'wg-fade-up 0.55s ease both', animationDelay: '0.33s' }}>
              <Link
                href="/practice/word-games"
                className="wg-shimmer-btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[14px] font-extrabold transition-all hover:scale-[1.04] active:scale-95"
                style={{
                  background: 'linear-gradient(to right, #FADB43, #fe9940, #FADB43)',
                  color: '#141c52',
                  boxShadow: '0 8px 28px rgba(250,219,67,0.28)',
                }}
              >
                See All Games
                <span className="text-base">→</span>
              </Link>
              <p
                className="text-[11px] mt-4"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                Scroll down to explore more ↓
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              LEFT PANEL — carousel
          ════════════════════════════════════════════════ */}
          <div
            className="flex-1 flex flex-col p-8 gap-5 min-h-0"
            style={{ borderRight: '1px solid rgba(255,255,255,0.055)' }}
          >

            {/* Controls row */}
            <div className="flex items-center justify-between">
              {/* Dot indicators */}
              <div className="flex items-center gap-2.5">
                {games.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to game ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{
                      height: '7px',
                      width: i === active ? '30px' : '7px',
                      background: i === active ? GRADIENT : 'rgba(255,255,255,0.16)',
                      boxShadow: i === active ? '0 0 12px rgba(250,219,67,0.45)' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Arrow buttons */}
              <div className="flex items-center gap-2.5">
                {[
                  { label: 'Previous game', icon: '‹', handler: goPrev },
                  { label: 'Next game',     icon: '›', handler: goNext },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.handler}
                    aria-label={btn.label}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Carousel track ─────────────────────────────────────────────
                3D perspective container. Each card:
                  - Before active: translateX(-115%) rotateY(-8deg) scale(0.9) blur(5px)
                  - Active:        translateX(0)     rotateY(0)      scale(1)   blur(0)
                  - After active:  translateX(115%)  rotateY(8deg)   scale(0.9) blur(5px)
                Cubic-bezier gives a spring-like feel on transition.
            ────────────────────────────────────────────────────────────────── */}
            <div
              className="flex-1 relative overflow-hidden rounded-2xl min-h-[320px] lg:min-h-0"
              style={{ perspective: '1200px' }}
            >
              {games.map((g, idx) => {
                const isActive = idx === active;
                const isBefore = idx < active;
                const isAfter  = idx > active;

                const tx      = isBefore ? '-115%' : isAfter ? '115%' : '0%';
                const ry      = isBefore ? '-8deg'  : isAfter ? '8deg'  : '0deg';
                const scale   = isActive ? 1 : 0.9;
                const blur    = isActive ? 0 : 6;
                const opacity = isActive ? 1 : 0;

                return (
                  <div
                    key={g.href}
                    className="absolute inset-0"
                    style={{
                      transform: `translateX(${tx}) rotateY(${ry}) scale(${scale})`,
                      opacity,
                      filter: `blur(${blur}px)`,
                      transition:
                        'transform 0.6s cubic-bezier(0.35, 0, 0.15, 1), opacity 0.5s ease, filter 0.5s ease',
                      pointerEvents: isActive ? 'all' : 'none',
                      transformStyle: 'preserve-3d',
                      willChange: 'transform, opacity',
                    }}
                  >
                    <div
                      className="h-full rounded-2xl flex flex-col overflow-hidden"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${g.color.border}`,
                        boxShadow: isActive
                          ? `0 24px 70px rgba(0,0,0,0.28), 0 0 0 1px ${g.color.border}60, inset 0 1px 0 rgba(255,255,255,0.95)`
                          : 'none',
                      }}
                    >

                      {/* ── Card body ── */}
                      <div
                        className="relative flex-1 px-8 py-8 overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, #ffffff 40%, ${g.color.bg} 100%)`,
                        }}
                      >
                        {/* Decorative blobs */}
                        <div className="absolute right-[-35px] top-[-35px] w-44 h-44 rounded-full pointer-events-none"
                          style={{ background: g.color.text, opacity: 0.05 }} />
                        <div className="absolute right-[18%] bottom-[-20px] w-24 h-24 rounded-full pointer-events-none"
                          style={{ background: g.color.text, opacity: 0.035 }} />

                        {/* Brand accent bar + glow */}
                        <div
                          className="absolute left-0 right-0 top-0 h-[4px]"
                          style={{
                            background: GRADIENT,
                            boxShadow: '0 2px 14px rgba(250,219,67,0.45)',
                          }}
                        />

                        {/* Staggered content — key remounts on activation to replay animation */}
                        <div
                          key={isActive ? `a-${active}` : `i-${idx}`}
                          className={isActive ? 'wg-stagger' : ''}
                        >
                          {/* Emoji + badges row */}
                          <div className="flex items-start justify-between mb-5">
                            <span
                              className="text-6xl leading-none select-none"
                              style={isActive
                                ? { display: 'inline-block', animation: 'wg-breathe 3.5s ease-in-out infinite 0.4s' }
                                : {}}
                            >
                              {g.emoji}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {g.badge && (
                                <span
                                  className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                                  style={{
                                    background: GRADIENT,
                                    color: '#141c52',
                                    boxShadow: '0 2px 10px rgba(250,219,67,0.35)',
                                    animation: 'wg-pop 0.4s cubic-bezier(0.2,0,0.2,1) 0.3s both',
                                  }}
                                >
                                  {g.badge}
                                </span>
                              )}
                              <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                style={{
                                  background: g.color.bg,
                                  color: g.color.text,
                                  border: `1px solid ${g.color.border}`,
                                }}
                              >
                                {idx + 1} / {games.length}
                              </span>
                            </div>
                          </div>

                          <h3
                            className="font-extrabold mb-3 leading-tight"
                            style={{ color: '#141c52', fontSize: 'clamp(18px, 2vw, 22px)' }}
                          >
                            {g.title}
                          </h3>
                          <p className="leading-relaxed" style={{ color: '#64748b', fontSize: '14px' }}>
                            {g.description}
                          </p>
                        </div>
                      </div>

                      {/* ── Card footer ── */}
                      <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{
                          background: g.color.bg,
                          borderTop: `1px solid ${g.color.border}88`,
                        }}
                      >
                        <Link
                          href="/practice/leaderboard"
                          className="text-[12px] font-semibold transition-opacity hover:opacity-80"
                          style={{ color: g.color.text, opacity: 0.55 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Leaderboard →
                        </Link>
                        <Link
                          href={g.href}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-extrabold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{
                            background: GRADIENT,
                            color: '#141c52',
                            boxShadow: '0 4px 16px rgba(250,219,67,0.32)',
                          }}
                        >
                          Play Game →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Auto-progress bar ── */}
            <div
              className="h-[3px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {!paused && (
                <div
                  key={active}
                  className="h-full rounded-full origin-left"
                  style={{
                    background: GRADIENT,
                    animation: `wg-fill ${AUTO_MS}ms linear forwards`,
                    boxShadow: '0 0 10px rgba(250,219,67,0.5)',
                    animationName: 'wg-fill, wg-progress-glow',
                    animationDuration: `${AUTO_MS}ms, 1.8s`,
                    animationTimingFunction: 'linear, ease-in-out',
                    animationFillMode: 'forwards, none',
                    animationIterationCount: '1, infinite',
                  }}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
