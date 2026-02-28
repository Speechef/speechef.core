'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Mentor {
  id: number;
  name: string;
  bio: string;
  specialties: string[];
  languages: string[];
  hourly_rate: number;
  rating_avg: number;
  review_count: number;
  session_count: number;
  member_since_days: number;
  top_badge: { badge_type: string; name: string; emoji: string } | null;
}

interface MentorDetail extends Mentor {
  credentials: string;
  timezone: string;
  availability: { id: number; day_of_week: string; start_time: string; end_time: string }[];
  bundles: { id: number; name: string; session_count: number; price: number | string }[];
  offers_intro_call: boolean;
  intro_available: boolean;
}

interface RecommendedMentor extends Mentor {
  match_reason: string | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const QUOTES = [
  { text: 'The mentor who knows the way, goes the way, and shows the way.', author: 'John C. Maxwell' },
  { text: 'A good mentor is your biggest supporter and your most demanding critic.', author: 'Unknown' },
  { text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin' },
  { text: 'Behind every great achiever is a mentor who believed in them first.', author: 'Unknown' },
  { text: 'One conversation with the right person can change the trajectory of your life.', author: 'Unknown' },
];

const CARD_ACCENTS = [
  { from: '#141c52', to: '#1e2d78', light: '#dbeafe', ink: '#1e40af' },
  { from: '#3b0764', to: '#6b21a8', light: '#f3e8ff', ink: '#7c3aed' },
  { from: '#064e3b', to: '#065f46', light: '#d1fae5', ink: '#065f46' },
  { from: '#7c2d12', to: '#9a3412', light: '#ffedd5', ink: '#9a3412' },
  { from: '#1e3a5f', to: '#1e40af', light: '#dbeafe', ink: '#1d4ed8' },
];

const SPECIALTY_OPTIONS = ['IELTS', 'TOEFL', 'Business English', 'Public Speaking', 'Accent Reduction', 'Interview Prep'];
const LANGUAGE_OPTIONS  = ['English', 'Hindi', 'Mandarin', 'Arabic', 'Spanish', 'French'];

const DAY_LABEL: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

// ─── Animation styles ──────────────────────────────────────────────────────────

const STYLES = `
  @keyframes floatOrb {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(50px,-35px) scale(1.1); }
    66%      { transform: translate(-30px,25px) scale(0.92); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(44px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes quoteFade {
    0%        { opacity:0; transform:translateY(12px); }
    10%,88%   { opacity:1; transform:translateY(0); }
    100%      { opacity:0; transform:translateY(-8px); }
  }
  @keyframes chevronFloat {
    0%,100% { transform:translateY(0); opacity:0.5; }
    50%     { transform:translateY(9px); opacity:1; }
  }
  @keyframes cardReveal {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes drawerIn {
    from { transform:translateX(105%); }
    to   { transform:translateX(0); }
  }
  @keyframes overlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes badgePulse {
    0%,100% { box-shadow:0 0 0 0 rgba(250,219,67,.45); }
    50%     { box-shadow:0 0 0 10px rgba(250,219,67,0); }
  }
  @keyframes statCount {
    from { opacity:0; transform:scale(0.7); }
    to   { opacity:1; transform:scale(1); }
  }
  .orb-1 { animation:floatOrb 14s ease-in-out infinite; }
  .orb-2 { animation:floatOrb 18s ease-in-out infinite reverse; }
  .orb-3 { animation:floatOrb 10s ease-in-out infinite 4s; }
  .orb-4 { animation:floatOrb 22s ease-in-out infinite 2s reverse; }
  .hero-1 { animation:fadeSlideUp .9s ease both; }
  .hero-2 { animation:fadeSlideUp .9s .2s ease both; }
  .hero-3 { animation:fadeSlideUp .9s .38s ease both; }
  .hero-4 { animation:fadeSlideUp .9s .55s ease both; }
  .chevron-anim { animation:chevronFloat 2s ease-in-out infinite; }
  .drawer-anim  { animation:drawerIn .38s cubic-bezier(.16,1,.3,1) forwards; }
  .overlay-anim { animation:overlayIn .25s ease forwards; }
  .badge-pulse  { animation:badgePulse 2.5s ease-in-out infinite; }
  .stat-anim    { animation:statCount .5s ease both; }
`;

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({ onScrollDown }: { onScrollDown: () => void }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteKey, setQuoteKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
      setQuoteKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#080d26 0%,#141c52 45%,#1a2460 100%)' }}
    >
      {/* Floating orbs */}
      <div className="orb-1 absolute w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ top: '-160px', right: '-120px', background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 70%)' }} />
      <div className="orb-2 absolute w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ bottom: '-100px', left: '-140px', background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%)' }} />
      <div className="orb-3 absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ top: '30%', left: '15%', background: 'radial-gradient(circle,rgba(167,139,250,.1) 0%,transparent 70%)' }} />
      <div className="orb-4 absolute w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{ bottom: '25%', right: '20%', background: 'radial-gradient(circle,rgba(96,165,250,.1) 0%,transparent 70%)' }} />

      {/* Fine grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Label chip */}
        <div className="hero-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
          Speechef Mentors
        </div>

        {/* Main headline */}
        <h1 className="hero-2 font-black leading-[1.05] mb-4" style={{ fontSize: 'clamp(3rem,8vw,5.5rem)' }}>
          <span style={{ color: '#fff' }}>Find Your</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Mentor.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="hero-3 text-lg font-medium mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Work 1-on-1 with certified English coaches. Book in minutes, transform your communication.
        </p>

        {/* Rotating quote */}
        <div className="hero-4 relative h-20 flex flex-col items-center justify-center mb-10">
          <div
            key={quoteKey}
            className="quote-anim absolute text-center px-6"
          >
            <p className="text-sm italic font-medium mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              &ldquo;{q.text}&rdquo;
            </p>
            <p className="text-xs font-semibold" style={{ color: 'rgba(250,219,67,0.6)' }}>— {q.author}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="hero-4 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={onScrollDown}
            className="px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{ background: BRAND.gradient, color: BRAND.primary, boxShadow: '0 8px 30px rgba(250,219,67,.35)' }}
          >
            Browse Mentors ↓
          </button>
          <Link
            href="/mentors/sessions"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
          >
            My Sessions
          </Link>
        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="chevron-anim absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>Scroll</span>
        <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom,transparent,#f4f6fb)' }} />
    </section>
  );
}

// ─── Stat box ──────────────────────────────────────────────────────────────────

function StatBox({
  icon, value, label, delay = 0,
}: { icon: string; value: string | number; label: string; delay?: number }) {
  return (
    <div
      className="stat-anim flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.07)', animationDelay: `${delay}s` }}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-sm font-extrabold text-white leading-tight">{value}</span>
      <span className="text-[9px] uppercase tracking-wide leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  );
}

// ─── Mentor card ───────────────────────────────────────────────────────────────

function MentorCard({
  mentor, index, onSelect,
}: { mentor: Mentor; index: number; onSelect: (id: number) => void }) {
  const accent = CARD_ACCENTS[mentor.id % CARD_ACCENTS.length];
  const delay  = (index % 6) * 0.07;

  return (
    <article
      className="cardReveal group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        background: '#fff',
        boxShadow: '0 4px 24px rgba(20,28,82,0.08)',
        animation: `cardReveal .55s ${delay}s ease both`,
        border: '1.5px solid rgba(20,28,82,0.06)',
      }}
      onClick={() => onSelect(mentor.id)}
    >
      {/* Dark gradient header */}
      <div
        className="relative px-6 pt-6 pb-14 overflow-hidden"
        style={{ background: `linear-gradient(135deg,${accent.from} 0%,${accent.to} 100%)` }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute right-12 bottom-[-28px] w-20 h-20 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)' }} />

        {/* Top row: avatar + price tag */}
        <div className="relative flex items-start justify-between gap-3">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)' }}
            >
              {mentor.name[0].toUpperCase()}
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
              style={{ background: '#22c55e' }} />
          </div>

