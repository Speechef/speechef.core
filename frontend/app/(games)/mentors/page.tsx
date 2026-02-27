'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Mentor {
  id: number;
  name: string;
  bio: string;
  specialties: string[];
  languages: string[];
  hourly_rate: number;
  rating_avg: number;
  review_count: number;
  is_active: boolean;
}

interface RecommendedMentor extends Mentor {
  match_reason: string | null;
}

const SPECIALTY_OPTIONS = ['IELTS', 'TOEFL', 'Business English', 'Public Speaking', 'Accent Reduction', 'Interview Prep'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Mandarin', 'Arabic', 'Spanish', 'French'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating?.toFixed(1) ?? '—'}</span>
    </div>
  );
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}>
          {mentor.name?.[0] ?? 'M'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base leading-tight" style={{ color: '#141c52' }}>{mentor.name}</h3>
          <StarRating rating={mentor.rating_avg} />
        </div>
        <p className="text-lg font-bold flex-shrink-0" style={{ color: '#141c52' }}>
          ${mentor.hourly_rate}<span className="text-xs font-normal text-gray-400">/hr</span>
        </p>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(mentor.specialties ?? []).map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">{s}</span>
        ))}
        {(mentor.languages ?? []).map((l) => (
          <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{l}</span>
        ))}
      </div>

      <div className="flex gap-2">
        <Link href={`/mentors/${mentor.id}`}
          className="flex-1 text-center text-sm font-medium py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          View Profile
        </Link>
        <Link href={`/mentors/${mentor.id}#book`}
          className="flex-1 text-center text-sm font-bold py-2 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
          Book Session →
        </Link>
      </div>
    </div>
  );
}

function RecommendedSection() {
  const { data: recommended = [], isLoading } = useQuery<RecommendedMentor[]>({
    queryKey: ['mentors-recommended'],
    queryFn: () => api.get('/mentors/recommended/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || recommended.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recommended.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-shadow relative overflow-hidden"
            style={{ borderColor: '#FADB43' }}>
            <div className="absolute top-0 right-0 px-2 py-1 text-xs font-bold rounded-bl-xl"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              ✦ Recommended
            </div>
            <div className="flex items-start gap-3 mb-3 mt-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}>
                {m.name?.[0] ?? 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm" style={{ color: '#141c52' }}>{m.name}</h3>
                <p className="text-xs text-gray-500">${m.hourly_rate}/hr</p>
              </div>
            </div>
            {m.match_reason && (
              <p className="text-xs text-indigo-600 font-medium mb-3">✓ {m.match_reason}</p>
            )}
            <div className="flex gap-2">
              <Link href={`/mentors/${m.id}`}
                className="flex-1 text-center text-xs font-medium py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                View Profile
              </Link>
              <Link href={`/mentors/${m.id}#book`}
                className="flex-1 text-center text-xs font-bold py-2 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                Book →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MentorsPage() {
  const { isLoggedIn } = useAuthStore();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const specialty = searchParams.get('specialty') ?? '';
  const language  = searchParams.get('language') ?? '';
  const sortBy    = (searchParams.get('sort') ?? 'rating') as 'rating' | 'price_asc' | 'price_desc';
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  function pushParams(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(specialty  ? { specialty }  : {}),
      ...(language   ? { language }   : {}),
      ...(sortBy !== 'rating' ? { sort: sortBy } : {}),
      ...(search     ? { search }     : {}),
      ...overrides,
    });
    // remove empty values
    for (const [k, v] of [...p.entries()]) { if (!v) p.delete(k); }
    router.push(`/mentors${p.size ? `?${p}` : ''}`);
  }

  function setSpecialty(v: string) { pushParams({ specialty: v }); }
  function setLanguage(v: string)  { pushParams({ language: v }); }
  function setSortBy(v: string)    { pushParams({ sort: v === 'rating' ? '' : v }); }
  function clearAll() {
    setSearch('');
    router.push('/mentors');
  }

  const { data: mentors = [], isLoading } = useQuery<Mentor[]>({
    queryKey: ['mentors', specialty, language],
    queryFn: () => {
      const params = new URLSearchParams();
      if (specialty) params.set('specialty', specialty);
      if (language) params.set('language', language);
      return api.get(`/mentors/?${params}`).then((r) => r.data);
    },
  });

  const searchLower = search.toLowerCase();
  const filteredMentors = search
    ? mentors.filter(
        (m) =>
          m.name.toLowerCase().includes(searchLower) ||
          m.bio.toLowerCase().includes(searchLower) ||
          (m.specialties ?? []).some((s) => s.toLowerCase().includes(searchLower))
      )
    : mentors;

  const sortedMentors = [...filteredMentors].sort((a, b) => {
    if (sortBy === 'price_asc') return a.hourly_rate - b.hourly_rate;
    if (sortBy === 'price_desc') return b.hourly_rate - a.hourly_rate;
    return (b.rating_avg ?? 0) - (a.rating_avg ?? 0);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#141c52' }}>Find a Mentor</h1>
          <p className="text-gray-500">Work 1-on-1 with certified speech coaches. Book in minutes, meet via video call.</p>
        </div>

        {/* Logged-in: My Sessions CTA */}
        {isLoggedIn && (
          <div className="mb-6 flex justify-end">
            <Link href="/mentors/sessions"
              className="text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors hover:bg-indigo-50"
              style={{ borderColor: '#141c52', color: '#141c52' }}>
              My Sessions →
            </Link>
          </div>
        )}

        {/* Personalised recommendations (only for logged-in users with no active filters) */}
        {isLoggedIn && !specialty && !language && !search && (
          <RecommendedSection />
        )}

        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); pushParams({ search }); }} className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => pushParams({ search })}
            placeholder="Search by name, specialty, or keyword…"
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

        {/* Filters + Sort */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600">
            <option value="">All Specialties</option>
            {SPECIALTY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600">
            <option value="">All Languages</option>
            {LANGUAGE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600">
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          {(specialty || language || search) && (
            <button onClick={clearAll}
              className="text-sm text-gray-400 hover:text-gray-600 px-2">
              Clear all ✕
            </button>
          )}
        </div>

        {/* Result count when searching */}
        {search && !isLoading && (
          <p className="text-sm text-gray-500 mb-3">
            {sortedMentors.length} mentor{sortedMentors.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sortedMentors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">👩‍🏫</p>
            <p className="font-semibold">No mentors found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sortedMentors.map((m) => <MentorCard key={m.id} mentor={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
