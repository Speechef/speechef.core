'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const CATEGORIES = [
  { value: '',              label: 'All' },
  { value: 'grammar',       label: 'Grammar' },
  { value: 'vocabulary',    label: 'Vocabulary' },
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'test_prep',     label: 'Test Prep' },
  { value: 'writing',       label: 'Writing' },
  { value: 'general',       label: 'General' },
];

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  grammar:       { bg: '#dbeafe', text: '#1e40af' },
  vocabulary:    { bg: '#ede9fe', text: '#6d28d9' },
  pronunciation: { bg: '#fce7f3', text: '#9d174d' },
  test_prep:     { bg: '#dcfce7', text: '#166534' },
  writing:       { bg: '#fef3c7', text: '#92400e' },
  general:       { bg: '#f3f4f6', text: '#374151' },
};

interface Thread {
  id: number;
  title: string;
  body: string;
  category: string;
  is_pinned: boolean;
  vote_count: number;
  reply_count: number;
  author: string;
  created_at: string;
}

// ─── Hero styles ───────────────────────────────────────────────────────────────

const HERO_STYLES = `
  @keyframes commOrbA {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(50px,-40px) scale(1.1); }
    66%      { transform:translate(-35px,30px) scale(0.92); }
  }
  @keyframes commOrbB {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(-45px,35px) scale(1.08); }
    66%      { transform:translate(30px,-25px) scale(0.95); }
  }
  @keyframes commRise {
    from { opacity:0; transform:translateY(48px) scale(0.96); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes commChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes commCtaGlow {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  @keyframes floatY {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-8px); }
  }
  .comm-orb-a1 { animation:commOrbA 14s ease-in-out infinite; }
  .comm-orb-a2 { animation:commOrbB 19s ease-in-out infinite; }
  .comm-orb-a3 { animation:commOrbA 11s ease-in-out infinite 3s; }
  .comm-rise-1 { animation:commRise .85s ease both; }
  .comm-rise-2 { animation:commRise .85s .18s ease both; }
  .comm-rise-3 { animation:commRise .85s .34s ease both; }
  .comm-rise-4 { animation:commRise .85s .52s ease both; }
  .comm-chev   { animation:commChev 1.9s ease-in-out infinite; }
  .comm-cta-a  { animation:commCtaGlow 3s ease-in-out infinite; }
  .float-y     { animation:floatY 3.5s ease-in-out infinite; }
`;

// Stats

const HERO_STATS = [
  { value: '12k+', label: 'Members',   icon: '👥' },
  { value: '3.4k',  label: 'Threads',   icon: '💬' },
  { value: '98%',   label: 'Answered',  icon: '✅' },
];

// ─── Community Hero ────────────────────────────────────────────────────────────

function CommunityHero({ contentRef }: { contentRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      <div
        className="relative w-full h-full flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)' }}
      >
        {/* Orbs */}
        <div className="comm-orb-a1 absolute rounded-full pointer-events-none"
          style={{ width: 540, height: 540, top: -150, right: -110,
            background: 'radial-gradient(circle,rgba(250,219,67,.12) 0%,transparent 68%)' }} />
        <div className="comm-orb-a2 absolute rounded-full pointer-events-none"
          style={{ width: 420, height: 420, bottom: -100, left: -130,
            background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)' }} />
        <div className="comm-orb-a3 absolute rounded-full pointer-events-none"
          style={{ width: 280, height: 280, top: '35%', left: '10%',
            background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 68%)' }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Center content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">

          {/* Chip */}
          <div
            className="comm-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
            Peer Community
          </div>

          {/* Headline */}
          <h1
            className="comm-rise-2 font-black leading-[1.04] mb-4"
            style={{ fontSize: 'clamp(2.8rem,8vw,5rem)' }}
          >
            <span style={{ color: '#fff' }}>Learn Together,</span>
            <br />
            <span style={{
              backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
              backgroundSize: '200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Grow Faster.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="comm-rise-3 text-base font-medium mb-8 max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.48)' }}
          >
            Join 12,000+ English learners. Ask questions, share answers, grow together.
          </p>

          {/* Mini stat row */}
          <div className="comm-rise-3 flex items-center justify-center gap-6 mb-10">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="float-y text-center">
                <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="comm-rise-4 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/community/new"
              className="comm-cta-a px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Ask a Question ↓
            </Link>
            <button
              onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
            >
              Browse Threads →
            </button>
          </div>
        </div>

        {/* Chevron */}
        <div className="comm-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
          <span className="text-[0.58rem] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'rgba(255,255,255,0.38)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Bottom fade into content bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom,transparent,#f4f6fb)' }}
        />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch]     = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading } = useQuery<Thread[]>({
    queryKey: ['community-threads', category, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search)   params.set('search', search);
      return api.get(`/community/threads/?${params}`).then((r) => r.data);
    },
  });

  return (
    <div className="min-h-screen" style={{ background: '#f4f6fb' }}>

      {/* ── Hero — scene swap on scroll ── */}
      <CommunityHero contentRef={contentRef} />

      {/* ── Content ── */}
      <div ref={contentRef} className="py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>Community</h1>
              <p className="text-sm text-gray-500 mt-0.5">Ask questions, share tips, help others improve their English.</p>
            </div>
            <Link
              href="/community/new"
              className="px-5 py-2.5 rounded-full text-sm font-bold shrink-0"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              + Ask a Question
            </Link>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads…"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 shadow-sm"
          />

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
                style={category === c.value
                  ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                  : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Thread list */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
            </div>
          ) : threads && threads.length > 0 ? (
            <div className="space-y-3">
              {threads.map((t) => {
                const catColor = CAT_COLORS[t.category] ?? CAT_COLORS.general;
                return (
                  <Link
                    key={t.id}
                    href={`/community/${t.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {t.is_pinned && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">📌 Pinned</span>
                          )}
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: catColor.bg, color: catColor.text }}
                          >
                            {t.category.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm group-hover:underline leading-snug" style={{ color: BRAND.primary }}>
                          {t.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{t.body}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>by <span className="font-medium text-gray-600">@{t.author}</span></span>
                      <span>{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>▲ {t.vote_count}</span>
                      <span>💬 {t.reply_count}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">No threads yet. Be the first to ask a question!</p>
              <Link
                href="/community/new"
                className="mt-4 inline-block px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                Ask Now →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
