'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Availability {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Bundle {
  id: number;
  name: string;
  session_count: number;
  price: number | string;
}

interface UserBundle {
  id: number;
  sessions_remaining: number;
  expires_at: string;
}

interface MentorDetail {
  id: number;
  name: string;
  bio: string;
  credentials: string;
  specialties: string[];
  languages: string[];
  hourly_rate: number | string;
  rating_avg: number | string;
  review_count: number;
  availability: Availability[];
  bundles: Bundle[];
  offers_intro_call: boolean;
  intro_available: boolean;
  intro_video_key: string | null;
  top_badge: { badge_type: string; name: string; emoji: string } | null;
}

const DAY_LABEL: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
// Maps backend day code → JavaScript Date.getDay() value (0=Sunday … 6=Saturday)
const DAY_JS: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

function StarRating({ rating, count }: { rating: number | string; count?: number }) {
  const r = Number(rating);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < Math.round(r) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-500 ml-1">{isNaN(r) ? '—' : r.toFixed(1)}{count ? ` (${count})` : ''}</span>
    </div>
  );
}

// ─── Intro Video Button (MM14.1) ─────────────────────────────────────────────
function IntroVideoButton({ mentorId }: { mentorId: number }) {
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  async function handleWatch() {
    setLoading(true);
    try {
      const r = await api.get(`/mentors/${mentorId}/intro-video/`);
      window.open(r.data.url, '_blank');
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) return null;

  return (
    <button
      onClick={handleWatch}
      disabled={loading}
      className="mt-2 text-xs font-semibold px-4 py-2 rounded-full border transition-colors hover:bg-indigo-50 disabled:opacity-40 block w-full"
      style={{ borderColor: '#4f46e5', color: '#4f46e5' }}
    >
      {loading ? 'Loading…' : '▶ Watch Intro Video'}
    </button>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({
  mentor, onClose, isIntro = false, userBundle = null,
}: {
  mentor: MentorDetail;
  onClose: () => void;
  isIntro?: boolean;
  userBundle?: UserBundle | null;
}) {
  const { isLoggedIn } = useAuthStore();
  const [duration, setDuration] = useState(isIntro ? 15 : 60);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [booked, setBooked] = useState(false);
  const [useBundle, setUseBundle] = useState(!!userBundle);

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

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-lg font-bold mb-2" style={{ color: '#141c52' }}>Sign in to book</p>
          <p className="text-gray-500 text-sm mb-5">Create a free account to book sessions with mentors.</p>
          <Link href="/register" className="block py-3 rounded-xl text-sm font-bold text-center"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            Get Started Free →
          </Link>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
            <svg className="w-7 h-7" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: '#141c52' }}>
            {isIntro ? 'Intro Call Booked!' : 'Session Booked!'}
          </p>
          <p className="text-gray-500 text-sm mb-5">Check your email for the meeting link. You can also find it in My Sessions.</p>
          <Link href="/mentors/sessions"
            className="block py-3 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            View My Sessions →
          </Link>
        </div>
      </div>
    );
  }

  const rate  = Number(mentor.hourly_rate);
  const price = isIntro ? 0 : (duration === 60 ? rate : rate / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg" style={{ color: '#141c52' }}>
            {isIntro ? 'Book Free Intro Call (15 min)' : 'Book a Session'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Duration — hide for intro */}
        {!isIntro && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Session Length</p>
            <div className="flex gap-2 mb-5">
              {[30, 60].map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={{
                    borderColor: duration === d ? '#141c52' : '#e5e7eb',
                    backgroundColor: duration === d ? '#f0f2ff' : 'white',
                    color: '#141c52',
                  }}>
                  {d} min — ${d === 60 ? rate : rate / 2}
                </button>
              ))}
            </div>
          </>
        )}

        {isIntro && (
          <div className="bg-green-50 rounded-xl p-3 mb-5 text-sm text-green-700 font-medium">
            15-minute intro call · Free of charge
          </div>
        )}

        {/* Bundle toggle (MM4.2) */}
        {!isIntro && userBundle && userBundle.sessions_remaining > 0 && (
          <div className="bg-indigo-50 rounded-xl p-3 mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#141c52' }}>Use bundle credit</p>
              <p className="text-xs text-indigo-600">
                {userBundle.sessions_remaining} session{userBundle.sessions_remaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
            <button
              onClick={() => setUseBundle((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${useBundle ? '' : 'bg-gray-200'}`}
              style={useBundle ? { background: 'linear-gradient(to right,#141c52,#1e2d78)' } : {}}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useBundle ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
        )}

        {/* Available slots */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Available Slots</p>
        {mentor.availability.length === 0 ? (
          <p className="text-sm text-gray-400 mb-4">No availability set. Contact mentor directly.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-5 max-h-36 overflow-y-auto">
            {mentor.availability.map((slot) => (
              <button key={slot.id}
                onClick={() => setSelectedSlot({ day: slot.day_of_week, time: slot.start_time })}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{
                  borderColor: selectedSlot?.day === slot.day_of_week && selectedSlot?.time === slot.start_time ? '#141c52' : '#e5e7eb',
                  backgroundColor: selectedSlot?.day === slot.day_of_week && selectedSlot?.time === slot.start_time ? '#f0f2ff' : 'white',
                  color: '#374151',
                }}>
                {DAY_LABEL[slot.day_of_week]} {slot.start_time}
              </button>
            ))}
          </div>
        )}

        {/* Price summary */}
        {!isIntro && (
          <>
            <div className="bg-gray-50 rounded-xl p-3 flex justify-between text-sm mb-5">
              <span className="text-gray-500">Total</span>
              {useBundle && userBundle ? (
                <span className="font-bold text-green-600">
                  <span className="line-through text-gray-400 mr-1">${price}</span> Free (bundle credit)
                </span>
              ) : (
                <span className="font-bold" style={{ color: '#141c52' }}>${price}/session</span>
              )}
            </div>
            {(!useBundle || !userBundle) && (
              <p className="text-xs text-gray-400 mb-4">💳 Payment via Stripe (integration coming soon — no charge yet)</p>
            )}
          </>
        )}

        <button
          onClick={() => bookMutation.mutate()}
          disabled={!selectedSlot || bookMutation.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
          {bookMutation.isPending
            ? 'Booking…'
            : isIntro
              ? 'Confirm Free Intro Call'
              : useBundle && userBundle
                ? 'Confirm Booking — Bundle Credit'
                : `Confirm Booking — $${price}`}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [buyingBundle, setBuyingBundle] = useState<number | null>(null);

  function copyMentorLink() {
    navigator.clipboard.writeText(`${window.location.origin}/mentors/${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#book') {
      setShowModal(true);
    }
  }, []);

  const { data: mentor, isLoading } = useQuery<MentorDetail>({
    queryKey: ['mentor', id],
    queryFn: () => api.get(`/mentors/${id}/`).then((r) => r.data),
  });

  const { isLoggedIn: loggedIn } = useAuthStore();
  const { data: availabilityData } = useQuery<{ slots: unknown[]; user_bundle: UserBundle | null }>({
    queryKey: ['mentor-availability', id],
    enabled: loggedIn,
    queryFn: () => api.get(`/mentors/${id}/availability/`).then((r) => r.data),
  });
  const userBundle = availabilityData?.user_bundle ?? null;

  const bundleMutation = useMutation({
    mutationFn: (bundleId: number) =>
      api.post(`/mentors/${id}/bundles/${bundleId}/purchase/`).then((r) => r.data),
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onSettled: () => setBuyingBundle(null),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-2">👤</p>
          <p>Mentor not found.</p>
          <Link href="/mentors" className="text-indigo-600 text-sm mt-2 block hover:underline">← Back to Mentors</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && <BookingModal mentor={mentor} onClose={() => setShowModal(false)} userBundle={userBundle} />}
      {showIntroModal && <BookingModal mentor={mentor} onClose={() => setShowIntroModal(false)} isIntro />}

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/mentors" className="text-sm text-gray-400 hover:text-gray-600">← All Mentors</Link>
            <button
              onClick={copyMentorLink}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={copied
                ? { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }
                : { backgroundColor: 'white', color: '#141c52', borderColor: '#e5e7eb' }}
            >
              {copied ? '✓ Copied!' : '🔗 Share Profile'}
            </button>
          </div>

          {/* Profile header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-7 mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-3xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}>
                {mentor.name?.[0] ?? 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-1" style={{ color: '#141c52' }}>{mentor.name}</h1>
                <StarRating rating={mentor.rating_avg} count={mentor.review_count} />
                {mentor.top_badge && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold"
                      style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                    >
                      {mentor.top_badge.emoji} {mentor.top_badge.name}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {(mentor.specialties ?? []).map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">{s}</span>
                  ))}
                  {(mentor.languages ?? []).map((l) => (
                    <span key={l} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">{l}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-black" style={{ color: '#141c52' }}>${mentor.hourly_rate}</p>
                <p className="text-xs text-gray-400">per hour</p>
                <button
                  id="book"
                  onClick={() => setShowModal(true)}
                  className="mt-3 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                  Book Session →
                </button>
                {mentor.offers_intro_call && mentor.intro_available && (
                  <button
                    onClick={() => setShowIntroModal(true)}
                    className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-green-50 block w-full"
                    style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                    Free Intro (15 min)
                  </button>
                )}
                {mentor.intro_video_key && <IntroVideoButton mentorId={mentor.id} />}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold mb-3" style={{ color: '#141c52' }}>About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{mentor.bio || 'No bio provided.'}</p>
          </div>

          {/* Credentials (MM16.1) */}
          {mentor.credentials && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold mb-3" style={{ color: '#141c52' }}>Credentials</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{mentor.credentials}</p>
            </div>
          )}

          {/* Session Bundles */}
          {mentor.bundles && mentor.bundles.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold mb-1" style={{ color: '#141c52' }}>Session Packages</h2>
              <p className="text-xs text-gray-400 mb-4">Buy a bundle and save — credits never expire.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mentor.bundles.map((bundle) => (
                  <div key={bundle.id} className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#141c52' }}>{bundle.name}</p>
                      <p className="text-xs text-gray-400">{bundle.session_count} sessions</p>
                      <p className="text-lg font-black mt-1" style={{ color: '#141c52' }}>${bundle.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        setBuyingBundle(bundle.id);
                        bundleMutation.mutate(bundle.id);
                      }}
                      disabled={buyingBundle === bundle.id}
                      className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                      {buyingBundle === bundle.id ? 'Redirecting…' : 'Buy Package →'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4" style={{ color: '#141c52' }}>Availability</h2>
            {mentor.availability.length === 0 ? (
              <p className="text-gray-400 text-sm">No availability set. Contact to arrange a custom time.</p>
            ) : (
              <div className="space-y-2">
                {mentor.availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-gray-700">{DAY_LABEL[slot.day_of_week]}</span>
                    <span className="text-sm text-gray-500">{slot.start_time} – {slot.end_time}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowModal(true)}
              className="mt-5 w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Book a Session →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