          {/* Price tag */}
          <div
            className="flex flex-col items-end px-3.5 py-2 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-2xl font-black text-white leading-none">${mentor.hourly_rate}</span>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>per hour</span>
          </div>
        </div>

        {/* Name + badge */}
        <div className="relative mt-4">
          <h3 className="text-xl font-extrabold text-white leading-tight">{mentor.name}</h3>
          {mentor.top_badge && (
            <span
              className="badge-pulse inline-flex items-center gap-1 mt-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              {mentor.top_badge.emoji} {mentor.top_badge.name}
            </span>
          )}
        </div>

        {/* 4-stat row (overlapping bottom of header) */}
        <div className="relative mt-4 grid grid-cols-4 gap-1.5">
          <StatBox icon="⭐" value={Number(mentor.rating_avg).toFixed(1)} label="Rating"  delay={delay + 0.1} />
          <StatBox icon="🎓" value={mentor.session_count}                label="Sessions" delay={delay + 0.15} />
          <StatBox icon="💬" value={mentor.review_count}                 label="Reviews"  delay={delay + 0.2} />
          <StatBox icon="📅" value={mentor.member_since_days ?? '—'}     label="Days"     delay={delay + 0.25} />
        </div>
      </div>

      {/* White body — pulled up to overlap */}
      <div className="px-6 pt-5 pb-5 -mt-2 relative z-10 bg-white rounded-t-2xl">

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(mentor.specialties ?? []).slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: accent.light, color: accent.ink }}
            >
              {s}
            </span>
          ))}
          {(mentor.specialties ?? []).length > 3 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500">
              +{mentor.specialties.length - 3}
            </span>
          )}
          {(mentor.languages ?? []).slice(0, 2).map((l) => (
            <span key={l} className="text-[10px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400">{l}</span>
          ))}
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{mentor.bio}</p>

        {/* Action row */}
        <div className="flex gap-2">
          <button
            className="flex-1 text-xs font-bold py-2.5 rounded-xl border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: '#e5e7eb', color: '#374151' }}
            onClick={(e) => { e.stopPropagation(); onSelect(mentor.id); }}
          >
            View Profile
          </button>
          <Link
            href={`/mentors/${mentor.id}#book`}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl text-center transition-all hover:opacity-90"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
            onClick={(e) => e.stopPropagation()}
          >
            Book Session →
          </Link>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 0 2px ${accent.to}40` }}
      />
    </article>
  );
}

// ─── Profile drawer ────────────────────────────────────────────────────────────

function ProfileDrawer({
  mentorId, onClose, followedIds, onToggleFollow,
}: {
  mentorId: number;
  onClose: () => void;
  followedIds: Set<number>;
  onToggleFollow: (id: number) => void;
}) {
  const isFollowed = followedIds.has(mentorId);
  const accent     = CARD_ACCENTS[mentorId % CARD_ACCENTS.length];

  const { data: mentor, isLoading } = useQuery<MentorDetail>({
    queryKey: ['mentor', mentorId],
    queryFn: () => api.get(`/mentors/${mentorId}/`).then((r) => r.data),
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay-anim fixed inset-0 z-40 cursor-pointer"
        style={{ background: 'rgba(8,13,38,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="drawer-anim fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(520px, 100vw)',
          background: '#fff',
          boxShadow: '-12px 0 60px rgba(8,13,38,0.2)',
        }}
      >
        {/* Close bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Mentor Profile</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-4 p-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : mentor ? (
            <>
              {/* Hero band */}
              <div
                className="relative px-7 pt-7 pb-8 overflow-hidden"
                style={{ background: `linear-gradient(135deg,${accent.from} 0%,${accent.to} 100%)` }}
              >
                <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="absolute left-0 bottom-0 w-full h-8" style={{ background: 'linear-gradient(to bottom,transparent,rgba(0,0,0,0.1))' }} />

                {/* Top row */}
                <div className="relative flex items-start gap-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white flex-shrink-0 shadow-xl"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}
                  >
                    {mentor.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-extrabold text-white leading-tight">{mentor.name}</h2>
                    {mentor.top_badge && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                        style={{ background: BRAND.gradient, color: BRAND.primary }}>
                        {mentor.top_badge.emoji} {mentor.top_badge.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="w-4 h-4" fill={i < Math.round(Number(mentor.rating_avg)) ? '#FADB43' : 'rgba(255,255,255,0.2)'} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm font-bold text-white ml-1">{Number(mentor.rating_avg).toFixed(1)}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>({mentor.review_count} reviews)</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-black text-white">${mentor.hourly_rate}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>per hour</p>
                  </div>
                </div>

                {/* 4-stat row */}
                <div className="relative mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: '⭐', val: Number(mentor.rating_avg).toFixed(1), lab: 'Rating' },
                    { icon: '🎓', val: mentor.session_count,                  lab: 'Sessions' },
                    { icon: '💬', val: mentor.review_count,                   lab: 'Reviews' },
                    { icon: '📅', val: `${mentor.member_since_days ?? 0}d`,   lab: 'On Platform' },
                  ].map((s) => (
                    <div key={s.lab} className="flex flex-col items-center gap-0.5 py-3 rounded-2xl"
                      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)' }}>
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-base font-extrabold text-white">{s.val}</span>
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.lab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body content */}
              <div className="px-7 py-6 space-y-6">

                {/* Skills + languages */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Skills & Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {(mentor.specialties ?? []).map((s) => (
                      <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: accent.light, color: accent.ink }}>{s}</span>
                    ))}
                    {(mentor.languages ?? []).map((l) => (
                      <span key={l} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">About</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{mentor.bio || 'No bio provided.'}</p>
                </div>

                {/* Credentials */}
                {mentor.credentials && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Credentials</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{mentor.credentials}</p>
                  </div>
                )}

                {/* Availability */}
                {mentor.availability.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Availability</p>
                    <div className="grid grid-cols-2 gap-2">
                      {mentor.availability.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                          <span className="font-semibold text-gray-700">{DAY_LABEL[slot.day_of_week]}</span>
                          <span className="text-gray-400 text-xs">{slot.start_time} – {slot.end_time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Packages */}
                {mentor.bundles && mentor.bundles.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Session Packages</p>
                    <div className="space-y-2">
                      {mentor.bundles.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: BRAND.primary }}>{b.name}</p>
                            <p className="text-xs text-gray-400">{b.session_count} sessions</p>
                          </div>
                          <p className="text-xl font-black" style={{ color: BRAND.primary }}>${b.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intro call notice */}
                {mentor.offers_intro_call && mentor.intro_available && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
                    <span className="text-xl mt-0.5">🎁</span>
                    <div>
                      <p className="text-sm font-bold text-green-700">Free 15-min intro call available</p>
                      <p className="text-xs text-green-600 mt-0.5">Meet this mentor before committing to a full session.</p>
                    </div>
                  </div>
                )}

                {/* Spacer so sticky footer doesn't overlap content */}
                <div className="h-4" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <p className="text-4xl">👤</p>
              <p className="text-sm">Mentor not found</p>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {mentor && (
          <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex gap-3" style={{ background: '#fff' }}>
            {/* Follow */}
            <button
              onClick={() => onToggleFollow(mentorId)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all hover:scale-105 active:scale-95"
              style={isFollowed
                ? { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }
                : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
            >
              {isFollowed ? '❤️ Following' : '🤍 Follow'}
            </button>

            {/* Book */}
            <Link
              href={`/mentors/${mentorId}#book`}
              className="flex-1 text-center py-3 rounded-2xl text-sm font-extrabold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: BRAND.gradient, color: BRAND.primary, boxShadow: '0 4px 16px rgba(250,219,67,.3)' }}
            >
              Book Session →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Filters bar ───────────────────────────────────────────────────────────────

