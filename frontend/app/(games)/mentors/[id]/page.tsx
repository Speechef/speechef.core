'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Availability { id: number; day_of_week: string; start_time: string; end_time: string; }
interface Bundle       { id: number; name: string; session_count: number; price: number | string; }
interface UserBundle   { id: number; sessions_remaining: number; expires_at: string; }

interface MentorDetail {
  id: number; name: string; bio: string; credentials: string;
  specialties: string[]; languages: string[];
  hourly_rate: number | string; rating_avg: number | string;
  review_count: number; session_count: number; member_since_days: number;
  availability: Availability[]; bundles: Bundle[];
  offers_intro_call: boolean; intro_available: boolean;
  intro_video_key: string | null;
  top_badge: { badge_type: string; name: string; emoji: string } | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const CARD_ACCENTS = [
  { from: '#141c52', to: '#1e2d78', light: '#dbeafe', ink: '#1e40af' },
  { from: '#3b0764', to: '#6b21a8', light: '#f3e8ff', ink: '#7c3aed' },
  { from: '#064e3b', to: '#065f46', light: '#d1fae5', ink: '#065f46' },
  { from: '#7c2d12', to: '#9a3412', light: '#ffedd5', ink: '#9a3412' },
  { from: '#1e3a5f', to: '#1e40af', light: '#dbeafe', ink: '#1d4ed8' },
];

const DAY_LABEL: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_JS: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const PROFILE_STYLES = `
  @keyframes pageReveal {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes statPop {
    from { opacity:0; transform:scale(0.8) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .page-reveal { animation:pageReveal .6s ease both; }
  .stat-pop    { animation:statPop .5s ease both; }
`;

// ─── Booking modal (preserved from original) ───────────────────────────────────

function BookingModal({
  mentor, onClose, isIntro = false, userBundle = null,
}: {
  mentor: MentorDetail; onClose: () => void;
  isIntro?: boolean; userBundle?: UserBundle | null;
}) {
  const { isLoggedIn } = useAuthStore();
  const [duration, setDuration]       = useState(isIntro ? 15 : 60);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [booked, setBooked]           = useState(false);
  const [useBundle, setUseBundle]     = useState(!!userBundle);

  const bookMutation = useMutation({
    mutationFn: () => {
      const now = new Date();
      const dayDiff = ((DAY_JS[selectedSlot!.day] - now.getDay()) + 7) % 7 || 7;
      const date = new Date(now);
      date.setDate(date.getDate() + dayDiff);
      const [h, m] = selectedSlot!.time.split(':');
      date.setHours(parseInt(h), parseInt(m), 0, 0);
      return api.post(`/mentors/${mentor.id}/book/`, {
        scheduled_at: date.toISOString(),
        duration_minutes: duration,
        ...(isIntro ? { is_intro: true } : {}),
        ...(useBundle && userBundle ? { bundle_id: userBundle.id } : {}),
      }).then((r) => r.data);
    },
    onSuccess: () => setBooked(true),
  });

  const rate  = Number(mentor.hourly_rate);
  const price = isIntro ? 0 : (duration === 60 ? rate : rate / 2);

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-xl font-extrabold mb-2" style={{ color: BRAND.primary }}>Sign in to book</p>
          <p className="text-gray-500 text-sm mb-6">Create a free account to book sessions with mentors.</p>
          <Link href="/register" className="block py-3 rounded-2xl text-sm font-bold"
            style={{ background: BRAND.gradient, color: BRAND.primary }}>
            Get Started Free →
          </Link>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg"
            style={{ background: BRAND.gradient }}>
            <svg className="w-8 h-8" style={{ color: BRAND.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-extrabold mb-2" style={{ color: BRAND.primary }}>
            {isIntro ? 'Intro Call Booked!' : 'Session Booked!'}
          </p>
          <p className="text-gray-500 text-sm mb-6">Check your email for the meeting link. You can also find it in My Sessions.</p>
          <Link href="/mentors/sessions" className="block py-3 rounded-2xl text-sm font-bold"
            style={{ background: BRAND.gradient, color: BRAND.primary }}>
            View My Sessions →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-lg" style={{ color: BRAND.primary }}>
            {isIntro ? 'Book Free Intro Call (15 min)' : 'Book a Session'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isIntro && (
          <>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Session Length</p>
            <div className="flex gap-2 mb-5">
              {[30, 60].map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all"
                  style={{
                    borderColor: duration === d ? BRAND.primary : '#e5e7eb',
                    backgroundColor: duration === d ? '#f0f2ff' : 'white',
                    color: BRAND.primary,
                  }}>
                  {d} min — ${d === 60 ? rate : rate / 2}
                </button>
              ))}
            </div>
          </>
        )}

        {isIntro && (
          <div className="bg-green-50 rounded-2xl p-4 mb-5 text-sm text-green-700 font-semibold">
            15-minute intro call · Free of charge 🎁
          </div>
        )}

        {!isIntro && userBundle && userBundle.sessions_remaining > 0 && (
          <div className="bg-indigo-50 rounded-2xl p-4 mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Use bundle credit</p>
              <p className="text-xs text-indigo-600">{userBundle.sessions_remaining} session{userBundle.sessions_remaining !== 1 ? 's' : ''} remaining</p>
            </div>
            <button
              onClick={() => setUseBundle((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${!useBundle ? 'bg-gray-200' : ''}`}
              style={useBundle ? { background: 'linear-gradient(to right,#141c52,#1e2d78)' } : {}}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useBundle ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        )}

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Slots</p>
        {mentor.availability.length === 0 ? (
          <p className="text-sm text-gray-400 mb-4">No availability set. Contact mentor directly.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-5 max-h-36 overflow-y-auto">
            {mentor.availability.map((slot) => (
              <button key={slot.id}
                onClick={() => setSelectedSlot({ day: slot.day_of_week, time: slot.start_time })}
                className="text-xs px-3.5 py-2 rounded-xl border-2 transition-all font-medium"
                style={{
                  borderColor: selectedSlot?.day === slot.day_of_week && selectedSlot?.time === slot.start_time ? BRAND.primary : '#e5e7eb',
                  backgroundColor: selectedSlot?.day === slot.day_of_week && selectedSlot?.time === slot.start_time ? '#f0f2ff' : 'white',
                  color: '#374151',
                }}>
                {DAY_LABEL[slot.day_of_week]} {slot.start_time}
              </button>
            ))}
          </div>
        )}

        {!isIntro && (
          <div className="rounded-2xl p-4 flex justify-between text-sm mb-5 bg-gray-50 border border-gray-100">
            <span className="text-gray-500 font-medium">Total</span>
            {useBundle && userBundle ? (
              <span className="font-bold text-green-600">
                <span className="line-through text-gray-400 mr-1">${price}</span> Free (bundle)
              </span>
            ) : (
              <span className="font-extrabold" style={{ color: BRAND.primary }}>${price}/session</span>
            )}
          </div>
        )}

        <button
          onClick={() => bookMutation.mutate()}
          disabled={!selectedSlot || bookMutation.isPending}
          className="w-full py-3.5 rounded-2xl text-sm font-extrabold disabled:opacity-40 transition-all hover:opacity-90 hover:scale-[1.01]"
          style={{ background: BRAND.gradient, color: BRAND.primary }}>
          {bookMutation.isPending
            ? 'Booking…'
            : isIntro
              ? 'Confirm Free Intro Call'
              : useBundle && userBundle
                ? 'Confirm — Bundle Credit'
                : `Confirm Booking — $${price}`}
        </button>
      </div>
    </div>
  );
}

// ─── Intro video button (preserved) ───────────────────────────────────────────

function IntroVideoButton({ mentorId }: { mentorId: number }) {
  const [loading, setLoading]       = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  async function handleWatch() {
    setLoading(true);
    try {
      const r = await api.get(`/mentors/${mentorId}/intro-video/`);
      window.open(r.data.url, '_blank');
    } catch { setUnavailable(true); }
    finally { setLoading(false); }
  }
  if (unavailable) return null;
  return (
    <button onClick={handleWatch} disabled={loading}
      className="mt-2 text-xs font-bold px-4 py-2 rounded-full border-2 transition-all hover:bg-indigo-50 disabled:opacity-40 block w-full"
      style={{ borderColor: '#4f46e5', color: '#4f46e5' }}>
      {loading ? 'Loading…' : '▶ Watch Intro Video'}
    </button>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, delay = 0 }: { icon: string; value: string | number; label: string; delay?: number }) {
  return (
    <div
      className="stat-pop flex flex-col items-center gap-1.5 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>{value}</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [showModal, setShowModal]       = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [buyingBundle, setBuyingBundle] = useState<number | null>(null);
  const [followed, setFollowed]         = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#book') setShowModal(true);
  }, []);

  const { data: mentor, isLoading } = useQuery<MentorDetail>({
    queryKey: ['mentor', id],
    queryFn: () => api.get(`/mentors/${id}/`).then((r) => r.data),
  });

  const { isLoggedIn } = useAuthStore();
  const { data: availabilityData } = useQuery<{ slots: unknown[]; user_bundle: UserBundle | null }>({
    queryKey: ['mentor-availability', id],
    enabled: isLoggedIn,
    queryFn: () => api.get(`/mentors/${id}/availability/`).then((r) => r.data),
  });
  const userBundle = availabilityData?.user_bundle ?? null;

  const bundleMutation = useMutation({
    mutationFn: (bundleId: number) => api.post(`/mentors/${id}/bundles/${bundleId}/purchase/`).then((r) => r.data),
    onSuccess: (data) => { if (data.checkout_url) window.location.href = data.checkout_url; },
    onSettled: () => setBuyingBundle(null),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6fb' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#e5e7eb', borderTopColor: '#FADB43' }} />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400" style={{ background: '#f4f6fb' }}>
        <p className="text-5xl">👤</p>
        <p className="font-semibold text-lg" style={{ color: BRAND.primary }}>Mentor not found</p>
        <Link href="/mentors" className="text-sm text-indigo-600 hover:underline">← Back to Mentors</Link>
      </div>
    );
  }

  const accent = CARD_ACCENTS[mentor.id % CARD_ACCENTS.length];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROFILE_STYLES }} />
      {showModal      && <BookingModal mentor={mentor} onClose={() => setShowModal(false)} userBundle={userBundle} />}
      {showIntroModal && <BookingModal mentor={mentor} onClose={() => setShowIntroModal(false)} isIntro />}

      <div className="min-h-screen" style={{ background: '#f4f6fb' }}>

        {/* Hero header band */}
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg,${accent.from} 0%,${accent.to} 100%)`, paddingBottom: '5rem' }}
        >
          {/* Decorative orbs */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%)' }} />
          <div className="absolute left-10 bottom-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%)' }} />

          {/* Fine grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

          {/* Nav row */}
          <div className="relative max-w-4xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
            <Link href="/mentors" className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Mentors
            </Link>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/mentors/${id}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
              className="text-xs font-bold px-3.5 py-2 rounded-full border transition-all"
              style={copied
                ? { background: 'rgba(74,222,128,0.2)', color: '#4ade80', borderColor: '#4ade80' }
                : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              {copied ? '✓ Copied!' : '🔗 Share'}
            </button>
          </div>

          {/* Profile header */}
          <div className="relative max-w-4xl mx-auto px-6 pb-2">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '2.5px solid rgba(255,255,255,0.25)' }}
                >
                  {mentor.name[0]}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                  style={{ background: '#22c55e' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-extrabold text-white leading-tight">{mentor.name}</h1>
                {mentor.top_badge && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full"
                    style={{ background: BRAND.gradient, color: BRAND.primary }}>
                    {mentor.top_badge.emoji} {mentor.top_badge.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill={i < Math.round(Number(mentor.rating_avg)) ? '#FADB43' : 'rgba(255,255,255,0.2)'} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-white font-bold ml-1">{Number(mentor.rating_avg).toFixed(1)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">({mentor.review_count} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(mentor.specialties ?? []).map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Price + actions */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2 sm:items-end">
                <div className="text-right">
                  <p className="text-4xl font-black text-white">${mentor.hourly_rate}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>per hour</p>
                </div>
                <button id="book" onClick={() => setShowModal(true)}
                  className="px-6 py-2.5 rounded-full text-sm font-extrabold transition-all hover:scale-105"
                  style={{ background: BRAND.gradient, color: BRAND.primary, boxShadow: '0 4px 20px rgba(250,219,67,.35)' }}>
                  Book Session →
                </button>
                <button
                  onClick={() => setFollowed((v) => !v)}
                  className="px-5 py-2 rounded-full text-sm font-bold border-2 transition-all hover:scale-105"
                  style={followed
                    ? { background: 'rgba(250,219,67,0.2)', color: '#FADB43', borderColor: '#FADB43' }
                    : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  {followed ? '❤️ Following' : '🤍 Follow'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content — overlaps hero by negative margin */}
        <div className="max-w-4xl mx-auto px-4 -mt-16 pb-16 page-reveal relative z-10">

          {/* 4-stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon="⭐" value={Number(mentor.rating_avg).toFixed(1)} label="Speechef Rating" delay={0} />
            <StatCard icon="🎓" value={mentor.session_count}                 label="Sessions Done"  delay={0.07} />
            <StatCard icon="💬" value={mentor.review_count}                  label="Reviews"        delay={0.14} />
            <StatCard icon="📅" value={`${mentor.member_since_days ?? 0}d`}  label="Days on Platform" delay={0.21} />
          </div>

          {/* About */}
          <div className="bg-white rounded-3xl border border-gray-100 p-7 mb-5 shadow-sm">
            <h2 className="font-extrabold text-lg mb-3" style={{ color: BRAND.primary }}>About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{mentor.bio || 'No bio provided.'}</p>
          </div>

          {/* Credentials */}
          {mentor.credentials && (
            <div className="bg-white rounded-3xl border border-gray-100 p-7 mb-5 shadow-sm">
              <h2 className="font-extrabold text-lg mb-3" style={{ color: BRAND.primary }}>Credentials</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{mentor.credentials}</p>
            </div>
          )}

          {/* Specialties + languages */}
          <div className="bg-white rounded-3xl border border-gray-100 p-7 mb-5 shadow-sm">
            <h2 className="font-extrabold text-lg mb-4" style={{ color: BRAND.primary }}>Skills &amp; Languages</h2>
            <div className="flex flex-wrap gap-2">
              {(mentor.specialties ?? []).map((s) => (
                <span key={s} className="text-sm font-semibold px-4 py-2 rounded-full"
                  style={{ background: accent.light, color: accent.ink }}>{s}</span>
              ))}
              {(mentor.languages ?? []).map((l) => (
                <span key={l} className="text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-600">{l}</span>
              ))}
            </div>
          </div>

          {/* Session packages */}
          {mentor.bundles && mentor.bundles.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-7 mb-5 shadow-sm">
              <h2 className="font-extrabold text-lg mb-1" style={{ color: BRAND.primary }}>Session Packages</h2>
              <p className="text-xs text-gray-400 mb-5">Buy a bundle and save — credits never expire.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mentor.bundles.map((bundle) => (
                  <div key={bundle.id}
                    className="relative overflow-hidden rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4"
                    style={{ background: `linear-gradient(135deg,${accent.from}08,${accent.to}12)` }}>
                    <div>
                      <p className="font-bold text-base" style={{ color: BRAND.primary }}>{bundle.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{bundle.session_count} sessions</p>
                      <p className="text-2xl font-extrabold mt-2" style={{ color: BRAND.primary }}>${bundle.price}</p>
                    </div>
                    <button
                      onClick={() => { setBuyingBundle(bundle.id); bundleMutation.mutate(bundle.id); }}
                      disabled={buyingBundle === bundle.id}
                      className="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50"
                      style={{ background: BRAND.gradient, color: BRAND.primary }}>
                      {buyingBundle === bundle.id ? 'Redirecting…' : 'Buy Package →'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability + booking */}
          <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
            <h2 className="font-extrabold text-lg mb-5" style={{ color: BRAND.primary }}>Availability</h2>
            {mentor.availability.length === 0 ? (
              <p className="text-gray-400 text-sm mb-5">No availability set. Contact mentor to arrange a custom time.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {mentor.availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">{DAY_LABEL[slot.day_of_week]}</span>
                    <span className="text-sm text-gray-400">{slot.start_time} – {slot.end_time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowModal(true)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-extrabold transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ background: BRAND.gradient, color: BRAND.primary, boxShadow: '0 4px 16px rgba(250,219,67,.3)' }}>
                Book a Session →
              </button>
              {mentor.offers_intro_call && mentor.intro_available && (
                <button onClick={() => setShowIntroModal(true)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all hover:bg-green-50"
                  style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                  🎁 Free Intro Call (15 min)
                </button>
              )}
            </div>
            {mentor.intro_video_key && <IntroVideoButton mentorId={mentor.id} />}
          </div>

        </div>
      </div>
    </>
  );
}
