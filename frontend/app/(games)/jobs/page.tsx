'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

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

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  freelance: 'Freelance',
};

function ScoreMatchBadge({ required, userScore }: { required: number | null; userScore: number | null }) {
  if (!required) return null;
  if (userScore === null) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-400">
        Score ≥ {required}
      </span>
    );
  }
  const qualifies = userScore >= required;
  return (
    <span
      className="text-xs px-2 py-1 rounded-full font-semibold"
      style={qualifies
        ? { backgroundColor: '#dcfce7', color: '#166534' }
        : { backgroundColor: '#fef3c7', color: '#92400e' }
      }
    >
      {qualifies ? `✅ You qualify (${userScore} ≥ ${required})` : `⚠️ ${required - userScore} pts away`}
    </span>
  );
}

function JobCard({ job, userScore }: { job: Job; userScore: number | null }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
          style={{ backgroundColor: '#141c52' }}
        >
          {job.company?.[0] ?? '?'}
        </div>
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {job.is_featured && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              Featured
            </span>
          )}
          <ScoreMatchBadge required={job.min_speechef_score} userScore={userScore} />
        </div>
      </div>
      <p className="font-bold text-sm mb-0.5" style={{ color: '#141c52' }}>{job.title}</p>
      <p className="text-gray-500 text-xs mb-2">{job.company}</p>
      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
        <span>{job.remote ? '🌍 Remote' : `📍 ${job.location}`}</span>
        {job.employment_type && <span>· {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}</span>}
        {job.job_rate && <span>· ${job.job_rate.toLocaleString()}/yr</span>}
      </div>
    </Link>
  );
}

export default function JobsPage() {
  const { isLoggedIn } = useAuthStore();
  const [filterRemote, setFilterRemote] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [search, setSearch] = useState('');
  const [forYou, setForYou] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'salary_desc' | 'score_asc'>('newest');

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs', filterRemote, filterType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterRemote) params.set('remote', filterRemote);
      if (filterType) params.set('employment_type', filterType);
      return api.get(`/jobs/?${params}`).then((r) => r.data);
    },
  });

  // Attempt to get user's latest analysis score
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
      } catch {
        return null;
      }
    },
  });

  // Keyword search filter (client-side)
  const searchLower = search.toLowerCase();
  const searchedJobs = search
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(searchLower) ||
        j.company.toLowerCase().includes(searchLower)
      )
    : jobs;

  // "For You" filtering: jobs with no score req or user qualifies
  const qualifyingJobs = searchedJobs.filter(
    (j) => !j.min_speechef_score || (latestScore !== null && latestScore !== undefined && latestScore >= j.min_speechef_score)
  );
  const filteredJobs = forYou ? qualifyingJobs : searchedJobs;
  const displayedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'salary_desc') return (b.job_rate ?? 0) - (a.job_rate ?? 0);
    if (sortBy === 'score_asc')   return (a.min_speechef_score ?? 0) - (b.min_speechef_score ?? 0);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const canForYou = isLoggedIn && latestScore !== null && latestScore !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#141c52' }}>Jobs Board</h1>
          <p className="text-gray-500">Companies that value communication skills. Apply with your Speechef score.</p>
        </div>

        {/* Score banner */}
        {isLoggedIn && latestScore !== null && latestScore !== undefined && (
          <div
            className="rounded-xl p-4 mb-6 flex items-center justify-between"
            style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}
          >
            <div>
              <p className="text-sm font-semibold">Your Communication Score</p>
              <p className="text-3xl font-extrabold">{latestScore}<span className="text-lg font-normal text-white/60"> / 100</span></p>
            </div>
            <Link
              href="/analyze"
              className="text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              Analyze Again →
            </Link>
          </div>
        )}

        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 flex items-center justify-between">
            <span>Log in to see your score match for each job.</span>
            <Link href="/login" className="font-semibold underline">Log in →</Link>
          </div>
        )}

        {/* For You tab */}
        {canForYou && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setForYou(false)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={!forYou ? { backgroundColor: '#141c52', color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#374151' }}
            >
              All Jobs
            </button>
            <button
              onClick={() => setForYou(true)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5"
              style={forYou ? { backgroundColor: '#141c52', color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#374151' }}
            >
              ✓ For You
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${forYou ? 'bg-white/20' : 'bg-green-100 text-green-700'}`}>
                {qualifyingJobs.length}
              </span>
            </button>
          </div>
        )}

        {/* Keyword search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or company…"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

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
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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

        {/* Result count when searching */}
        {search && !isLoading && (
          <p className="text-sm text-gray-500 mb-3">
            {displayedJobs.length} result{displayedJobs.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Job list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
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
              <button onClick={() => setForYou(false)}
                className="mt-3 text-sm font-semibold underline"
                style={{ color: '#141c52' }}>
                View All Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedJobs.map((job) => (
              <JobCard key={job.id} job={job} userScore={latestScore ?? null} />
            ))}
          </div>
        )}

        {/* Employer CTA */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <p className="text-gray-500 text-sm mb-2">Looking to hire great communicators?</p>
          <Link
            href="/jobs/post"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Post a Job Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
