'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const STYLES = `
  @keyframes authOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(-38px,28px) scale(1.08); }
    66%      { transform:translate(28px,-20px) scale(0.94); }
  }
  @keyframes authRise {
    from { opacity:0; transform:translateY(36px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes authChipFloat {
    0%,100% { transform:translateY(0) rotate(0deg); }
    50%     { transform:translateY(-8px) rotate(1deg); }
  }
  @keyframes authChipFloatB {
    0%,100% { transform:translateY(0) rotate(0deg); }
    50%     { transform:translateY(-10px) rotate(-1.2deg); }
  }
  @keyframes authFormIn {
    from { opacity:0; transform:translateX(22px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .fp-orb-a { animation:authOrbDrift 15s ease-in-out infinite; }
  .fp-orb-b { animation:authOrbDrift 20s ease-in-out infinite reverse; }
  .fp-orb-c { animation:authOrbDrift 12s ease-in-out infinite 2s; }
  .fp-rise-1 { animation:authRise .8s ease both; }
  .fp-rise-2 { animation:authRise .8s .14s ease both; }
  .fp-rise-3 { animation:authRise .8s .28s ease both; }
  .fp-rise-4 { animation:authRise .8s .42s ease both; }
  .fp-chip-a { animation:authChipFloat 3.4s ease-in-out infinite; }
  .fp-chip-b { animation:authChipFloatB 4.0s ease-in-out infinite .5s; }
  .fp-chip-c { animation:authChipFloat 3.7s ease-in-out infinite 1.0s; }
  .fp-chip-d { animation:authChipFloatB 4.3s ease-in-out infinite 1.5s; }
  .fp-form-in { animation:authFormIn .7s .18s ease both; }
`;

const FEATURE_CHIPS = [
  { emoji: '🔐', label: 'Secure Reset', sub: 'Link expires in 1hr', cls: 'fp-chip-a', bg: 'rgba(209,250,229,0.12)', border: 'rgba(110,231,183,0.45)' },
  { emoji: '📬', label: 'Inbox Only',  sub: 'No spam, ever',      cls: 'fp-chip-b', bg: 'rgba(237,233,254,0.12)', border: 'rgba(196,181,253,0.45)' },
  { emoji: '🛡️', label: 'Your Data',   sub: 'Progress is safe',   cls: 'fp-chip-c', bg: 'rgba(219,234,254,0.12)', border: 'rgba(147,197,253,0.45)' },
  { emoji: '⚡', label: 'Back Fast',   sub: 'Under 2 minutes',    cls: 'fp-chip-d', bg: 'rgba(253,244,255,0.12)', border: 'rgba(233,213,255,0.45)' },
];

const BENEFITS = [
  { text: 'Reset link sent straight to your inbox' },
  { text: 'Your progress and streak are completely safe' },
  { text: 'Back to practicing in under 2 minutes' },
];

function Chip({ chip }: { chip: typeof FEATURE_CHIPS[number] }) {
  return (
    <div className={`${chip.cls} flex items-center gap-3 px-4 py-3 rounded-2xl select-none`}
      style={{
        background: chip.bg,
        border: `1px solid ${chip.border}`,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}>
      <span className="text-2xl leading-none">{chip.emoji}</span>
      <div>
        <p className="text-sm font-extrabold text-white leading-none">{chip.label}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{chip.sub}</p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email: identifier });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Left panel — dark hero ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col">

        {/* Background */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)' }} />

        {/* Orbs */}
        <div className="fp-orb-a absolute rounded-full pointer-events-none"
          style={{ width: 520, height: 520, top: -150, left: -110,
            background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)' }} />
        <div className="fp-orb-b absolute rounded-full pointer-events-none"
          style={{ width: 400, height: 400, bottom: -100, right: -110,
            background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 68%)' }} />
        <div className="fp-orb-c absolute rounded-full pointer-events-none"
          style={{ width: 280, height: 280, top: '40%', right: '10%',
            background: 'radial-gradient(circle,rgba(167,139,250,.11) 0%,transparent 68%)' }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.03,
          }} />

        {/* Three-zone flex layout */}
        <div className="relative z-10 flex flex-col flex-1">

          {/* ── Top chip row ── */}
          <div className="flex items-center justify-between px-12 pt-10 pb-0">
            <Chip chip={FEATURE_CHIPS[0]} />
            <Chip chip={FEATURE_CHIPS[1]} />
          </div>

          {/* ── Center content ── */}
          <div className="flex-1 flex flex-col justify-center px-14 py-8">

            {/* Brand */}
            <div className="fp-rise-1 flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: BRAND.gradient }}>
                <span className="text-xl font-black" style={{ color: BRAND.primary }}>S</span>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Speechef</span>
            </div>

            {/* Eyebrow */}
            <div className="fp-rise-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-widest w-fit"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
              Account Recovery
            </div>

            {/* Headline */}
            <h1 className="fp-rise-2 font-black leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(2rem,3.8vw,3.4rem)' }}>
              <span style={{ color: '#fff' }}>Happens to</span>
              <br />
              <span style={{ color: '#fff' }}>Everyone.</span>
              <br />
              <span style={{
                backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
                backgroundSize: '200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Back in minutes.
              </span>
            </h1>

            {/* Sub */}
            <p className="fp-rise-3 text-[0.95rem] font-medium leading-relaxed mb-10 max-w-[340px]"
              style={{ color: 'rgba(255,255,255,0.46)' }}>
              Enter your email or username and we&apos;ll send a secure reset link straight to your inbox.
            </p>

            {/* Benefits */}
            <div className="fp-rise-4 space-y-3 mb-10">
              {BENEFITS.map((b) => (
                <div key={b.text} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(250,219,67,0.15)', border: '1px solid rgba(250,219,67,0.3)' }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#FADB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.58)' }}>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Back to login */}
            <div>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border transition-all hover:bg-white/10 active:scale-95"
                style={{ borderColor: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.58)' }}>
                ← Back to Log in
              </Link>
            </div>
          </div>

          {/* ── Bottom chip row ── */}
          <div className="flex items-center justify-between px-12 pb-8 pt-0">
            <Chip chip={FEATURE_CHIPS[2]} />
            <Chip chip={FEATURE_CHIPS[3]} />
          </div>

          {/* Footer */}
          <div className="px-14 pb-6">
            <p className="text-[0.7rem]" style={{ color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} Speechef · Built for English learners worldwide
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="fp-form-in w-full max-w-sm">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: BRAND.gradient }}>
              <span className="text-lg font-black" style={{ color: BRAND.primary }}>S</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: BRAND.primary }}>
              Speechef
            </span>
          </div>

          {sent ? (
            /* ── Sent state ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '2px solid #86efac' }}>
                <span className="text-3xl">📬</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>
                Check your inbox
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                If an account with that email exists, a reset link has been sent.
                Check your server logs if you&apos;re running locally.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                ← Back to Log in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold" style={{ color: BRAND.primary }}>Reset your password</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your email or username and we&apos;ll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="identifier">Email or Username</Label>
                  <Input
                    id="identifier"
                    type="text"
                    required
                    autoComplete="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full font-bold text-[#141c52] h-11 text-sm tracking-wide transition-opacity hover:opacity-90"
                  style={{ background: BRAND.gradient }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered it?{' '}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: BRAND.primary }}>
                  Log in →
                </Link>
              </p>

              {/* Mobile chips */}
              <div className="lg:hidden mt-10 pt-8 border-t border-gray-100">
                <p className="text-[0.65rem] text-center text-gray-400 mb-3 uppercase tracking-widest font-semibold">
                  What&apos;s inside
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[{ emoji: '🎮', label: 'Word Games' }, { emoji: '🎭', label: 'AI Roleplay' },
                    { emoji: '📝', label: 'Test Prep' }, { emoji: '🤖', label: 'AI Tools' }].map((c) => (
                    <span key={c.label} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: '#f4f6fb', color: BRAND.primary }}>
                      {c.emoji} {c.label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
