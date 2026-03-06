'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const STYLES = `
  @keyframes regOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(42px,-32px) scale(1.09); }
    66%      { transform:translate(-30px,24px) scale(0.93); }
  }
  @keyframes regRise {
    from { opacity:0; transform:translateY(36px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes regChipFloat {
    0%,100% { transform:translateY(0) rotate(0deg); }
    50%     { transform:translateY(-9px) rotate(1.1deg); }
  }
  @keyframes regChipFloatB {
    0%,100% { transform:translateY(0) rotate(0deg); }
    50%     { transform:translateY(-7px) rotate(-1deg); }
  }
  @keyframes regFormIn {
    from { opacity:0; transform:translateX(22px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes regBulletPop {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .reg-orb-a { animation:regOrbDrift 16s ease-in-out infinite; }
  .reg-orb-b { animation:regOrbDrift 21s ease-in-out infinite reverse; }
  .reg-orb-c { animation:regOrbDrift 13s ease-in-out infinite 2.5s; }
  .reg-rise-1 { animation:regRise .8s ease both; }
  .reg-rise-2 { animation:regRise .8s .14s ease both; }
  .reg-rise-3 { animation:regRise .8s .28s ease both; }
  .reg-rise-4 { animation:regRise .8s .42s ease both; }
  .reg-rise-5 { animation:regRise .8s .56s ease both; }
  .reg-chip-a { animation:regChipFloat 3.6s ease-in-out infinite; }
  .reg-chip-b { animation:regChipFloatB 4.2s ease-in-out infinite .6s; }
  .reg-chip-c { animation:regChipFloat 3.9s ease-in-out infinite 1.2s; }
  .reg-chip-d { animation:regChipFloatB 4.5s ease-in-out infinite 1.8s; }
  .reg-form-in { animation:regFormIn .7s .18s ease both; }
  .reg-bullet-1 { animation:regBulletPop .5s .55s ease both; }
  .reg-bullet-2 { animation:regBulletPop .5s .68s ease both; }
  .reg-bullet-3 { animation:regBulletPop .5s .81s ease both; }
`;

// top pair (0,1) → top row; bottom pair (2,3) → bottom row
// Mirrored arrangement vs login for visual variety
const FEATURE_CHIPS = [
  { emoji: '🎭', label: 'AI Roleplay', sub: '4 modes',      cls: 'reg-chip-a', bg: 'rgba(237,233,254,0.12)', border: 'rgba(196,181,253,0.45)' },
  { emoji: '🎮', label: 'Word Games',  sub: '6 games',      cls: 'reg-chip-b', bg: 'rgba(209,250,229,0.12)', border: 'rgba(110,231,183,0.45)' },
  { emoji: '🤖', label: 'AI Tools',   sub: '4 tools',       cls: 'reg-chip-c', bg: 'rgba(253,244,255,0.12)', border: 'rgba(233,213,255,0.45)' },
  { emoji: '📝', label: 'Test Prep',   sub: 'IELTS + more', cls: 'reg-chip-d', bg: 'rgba(219,234,254,0.12)', border: 'rgba(147,197,253,0.45)' },
];

const BENEFITS = [
  { text: 'Free to join — no credit card needed' },
  { text: 'AI-graded feedback on every session' },
  { text: 'Track progress across all practice modes' },
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

function getStrength(pw: string): { label: string; color: string; pct: number } | null {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Weak',   color: '#ef4444', pct: 25  },
    { label: 'Fair',   color: '#f97316', pct: 50  },
    { label: 'Good',   color: '#eab308', pct: 75  },
    { label: 'Strong', color: '#22c55e', pct: 100 },
  ];
  return levels[Math.max(score - 1, 0)];
}

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services and render the button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google = (window as any).google;
      if (!google || !googleBtnRef.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setGoogleLoading(true);
          setErrors({});
          try {
            await loginWithGoogle(response.credential);
            router.replace('/dashboard');
          } catch {
            setErrors({ non_field_errors: 'Google sign-up failed. Please try again.' });
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 360,
        text: 'signup_with',
        shape: 'pill',
      });
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [loginWithGoogle, router]);

  const strength = getStrength(form.password);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register/', form);
      setSuccess(true);
      setTimeout(() => router.replace('/login?registered=1'), 1800);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (data) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors(flat);
      } else {
        setErrors({ non_field_errors: 'Registration failed. Please try again.' });
      }
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

        {/* Orbs — mirrored positions vs login */}
        <div className="reg-orb-a absolute rounded-full pointer-events-none"
          style={{ width: 520, height: 520, top: -150, left: -110,
            background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 68%)' }} />
        <div className="reg-orb-b absolute rounded-full pointer-events-none"
          style={{ width: 400, height: 400, bottom: -100, right: -110,
            background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)' }} />
        <div className="reg-orb-c absolute rounded-full pointer-events-none"
          style={{ width: 280, height: 280, top: '38%', right: '12%',
            background: 'radial-gradient(circle,rgba(167,139,250,.11) 0%,transparent 68%)' }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.03,
          }} />

        {/*
          Three-zone flex layout — chips in their own rows, center content in flex-1.
          [top chip row]    ← always above center content
          [center content]  ← flex-1, vertically centered
          [bottom chip row] ← always below center content
        */}
        <div className="relative z-10 flex flex-col flex-1">

          {/* ── Top chip row ── */}
          <div className="flex items-center justify-between px-12 pt-10 pb-0">
            <Chip chip={FEATURE_CHIPS[0]} />
            <Chip chip={FEATURE_CHIPS[1]} />
          </div>

          {/* ── Center content ── */}
          <div className="flex-1 flex flex-col justify-center px-14 py-8">

            {/* Brand */}
            <div className="reg-rise-1 flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: BRAND.gradient }}>
                <span className="text-xl font-black" style={{ color: BRAND.primary }}>S</span>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Speechef</span>
            </div>

            {/* Eyebrow */}
            <div className="reg-rise-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-widest w-fit"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
              Free Account
            </div>

            {/* Headline */}
            <h1 className="reg-rise-2 font-black leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(2rem,3.8vw,3.4rem)' }}>
              <span style={{ color: '#fff' }}>Your English</span>
              <br />
              <span style={{
                backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
                backgroundSize: '200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Journey Starts Here.
              </span>
            </h1>

            {/* Sub */}
            <p className="reg-rise-3 text-[0.95rem] font-medium leading-relaxed mb-8 max-w-[340px]"
              style={{ color: 'rgba(255,255,255,0.46)' }}>
              Join thousands of learners using AI-powered tools to master English faster than ever.
            </p>

            {/* Benefits */}
            <div className="reg-rise-4 space-y-3 mb-10">
              {BENEFITS.map((b, i) => (
                <div key={i} className={`reg-bullet-${i + 1} flex items-center gap-3`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: BRAND.gradient }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#141c52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{b.text}</p>
                </div>
              ))}
            </div>

            {/* Already have account */}
            <div className="reg-rise-5">
              <Link href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border transition-all hover:bg-white/10 active:scale-95"
                style={{ borderColor: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.58)' }}>
                Already have an account? Log in →
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
        <div className="reg-form-in w-full max-w-sm">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: BRAND.gradient }}>
              <span className="text-lg font-black" style={{ color: BRAND.primary }}>S</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: BRAND.primary }}>
              Speechef
            </span>
          </div>

          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center text-center gap-6 py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: BRAND.gradient }}>
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                  <path d="M2 11l8 8L26 2" stroke="#141c52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: BRAND.primary }}>Account created!</h2>
                <p className="text-gray-500 text-sm mt-2">Your account is ready. Redirecting you to log in…</p>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                <div className="h-full rounded-full animate-[progress_1.8s_linear_forwards]"
                  style={{ background: BRAND.gradient, width: '0%', animation: 'progress 1.8s linear forwards' }} />
              </div>
              <style dangerouslySetInnerHTML={{ __html: '@keyframes progress { from { width:0% } to { width:100% } }' }} />
            </div>
          ) : (
          <>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold" style={{ color: BRAND.primary }}>Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Start mastering communication today — it&apos;s free</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" required autoComplete="username"
                value={form.username} onChange={field('username')} />
              {errors.username && <p className="text-xs text-red-600">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email"
                value={form.email} onChange={field('email')} />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPw ? 'text' : 'password'} required
                  autoComplete="new-password" value={form.password}
                  onChange={field('password')} className="pr-10" />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password2">Confirm password</Label>
              <div className="relative">
                <Input id="password2" type={showPw2 ? 'text' : 'password'} required
                  autoComplete="new-password" value={form.password2}
                  onChange={field('password2')} className="pr-10" />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPw2 ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password2 && <p className="text-xs text-red-600">{errors.password2}</p>}
            </div>

            {errors.non_field_errors && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {errors.non_field_errors}
              </p>
            )}

            <Button type="submit" disabled={loading}
              className="w-full rounded-full font-bold text-[#141c52] h-11 text-sm tracking-wide transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient }}>
              {loading ? 'Creating account…' : 'Create free account'}
            </Button>
          </form>

          {/* Divider + Google */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div
                ref={googleBtnRef}
                className="w-full flex justify-center"
                style={{ minHeight: 44, opacity: googleLoading ? 0.6 : 1 }}
              />
              {googleLoading && (
                <p className="text-center text-xs text-gray-400 mt-2">Signing up with Google…</p>
              )}
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: BRAND.primary }}>
              Log in
            </Link>
          </p>

          {/* Mobile benefits */}
          <div className="lg:hidden mt-8 pt-7 border-t border-gray-100 space-y-2.5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: BRAND.gradient }}>
                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#141c52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">{b.text}</p>
              </div>
            ))}
          </div>

          </>
          )}
        </div>
      </div>
    </div>
  );
}
