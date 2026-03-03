'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const STYLES = `
  @keyframes pOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(44px,-34px) scale(1.1); }
    66%      { transform:translate(-28px,26px) scale(0.93); }
  }
  @keyframes pRise {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes pChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes pCta {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  .p-orb-a { animation:pOrbDrift 14s ease-in-out infinite; }
  .p-orb-b { animation:pOrbDrift 19s ease-in-out infinite reverse; }
  .p-orb-c { animation:pOrbDrift 11s ease-in-out infinite 3.5s; }
  .p-rise-1 { animation:pRise .85s ease both; }
  .p-rise-2 { animation:pRise .85s .18s ease both; }
  .p-rise-3 { animation:pRise .85s .34s ease both; }
  .p-rise-4 { animation:pRise .85s .52s ease both; }
  .p-chev   { animation:pChev 1.9s ease-in-out infinite; }
  .p-cta    { animation:pCta 3s ease-in-out infinite; }
`;

export default function PracticeHero({
  onScrollDown,
  isLoggedIn,
  totalGames,
  bestScore,
  streak,
}: {
  onScrollDown: () => void;
  isLoggedIn: boolean;
  totalGames: number;
  bestScore: number;
  streak: number;
}) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const wipe         = e * 110;
  const contentOpacity = Math.max(0, 1 - e * 1.9);
  const contentScale   = 1 - e * 0.07;
  const chevOpacity    = Math.max(0, 1 - e * 3.5);

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Background — upward curtain wipe */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
        clipPath: `inset(0 0 ${wipe}% 0)`,
      }} />

      {/* Orbs */}
      <div className="p-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 540, height: 540, top: -150, right: -110,
          background: 'radial-gradient(circle,rgba(250,219,67,.13) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div className="p-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, bottom: -100, left: -120,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div className="p-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 290, height: 290, top: '30%', left: '14%',
          background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: Math.max(0, 0.035 - e * 0.035),
        clipPath: `inset(0 0 ${wipe}% 0)`,
      }} />

      {/* Two-column content */}
      <div
        className="absolute inset-0 flex items-center z-10"
        style={{ opacity: contentOpacity, transform: `scale(${contentScale})`, transformOrigin: 'center center' }}
      >
        <div className="w-full max-w-6xl mx-auto px-8 flex items-center gap-12">

          {/* Left: headline + CTAs */}
          <div className="flex-1 text-left">
            <div className="p-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
              The Kitchen
            </div>

            <h1 className="p-rise-2 font-black leading-[1.02] mb-4"
              style={{ fontSize: 'clamp(2.4rem,5vw,4.5rem)' }}>
              <span style={{ color: '#fff' }}>Mise en Place.</span>
              <br />
              <span style={{
                backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
                backgroundSize: '200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Cook Up Fluency.
              </span>
            </h1>

            <p className="p-rise-3 text-base font-medium mb-9 max-w-md"
              style={{ color: 'rgba(255,255,255,0.48)' }}>
              Kitchen drills, service sims, exam prep &amp; chef&apos;s tools — every skill, one kitchen.
            </p>

            <div className="p-rise-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={onScrollDown}
                className="p-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                Enter the Kitchen ↓
              </button>
              <Link
                href="/practice/roleplay"
                className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
              >
                Service Sims →
              </Link>
            </div>
          </div>

          {/* Right: stats glass card */}
          <div className="p-rise-4 w-72 shrink-0 hidden sm:block">
            <div className="rounded-2xl p-6" style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}>
              {isLoggedIn && totalGames > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{totalGames}</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Dishes</p>
                    </div>
                    <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{bestScore}</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Best Score</p>
                    </div>
                    <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div>
                      <p className="text-3xl font-black leading-none" style={{ color: streak > 0 ? '#fb923c' : '#fff' }}>{streak}</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Streak</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Best score</span>
                    <span className="font-semibold text-white">{bestScore} / 100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${bestScore}%`, background: BRAND.gradient }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <p className="text-3xl font-black text-white leading-none">6</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Kitchen Drills</p>
                    </div>
                    <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">4</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Service Sims</p>
                    </div>
                    <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">4</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Chef&apos;s Tools</p>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {isLoggedIn ? 'Play a game to track your stats' : 'Log in to track your progress'}
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="p-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
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
