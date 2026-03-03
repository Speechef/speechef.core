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

  const meterScore = isLoggedIn && totalGames > 0 ? bestScore : 0;
  const meterR = 54, meterCx = 68, meterCy = 68;
  const meterCirc = 2 * Math.PI * meterR;
  const meterDash = (meterScore / 100) * meterCirc;

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

          {/* Right: Speechef meter */}
          <div className="p-rise-4 w-64 shrink-0 hidden sm:block">
            <div className="rounded-2xl p-6 flex flex-col items-center gap-4" style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Speechef Meter</p>

              {/* Circular ring */}
              <svg width={136} height={136} viewBox="0 0 136 136">
                <defs>
                  <linearGradient id="practiceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#FADB43" />
                    <stop offset="100%" stopColor="#fe9940" />
                  </linearGradient>
                </defs>
                <circle cx={meterCx} cy={meterCy} r={meterR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
                <circle cx={meterCx} cy={meterCy} r={meterR} fill="none" stroke="url(#practiceGrad)" strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${meterDash} ${meterCirc}`}
                  transform={`rotate(-90 ${meterCx} ${meterCy})`}
                  style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
                />
                <text x={meterCx} y={meterCy - 8}  textAnchor="middle" fill="#fff"                   fontSize={22} fontWeight={900} fontFamily="inherit">{meterScore}</text>
                <text x={meterCx} y={meterCy + 12} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={10} fontWeight={600} fontFamily="inherit">KITCHEN SCORE</text>
              </svg>

              {/* Stat chips */}
              <div className="w-full grid grid-cols-3 gap-2">
                {[
                  { label: 'Dishes',     value: isLoggedIn ? totalGames : 6 },
                  { label: 'Best',       value: isLoggedIn && totalGames > 0 ? bestScore : '—' },
                  { label: 'Streak',     value: isLoggedIn ? streak    : 0  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-base font-black text-white leading-none">{value}</p>
                    <p className="text-[9px] font-bold mt-1 uppercase tracking-wide text-center"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {!isLoggedIn && (
                <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Log in to track your progress
                </p>
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
