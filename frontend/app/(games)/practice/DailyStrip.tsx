'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BRAND = { gradient: 'linear-gradient(to right, #FADB43, #fe9940)' };
const TODAY = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `dc_${TODAY}`;

export default function DailyStrip() {
  const [done, setDone] = useState<{ correct: boolean; word: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  // SSR / pre-mount: neutral skeleton so layout doesn't shift
  if (!mounted) {
    return <div className="h-[88px] rounded-2xl border border-amber-100 bg-amber-50 animate-pulse mb-10" />;
  }

  // ── Completed state ──────────────────────────────────────────────────────
  if (done) {
    const correct = done.correct;
    return (
      <div
        className="rounded-2xl overflow-hidden border mb-10"
        style={{ borderColor: correct ? '#86efac' : '#fde68a' }}
      >
        <div
          className="relative px-6 py-5 overflow-hidden"
          style={{
            background: correct
              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
          }}
        >
          {/* Decorative blob */}
          <div
            className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full opacity-15 pointer-events-none"
            style={{ background: correct ? '#065f46' : '#78350f' }}
          />

          <div className="relative flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                style={{ background: 'rgba(255,255,255,0.6)', border: `1.5px solid ${correct ? '#86efac' : '#fde68a'}` }}
              >
                {correct ? '✅' : '😬'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white"
                    style={{ background: correct ? '#22c55e' : '#f59e0b' }}
                  >
                    {correct ? 'Completed · +5 XP' : 'Attempted'}
                  </span>
                  <span className="text-xs font-medium" style={{ color: correct ? '#047857' : '#92400e' }}>
                    {today}
                  </span>
                </div>
                <h2
                  className="text-lg font-extrabold leading-tight"
                  style={{ color: correct ? '#065f46' : '#78350f' }}
                >
                  {correct ? 'Daily Challenge Done!' : 'Daily Challenge Complete'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: correct ? '#047857' : '#a16207' }}>
                  {correct
                    ? `You nailed "${done.word}" — come back tomorrow for more`
                    : `Today's word was "${done.word}" — better luck tomorrow`}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/practice/daily-challenge"
              className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.65)',
                color: correct ? '#065f46' : '#78350f',
                border: `1.5px solid ${correct ? '#86efac' : '#fde68a'}`,
              }}
            >
              View Result →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Not yet played ───────────────────────────────────────────────────────
  return (
    <Link
      href="/practice/daily-challenge"
      className="group block rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 mb-10"
      style={{ borderColor: '#fde68a' }}
    >
      <div
        className="relative px-6 py-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 60%, #fef3c7 100%)' }}
      >
        <div className="absolute right-[-24px] top-[-24px] w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: '#78350f' }} />
        <div className="absolute right-[72px] bottom-[-20px] w-20 h-20 rounded-full opacity-10 pointer-events-none"
          style={{ background: '#78350f' }} />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #fde68a' }}
            >
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: '#FADB43', color: '#78350f' }}
                >
                  Today
                </span>
                <span className="text-xs font-medium" style={{ color: '#92400e' }}>{today}</span>
              </div>
              <h2 className="text-xl font-extrabold leading-tight" style={{ color: '#78350f' }}>
                Daily Challenge
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#a16207' }}>
                One word · One shot · Earn +5 XP
              </p>
            </div>
          </div>
          <span
            className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 group-hover:scale-105"
            style={{ background: BRAND.gradient, color: '#78350f' }}
          >
            Play Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
