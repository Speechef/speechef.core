'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const EMPLOYMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  full_time: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  part_time: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  contract:  { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  freelance: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
};
const DEFAULT_JOB_COLOR = { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract:  'Contract',
  freelance: 'Freelance',
};

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  employment_type: string;
  job_rate: number | null;
  min_speechef_score: number | null;
  is_featured: boolean;
  date: string;
  url: string;
}

// ─── Hero styles ───────────────────────────────────────────────────────────────

const HERO_STYLES = `
  @keyframes heroOrbDrift {
    0%,100% { transform: translate(0,0) scale(1); }
    30%      { transform: translate(45px,-35px) scale(1.1); }
    65%      { transform: translate(-30px,28px) scale(0.93); }
  }
  @keyframes heroRise {
    from { opacity:0; transform:translateY(50px) scale(0.96); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes heroChevron {
    0%,100% { transform:translateY(0); opacity:0.45; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes ctaGlow {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 48px rgba(250,219,67,.55); }
  }
  .hero-orb-a { animation: heroOrbDrift 14s ease-in-out infinite; }
  .hero-orb-b { animation: heroOrbDrift 19s ease-in-out infinite reverse; }
  .hero-orb-c { animation: heroOrbDrift 11s ease-in-out infinite 4s; }
  .hero-orb-d { animation: heroOrbDrift 23s ease-in-out infinite 2s reverse; }
  .hero-rise-1 { animation: heroRise .85s ease both; }
  .hero-rise-2 { animation: heroRise .85s .18s ease both; }
  .hero-rise-3 { animation: heroRise .85s .34s ease both; }
  .hero-rise-4 { animation: heroRise .85s .52s ease both; }
  .hero-chev  { animation: heroChevron 1.9s ease-in-out infinite; }
  .hero-cta   { animation: ctaGlow 3s ease-in-out infinite; }
`;

// ─── Hero ──────────────────────────────────────────────────────────────────────

