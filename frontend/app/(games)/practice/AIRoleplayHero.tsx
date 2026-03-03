'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

export interface RoleplayConfig {
  href: string;
  title: string;
  emoji: string;
  badge: string | null;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMin: number;
  color: { bg: string; text: string; border: string };
}

interface Props {
  modes: readonly RoleplayConfig[];
}

const GRADIENT = 'linear-gradient(to right, #FADB43, #fe9940)';
const AUTO_MS  = 4000;

const DIFF_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Easy:   { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  Medium: { bg: '#fef9c3', text: '#92400e', dot: '#f59e0b' },
  Hard:   { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

export default function AIRoleplayHero({ modes }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActive(p => (p + 1) % modes.length),
      AUTO_MS,
    );
  }, [modes.length]);

  useEffect(() => {
    if (!paused) restart();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, restart]);

  const goTo = useCallback((i: number) => {
    setActive(i);
    restart();
  }, [restart]);

  const goPrev = () => goTo((active - 1 + modes.length) % modes.length);
  const goNext = () => goTo((active + 1) % modes.length);

  return (
    <>
      <style>{`
        @keyframes rp-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes rp-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.06); }
          66%       { transform: translate(-20px, 35px) scale(0.94); }
        }
        @keyframes rp-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-35px, 20px) scale(1.09); }
          70%       { transform: translate(28px, -40px) scale(0.92); }
        }
        @keyframes rp-orb-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(18px, 25px) scale(1.12); }
        }
        @keyframes rp-grid {
          0%   { background-position: 0 0; }
          100% { background-position: 22px 22px; }
        }
        @keyframes rp-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rp-bar-glow {
          0%, 100% { box-shadow: 0 0 10px 2px rgba(250,219,67,0.35); }
          50%       { box-shadow: 0 0 26px 8px rgba(254,153,64,0.55); }
        }
        @keyframes rp-card-in {
          from { opacity: 0; transform: translateY(16px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes rp-breathe {
          0%, 100% { transform: scale(1)    rotate(0deg);  }
          25%       { transform: scale(1.09) rotate(-4deg); }
          75%       { transform: scale(1.06) rotate(4deg);  }
        }
        @keyframes rp-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          65%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes rp-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes rp-progress-glow {
          0%, 100% { box-shadow: 0 0 6px rgba(250,219,67,0.4); }
          50%       { box-shadow: 0 0 16px rgba(254,153,64,0.7); }
        }

        .rp-stagger > *:nth-child(1) { animation: rp-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.04s both; }
        .rp-stagger > *:nth-child(2) { animation: rp-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.11s both; }
        .rp-stagger > *:nth-child(3) { animation: rp-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.18s both; }
        .rp-stagger > *:nth-child(4) { animation: rp-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.25s both; }
        .rp-stagger > *:nth-child(5) { animation: rp-card-in 0.42s cubic-bezier(0.2,0,0.2,1) 0.32s both; }

        .rp-shimmer-btn {
          background-size: 200% auto !important;
          animation: rp-shimmer 2.8s linear infinite;
        }
        .rp-shimmer-btn:hover { animation-duration: 1.2s; }
      `}</style>

      <div
        className="rounded-3xl overflow-hidden relative flex flex-col"
        style={{
          background: 'linear-gradient(160deg, #160a10 0%, #141c52 45%, #200c08 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >

        {/* ── Animated background ─────────────────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          <div style={{
            position: 'absolute', width: '620px', height: '620px',
            top: '-190px', left: '-160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 68%)',
            animation: 'rp-orb-a 20s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '500px', height: '500px',
            bottom: '-150px', right: '-110px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,219,67,0.065) 0%, transparent 68%)',
            animation: 'rp-orb-b 25s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '300px', height: '300px',
            top: '40%', left: '38%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,113,133,0.055) 0%, transparent 68%)',
            animation: 'rp-orb-c 16s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            animation: 'rp-grid 10s linear infinite',
          }} />
          <div style={{
            position: 'absolute', height: '1px',
            left: '8%', right: '8%', top: '50%',
            background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.14), transparent)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
            background: 'linear-gradient(to top, rgba(22,10,16,0.5), transparent)',
          }} />
        </div>

        {/* ── Main layout (carousel left, title right) ────────────────────────── */}
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
                animation: 'rp-bar-glow 3.5s ease-in-out infinite',
              }}
            />

            <div>
              {/* Label chip */}
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 tracking-widest uppercase"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#fca5a5',
                  boxShadow: '0 0 20px rgba(239,68,68,0.1)',
                  animation: 'rp-fade-up 0.55s ease both',
                  animationDelay: '0.05s',
                }}
              >
                👨‍🍳 Service Simulations
              </span>

              {/* Headline */}
              <h2
                className="font-extrabold text-white leading-[1.15] mb-5"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  animation: 'rp-fade-up 0.55s ease both',
                  animationDelay: '0.12s',
                }}
              >
                Live the Scene,{' '}
                <span style={{
                  background: GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Own the Kitchen
                </span>
                <br />
                <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.62em', fontWeight: 700, letterSpacing: '0.01em' }}>
                  Plated by AI, perfected by you
                </span>
              </h2>

              <p
                className="text-sm leading-loose"
                style={{
                  color: 'rgba(255,255,255,0.42)',
                  animation: 'rp-fade-up 0.55s ease both',
                  animationDelay: '0.19s',
                }}
              >
                {modes.length} immersive service simulations — job interviews, debates, pitches
                and everyday conversations, all scored and reviewed in real time.
              </p>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-6"
              style={{ animation: 'rp-fade-up 0.55s ease both', animationDelay: '0.26s' }}
            >
              {[
                { value: String(modes.length), label: 'Scenes'  },
                { value: 'AI',                 label: 'Coach'   },
                { value: '📊',                 label: 'Scored'  },
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
            <div style={{ animation: 'rp-fade-up 0.55s ease both', animationDelay: '0.33s' }}>
              <Link
                href="/practice/roleplay"
                className="rp-shimmer-btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[14px] font-extrabold transition-all hover:scale-[1.04] active:scale-95"
                style={{
                  background: 'linear-gradient(to right, #FADB43, #fe9940, #FADB43)',
                  color: '#141c52',
                  boxShadow: '0 8px 28px rgba(250,219,67,0.28)',
                }}
              >
                All Scenes
                <span className="text-base">→</span>
              </Link>
              <p className="text-[11px] mt-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
                Scroll down to explore more ↓
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              LEFT PANEL — carousel
          ════════════════════════════════════════════════ */}
          <div
            className="flex-1 flex flex-col p-8 gap-5"
            style={{ borderRight: '1px solid rgba(255,255,255,0.055)' }}
          >

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {modes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to mode ${i + 1}`}
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

              <div className="flex items-center gap-2.5">
                {[
                  { label: 'Previous mode', icon: '‹', handler: goPrev },
                  { label: 'Next mode',     icon: '›', handler: goNext },
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

            {/* Carousel track */}
            <div
              className="relative overflow-hidden rounded-2xl min-h-[460px]"
              style={{ perspective: '1200px' }}
            >
              {modes.map((m, idx) => {
                const isActive = idx === active;
                const isBefore = idx < active;
                const isAfter  = idx > active;
                const diff     = DIFF_STYLE[m.difficulty];

                const tx      = isBefore ? '-115%' : isAfter ? '115%' : '0%';
                const ry      = isBefore ? '-8deg'  : isAfter ? '8deg'  : '0deg';
                const scale   = isActive ? 1 : 0.9;
                const blur    = isActive ? 0 : 6;
                const opacity = isActive ? 1 : 0;

                return (
                  <div
                    key={m.href}
                    className="absolute inset-0"
                    style={{
                      transform: `translateX(${tx}) rotateY(${ry}) scale(${scale})`,
                      opacity,
                      filter: `blur(${blur}px)`,
                      transition:
                        'transform 0.6s cubic-bezier(0.35,0,0.15,1), opacity 0.5s ease, filter 0.5s ease',
                      pointerEvents: isActive ? 'all' : 'none',
                      transformStyle: 'preserve-3d',
                      willChange: 'transform, opacity',
                    }}
                  >
                    <div
                      className="h-full rounded-2xl flex flex-col overflow-hidden"
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${m.color.border}`,
                        boxShadow: isActive
                          ? `0 24px 70px rgba(0,0,0,0.28), 0 0 0 1px ${m.color.border}60, inset 0 1px 0 rgba(255,255,255,0.95)`
                          : 'none',
                      }}
                    >
                      {/* Card body */}
                      <div
                        className="relative flex-1 px-8 py-8 overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, #ffffff 40%, ${m.color.bg} 100%)`,
                        }}
                      >
                        <div className="absolute right-[-35px] top-[-35px] w-44 h-44 rounded-full pointer-events-none"
                          style={{ background: m.color.text, opacity: 0.05 }} />
                        <div className="absolute right-[18%] bottom-[-20px] w-24 h-24 rounded-full pointer-events-none"
                          style={{ background: m.color.text, opacity: 0.035 }} />
                        <div
                          className="absolute left-0 right-0 top-0 h-[4px]"
                          style={{ background: GRADIENT, boxShadow: '0 2px 14px rgba(250,219,67,0.45)' }}
                        />

                        {/* Staggered content */}
                        <div
                          key={isActive ? `a-${active}` : `i-${idx}`}
                          className={isActive ? 'rp-stagger' : ''}
                        >
                          {/* Emoji + badges row */}
                          <div className="flex items-start justify-between mb-5">
                            <span
                              className="text-6xl leading-none select-none"
                              style={isActive
                                ? { display: 'inline-block', animation: 'rp-breathe 3.5s ease-in-out infinite 0.4s' }
                                : {}}
                            >
                              {m.emoji}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {m.badge && (
                                <span
                                  className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                                  style={{
                                    background: GRADIENT,
                                    color: '#141c52',
                                    boxShadow: '0 2px 10px rgba(250,219,67,0.35)',
                                    animation: 'rp-pop 0.4s cubic-bezier(0.2,0,0.2,1) 0.3s both',
                                  }}
                                >
                                  {m.badge}
                                </span>
                              )}
                              {/* Difficulty badge */}
                              <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                                style={{ background: diff.bg, color: diff.text }}
                              >
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full"
                                  style={{ background: diff.dot }}
                                />
                                {m.difficulty}
                              </span>
                              <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                style={{
                                  background: m.color.bg,
                                  color: m.color.text,
                                  border: `1px solid ${m.color.border}`,
                                }}
                              >
                                {idx + 1} / {modes.length}
                              </span>
                            </div>
                          </div>

                          <h3
                            className="font-extrabold mb-3 leading-tight"
                            style={{ color: '#141c52', fontSize: 'clamp(18px, 2vw, 22px)' }}
                          >
                            {m.title}
                          </h3>
                          <p className="leading-relaxed" style={{ color: '#64748b', fontSize: '14px' }}>
                            {m.description}
                          </p>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{
                          background: m.color.bg,
                          borderTop: `1px solid ${m.color.border}88`,
                        }}
                      >
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: m.color.text, opacity: 0.6 }}
                        >
                          ~{m.estimatedMin} min session
                        </span>
                        <Link
                          href={m.href}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-extrabold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{
                            background: GRADIENT,
                            color: '#141c52',
                            boxShadow: '0 4px 16px rgba(250,219,67,0.32)',
                          }}
                        >
                          Start Session →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
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
                    animation: `rp-fill ${AUTO_MS}ms linear forwards`,
                    boxShadow: '0 0 10px rgba(250,219,67,0.5)',
                    animationName: 'rp-fill, rp-progress-glow',
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