function FiltersBar({
  specialty, language, sortBy, search,
  onSpecialty, onLanguage, onSort, onSearch, onClear,
}: {
  specialty: string; language: string; sortBy: string; search: string;
  onSpecialty: (v: string) => void; onLanguage: (v: string) => void;
  onSort: (v: string) => void; onSearch: (v: string) => void; onClear: () => void;
}) {
  return (
    <div className="space-y-3 mb-8">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, specialty, or keyword…"
          className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 shadow-sm transition-shadow"
        />
        {search && (
          <button onClick={onClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
        )}
      </div>

      {/* Filter pills row */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={specialty}
          onChange={(e) => onSpecialty(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3.5 py-2 bg-white text-gray-600 outline-none focus:ring-2 focus:ring-[#141c52]/20"
        >
          <option value="">All Specialties</option>
          {SPECIALTY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={language}
          onChange={(e) => onLanguage(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3.5 py-2 bg-white text-gray-600 outline-none focus:ring-2 focus:ring-[#141c52]/20"
        >
          <option value="">All Languages</option>
          {LANGUAGE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3.5 py-2 bg-white text-gray-600 outline-none focus:ring-2 focus:ring-[#141c52]/20"
        >
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        {(specialty || language || search) && (
          <button onClick={onClear} className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            Clear all ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Recommended strip ─────────────────────────────────────────────────────────

function RecommendedStrip({ onSelect }: { onSelect: (id: number) => void }) {
  const { data: recommended = [], isLoading } = useQuery<RecommendedMentor[]>({
    queryKey: ['mentors-recommended'],
    queryFn: () => api.get('/mentors/recommended/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || recommended.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Recommended for You</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43]" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {recommended.map((m) => {
          const accent = CARD_ACCENTS[m.id % CARD_ACCENTS.length];
          return (
            <div
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="group flex-shrink-0 w-64 rounded-2xl overflow-hidden cursor-pointer border-2 hover:shadow-lg transition-all hover:-translate-y-1"
              style={{ borderColor: '#FADB43' }}
            >
              <div className="relative px-4 py-4" style={{ background: `linear-gradient(135deg,${accent.from},${accent.to})` }}>
                <div className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-xl text-[10px] font-extrabold"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}>✦ Pick</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)' }}>{m.name[0]}</div>
                  <div>
                    <p className="font-bold text-sm text-white">{m.name}</p>
                    <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>${m.hourly_rate}/hr</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-white">
                {m.match_reason && <p className="text-xs font-semibold text-indigo-600 mb-2">✓ {m.match_reason}</p>}
                <button
                  className="w-full py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}
                >
                  View Profile →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main content ──────────────────────────────────────────────────────────────

function MentorsContent() {
  const { isLoggedIn } = useAuthStore();
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const gridRef        = useRef<HTMLDivElement>(null);

  const specialty = searchParams.get('specialty') ?? '';
  const language  = searchParams.get('language') ?? '';
  const sortBy    = (searchParams.get('sort') ?? 'rating') as 'rating' | 'price_asc' | 'price_desc';
  const [search, setSearch]         = useState(searchParams.get('search') ?? '');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());

  function pushParams(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(specialty ? { specialty } : {}),
      ...(language  ? { language }  : {}),
      ...(sortBy !== 'rating' ? { sort: sortBy } : {}),
      ...(search    ? { search }    : {}),
      ...overrides,
    });
    for (const [k, v] of [...p.entries()]) { if (!v) p.delete(k); }
    router.push(`/mentors${p.size ? `?${p}` : ''}`);
  }

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleFollow(id: number) {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const { data: mentors = [], isLoading } = useQuery<Mentor[]>({
    queryKey: ['mentors', specialty, language],
    queryFn: () => {
      const params = new URLSearchParams();
      if (specialty) params.set('specialty', specialty);
      if (language)  params.set('language', language);
      return api.get(`/mentors/?${params}`).then((r) => r.data);
    },
  });

  const searchLower  = search.toLowerCase();
  const filtered     = search
    ? mentors.filter((m) => m.name.toLowerCase().includes(searchLower) || m.bio.toLowerCase().includes(searchLower) || (m.specialties ?? []).some((s) => s.toLowerCase().includes(searchLower)))
    : mentors;
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc')  return Number(a.hourly_rate) - Number(b.hourly_rate);
    if (sortBy === 'price_desc') return Number(b.hourly_rate) - Number(a.hourly_rate);
    return Number(b.rating_avg ?? 0) - Number(a.rating_avg ?? 0);
  });

  return (
    <div style={{ background: '#f4f6fb' }}>
      {/* Inject keyframes */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Drawer overlay */}
      {selectedId !== null && (
        <ProfileDrawer
          mentorId={selectedId}
          onClose={() => setSelectedId(null)}
          followedIds={followedIds}
          onToggleFollow={toggleFollow}
        />
      )}

      {/* Hero */}
      <HeroSection onScrollDown={scrollToGrid} />

      {/* Grid section */}
      <div ref={gridRef} className="max-w-6xl mx-auto px-4 py-16">

        {/* Section label */}
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Our Experts</p>
            <h2 className="text-3xl font-extrabold" style={{ color: BRAND.primary }}>
              {sorted.length > 0 ? `${sorted.length} Mentor${sorted.length !== 1 ? 's' : ''}` : 'Browse Mentors'}
            </h2>
          </div>
          {isLoggedIn && (
            <Link href="/mentors/sessions"
              className="text-sm font-bold px-4 py-2 rounded-full border-2 transition-all hover:bg-white"
              style={{ borderColor: BRAND.primary, color: BRAND.primary }}>
              My Sessions →
            </Link>
          )}
        </div>

        {/* Recommended */}
        {isLoggedIn && !specialty && !language && !search && (
          <RecommendedStrip onSelect={setSelectedId} />
        )}

        {/* Filters */}
        <FiltersBar
          specialty={specialty} language={language} sortBy={sortBy} search={search}
          onSpecialty={(v) => pushParams({ specialty: v })}
          onLanguage={(v) => pushParams({ language: v })}
          onSort={(v) => pushParams({ sort: v === 'rating' ? '' : v })}
          onSearch={setSearch}
          onClear={() => { setSearch(''); router.push('/mentors'); }}
        />

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">👩‍🏫</p>
            <p className="font-bold text-lg" style={{ color: BRAND.primary }}>No mentors found</p>
            <p className="text-sm mt-2">Try adjusting your filters or search.</p>
            <button onClick={() => { setSearch(''); router.push('/mentors'); }} className="mt-5 text-sm font-semibold text-indigo-600 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sorted.map((m, i) => (
              <MentorCard key={m.id} mentor={m} index={i} onSelect={setSelectedId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

export default function MentorsPage() {
  return (
    <Suspense>
      <MentorsContent />
    </Suspense>
  );
}