function JobsHero({
  onScrollDown,
  totalJobs,
  qualifyingCount,
  latestScore,
  isLoggedIn,
  canForYou,
}: {
  onScrollDown: () => void;
  totalJobs: number;
  qualifyingCount: number;
  latestScore: number | null | undefined;
  isLoggedIn: boolean;
  canForYou: boolean;
}) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const circle         = Math.max(0, 150 - e * 158);
  const contentOpacity = Math.max(0, 1 - e * 1.9);
  const contentScale   = 1 + e * 0.12;
  const chevOpacity    = Math.max(0, 1 - e * 3);

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      {/* Dark background — clips to circle as scroll progresses */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
        clipPath: `circle(${circle}% at 50% 42%)`,
      }} />

      {/* Orbs */}
      <div className="hero-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 560, height: 560, top: -160, right: -120,
          background: 'radial-gradient(circle,rgba(250,219,67,.13) 0%,transparent 68%)',
          clipPath: `circle(${circle}% at 50% 42%)` }} />
      <div className="hero-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 440, height: 440, bottom: -110, left: -130,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `circle(${circle}% at 50% 42%)` }} />
      <div className="hero-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 310, height: 310, top: '32%', left: '12%',
          background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 68%)',
          clipPath: `circle(${circle}% at 50% 42%)` }} />
      <div className="hero-orb-d absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, bottom: '22%', right: '15%',
          background: 'radial-gradient(circle,rgba(96,165,250,.11) 0%,transparent 68%)',
          clipPath: `circle(${circle}% at 50% 42%)` }} />

      {/* Fine grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: Math.max(0, 0.035 - e * 0.035),
        clipPath: `circle(${circle}% at 50% 42%)`,
      }} />

      {/* Two-column content */}
      <div
        className="absolute inset-0 flex items-center z-10"
        style={{ opacity: contentOpacity, transform: `scale(${contentScale})`, transformOrigin: 'center center' }}
      >
        <div className="w-full max-w-6xl mx-auto px-8 flex items-center gap-12">

          {/* Left: headline + CTAs */}
          <div className="flex-1 text-left">
            <div className="hero-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
              Speechef Jobs Board
            </div>

            <h1 className="hero-rise-2 font-black leading-[1.02] mb-4"
              style={{ fontSize: 'clamp(2.4rem,5vw,4.5rem)' }}>
              <span style={{ color: '#fff' }}>Land the Job</span>
              <br />
              <span style={{
                backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
                backgroundSize: '200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                You Deserve.
              </span>
            </h1>

            <p className="hero-rise-3 text-base font-medium mb-10 max-w-md"
              style={{ color: 'rgba(255,255,255,0.48)' }}>
              Companies that hire for communication excellence. Apply with your Speechef score and stand out.
            </p>

            <div className="hero-rise-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={onScrollDown}
                className="hero-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                Browse Jobs ↓
              </button>
              <Link
                href="/jobs/post"
                className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
              >
                Post a Job →
              </Link>
            </div>
          </div>

          {/* Right: stats glass card */}
          <div className="hero-rise-4 w-72 shrink-0 hidden sm:block">
            <div className="rounded-2xl p-6" style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}>
              {/* Stats */}
              <div className="flex items-center gap-4 mb-5">
                <div>
                  <p className="text-3xl font-black text-white leading-none">{totalJobs}</p>
                  <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Jobs</p>
                </div>
                {canForYou && (
                  <>
                    <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{qualifyingCount}</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>For You</p>
                    </div>
                  </>
                )}
                {isLoggedIn && latestScore != null && (
                  <>
                    <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{latestScore}</p>
                      <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Score</p>
                    </div>
                  </>
                )}
              </div>

              {/* Speechef score bar */}
              {isLoggedIn && latestScore != null ? (
                <>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Speechef score</span>
                    <span className="font-semibold text-white">{latestScore} / 100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${latestScore}%`, background: BRAND.gradient }}
                    />
                  </div>
                </>
              ) : isLoggedIn ? (
                <Link href="/analyze" className="text-xs font-semibold hover:underline" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Get your Speechef score →
                </Link>
              ) : (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Log in to see your score match</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="hero-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
        style={{ opacity: chevOpacity }}
        aria-label="Scroll down"
      >
        <span className="text-[0.58rem] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.32)' }}>Scroll</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'rgba(255,255,255,0.38)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Gradient fade-to-content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom,transparent,#f9fafb)' }} />
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreMatchBadge({ required, userScore }: { required: number | null; userScore: number | null }) {
  if (!required) return null;
  if (userScore === null) {
    return (
      <span className="inline-block text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-400">
        Score ≥ {required} required
      </span>
    );
  }
  const qualifies = userScore >= required;
  return (
    <span
      className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold"
      style={qualifies
        ? { backgroundColor: '#dcfce7', color: '#166534' }
        : { backgroundColor: '#fef3c7', color: '#92400e' }
      }
    >
      {qualifies ? `✅ You qualify (${userScore} ≥ ${required})` : `⚠️ ${required - userScore} pts away`}
    </span>
  );
}

// ── Big square carousel card ──────────────────────────────────────────────────

const CARD_W = 340;
const CARD_H = 420;
const CARD_GAP = 28;

function BigJobCard({ job, userScore, active }: { job: Job; userScore: number | null; active: boolean }) {
  const ec = EMPLOYMENT_COLORS[job.employment_type] ?? DEFAULT_JOB_COLOR;
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        border: `2px solid ${active ? ec.border : '#e5e7eb'}`,
        boxShadow: active
          ? '0 24px 64px rgba(20,28,82,0.18), 0 4px 16px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Coloured header */}
      <div
        className="relative px-6 pt-7 pb-6 shrink-0"
        style={{ background: ec.bg, minHeight: 180 }}
      >
        <div className="absolute top-[-30px] right-[-30px] w-28 h-28 rounded-full"
          style={{ background: ec.text, opacity: 0.08 }} />
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 rounded-full"
          style={{ background: ec.text, opacity: 0.06 }} />

        {job.is_featured && (
          <span
            className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-full font-bold z-10"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            Featured
          </span>
        )}

        <div
          className="relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-extrabold text-white mb-4 shrink-0"
          style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}
        >
          {(job.company?.[0] ?? '?').toUpperCase()}
        </div>

        <h2
          className="relative text-lg font-extrabold leading-snug line-clamp-2"
          style={{ color: BRAND.primary }}
        >
          {job.title}
        </h2>
        <p className="relative text-sm font-semibold mt-0.5" style={{ color: ec.text }}>
          {job.company}
        </p>
      </div>

      {/* White body */}
      <div className="bg-white flex-1 px-6 py-5 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">
              {job.remote ? '🌍 Remote' : `📍 ${job.location}`}
            </span>
            {job.employment_type && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: ec.bg, color: ec.text }}
              >
                {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}
              </span>
            )}
          </div>

          {job.job_rate ? (
            <p className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>
              ${job.job_rate.toLocaleString()}
              <span className="text-sm font-normal text-gray-400"> /yr</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">Salary not listed</p>
          )}

          <ScoreMatchBadge required={job.min_speechef_score} userScore={userScore} />
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="mt-4 block text-center py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
          style={{ background: BRAND.gradient, color: BRAND.primary }}
          onClick={(e) => e.stopPropagation()}
        >
          View Job →
        </Link>
      </div>
    </div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────────

function JobCarousel({ jobs, userScore }: { jobs: Job[]; userScore: number | null }) {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setWrapW(wrapRef.current?.offsetWidth ?? 0);
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { setActive(0); }, [jobs.length]);

  const clamp = useCallback((i: number) => Math.max(0, Math.min(jobs.length - 1, i)), [jobs.length]);
  const prev = useCallback(() => setActive((i) => clamp(i - 1)), [clamp]);
  const next = useCallback(() => setActive((i) => clamp(i + 1)), [clamp]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  if (jobs.length === 0) return null;

  const translateX = wrapW / 2 - active * (CARD_W + CARD_GAP) - CARD_W / 2;

  return (
    <div className="relative" ref={wrapRef}>
      <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }} />

      <div
        className="overflow-hidden py-10"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const diff = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
          touchX.current = null;
        }}
      >
        <div
          className="flex items-center"
          style={{
            gap: CARD_GAP,
            transform: `translateX(${translateX}px)`,
            transition: 'transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          {jobs.map((job, i) => {
            const dist = i - active;
            const isCenter = dist === 0;
            const isAdjacent = Math.abs(dist) === 1;
            return (
              <div
                key={job.id}
                className="shrink-0 cursor-pointer"
                style={{
                  width: CARD_W,
                  transform: `scale(${isCenter ? 1 : isAdjacent ? 0.8 : 0.68})`,
                  opacity: isCenter ? 1 : isAdjacent ? 0.52 : 0,
                  transition: 'transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.38s ease',
                  transformOrigin: 'center center',
                  pointerEvents: Math.abs(dist) <= 2 ? 'auto' : 'none',
                  zIndex: isCenter ? 10 : 5 - Math.abs(dist),
                  position: 'relative',
                }}
                onClick={() => { if (!isCenter) setActive(i); }}
              >
                <BigJobCard job={job} userScore={userScore} active={isCenter} />
              </div>
            );
          })}
        </div>
      </div>

      {active > 0 && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
          style={{ background: '#fff', border: '2px solid #e5e7eb', color: BRAND.primary }}
          aria-label="Previous job"
        >
          ‹
        </button>
      )}

      {active < jobs.length - 1 && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
          style={{ background: '#fff', border: '2px solid #e5e7eb', color: BRAND.primary }}
          aria-label="Next job"
        >
          ›
        </button>
      )}

      <div className="flex items-center justify-center gap-1.5 mt-2 pb-2">
        {jobs.length <= 12 ? (
          jobs.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                backgroundColor: i === active ? BRAND.primary : '#d1d5db',
              }}
              aria-label={`Go to job ${i + 1}`}
            />
          ))
        ) : (
          <span className="text-sm text-gray-400 font-medium">
            {active + 1} <span className="text-gray-300">/</span> {jobs.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Skeleton carousel ─────────────────────────────────────────────────────────

function CarouselSkeleton() {
  return (
    <div className="relative overflow-hidden py-10">
      <div className="flex items-center justify-center gap-7">
        {[-1, 0, 1].map((offset) => (
          <div
            key={offset}
            className="shrink-0 rounded-2xl animate-pulse bg-white border border-gray-100"
            style={{
              width: CARD_W,
              height: CARD_H,
              transform: `scale(${offset === 0 ? 1 : 0.8})`,
              opacity: offset === 0 ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function JobsContent() {
  const { isLoggedIn } = useAuthStore();
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const contentRef    = useRef<HTMLDivElement>(null);

  const filterRemote = searchParams.get('remote') ?? '';
  const filterType   = searchParams.get('type') ?? '';
  const sortBy       = (searchParams.get('sort') ?? 'newest') as 'newest' | 'salary_desc' | 'score_asc';
  const forYou       = searchParams.get('forYou') === '1';
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  function pushParams(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(filterRemote           ? { remote: filterRemote }    : {}),
      ...(filterType             ? { type: filterType }        : {}),
      ...(sortBy !== 'newest'    ? { sort: sortBy }            : {}),
      ...(forYou                 ? { forYou: '1' }             : {}),
      ...(search                 ? { search }                  : {}),
      ...overrides,
    });
    for (const [k, v] of [...p.entries()]) { if (!v) p.delete(k); }
    router.push(`/jobs${p.size ? `?${p}` : ''}`);
  }

  function setFilterRemote(v: string) { pushParams({ remote: v }); }
  function setFilterType(v: string)   { pushParams({ type: v }); }
  function setSortBy(v: string)       { pushParams({ sort: v === 'newest' ? '' : v }); }
  function setForYou(v: boolean)      { pushParams({ forYou: v ? '1' : '' }); }

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs', filterRemote, filterType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterRemote) params.set('remote', filterRemote);
      if (filterType)   params.set('employment_type', filterType);
      return api.get(`/jobs/?${params}`).then((r) => r.data);
    },
  });

  const { data: latestScore } = useQuery<number | null>({
    queryKey: ['latest-score'],
    enabled: isLoggedIn,
    queryFn: async () => {
      try {
        const { data } = await api.get('/analysis/sessions/');
        const done = data.find((s: { status: string }) => s.status === 'done');
        if (!done) return null;
        const { data: result } = await api.get(`/analysis/${done.id}/results/`);
        return result.overall_score ?? null;
      } catch { return null; }
    },
  });

  const searchLower   = search.toLowerCase();
  const searchedJobs  = search
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(searchLower) ||
        j.company.toLowerCase().includes(searchLower)
      )
    : jobs;

  const qualifyingJobs = searchedJobs.filter(
    (j) => !j.min_speechef_score ||
      (latestScore != null && latestScore >= j.min_speechef_score)
  );
  const filteredJobs  = forYou ? qualifyingJobs : searchedJobs;
  const displayedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'salary_desc') return (b.job_rate ?? 0) - (a.job_rate ?? 0);
    if (sortBy === 'score_asc')   return (a.min_speechef_score ?? 0) - (b.min_speechef_score ?? 0);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const canForYou = isLoggedIn && latestScore != null;

  return (
    <>
      {/* ── Hero ── */}
      <JobsHero
        onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
        totalJobs={jobs.length}
        qualifyingCount={qualifyingJobs.length}
        latestScore={latestScore}
        isLoggedIn={isLoggedIn}
        canForYou={canForYou}
      />

      {/* ── Content ── */}
      <div ref={contentRef} className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* For You tabs */}
          {canForYou && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setForYou(false)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
                style={!forYou
                  ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
              >
                All Jobs
              </button>
              <button
                onClick={() => setForYou(true)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5"
                style={forYou
                  ? { backgroundColor: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
              >
                ✓ For You
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  forYou ? 'bg-white/20' : 'bg-green-100 text-green-700'
                }`}>
                  {qualifyingJobs.length}
                </span>
              </button>
            </div>
          )}

          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); pushParams({ search }); }} className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => pushParams({ search })}
              placeholder="Search by title or company…"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-400 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); pushParams({ search: '' }); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filterRemote}
              onChange={(e) => setFilterRemote(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600"
            >
              <option value="">All Locations</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600"
            >
              <option value="">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600"
            >
              <option value="newest">Newest First</option>
              <option value="salary_desc">Highest Salary</option>
              <option value="score_asc">Score: Low to High</option>
            </select>
            <div className="ml-auto">
              <Link
                href="/jobs/post"
                className="text-sm font-medium px-4 py-2 rounded-lg border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: '#141c52', color: '#141c52' }}
              >
                + Post a Job
              </Link>
            </div>
          </div>

          {search && !isLoading && (
            <p className="text-sm text-gray-500 mb-2 text-center">
              {displayedJobs.length} result{displayedJobs.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
          )}

          {isLoading ? (
            <CarouselSkeleton />
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">💼</p>
              <p className="font-semibold">{forYou ? 'No qualifying jobs right now' : 'No jobs found'}</p>
              <p className="text-sm mt-1">
                {forYou
                  ? 'Improve your score or check All Jobs to see more opportunities.'
                  : 'Try changing your filters or check back later.'}
              </p>
              {forYou && (
                <button
                  onClick={() => setForYou(false)}
                  className="mt-3 text-sm font-semibold underline"
                  style={{ color: BRAND.primary }}
                >
                  View All Jobs
                </button>
              )}
            </div>
          ) : (
            <JobCarousel jobs={displayedJobs} userScore={latestScore ?? null} />
          )}

          {/* Employer CTA */}
          <div className="mt-10 text-center border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-sm mb-2">Looking to hire great communicators?</p>
            <Link
              href="/jobs/post"
              className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Post a Job Free →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsContent />
    </Suspense>
  );
}
