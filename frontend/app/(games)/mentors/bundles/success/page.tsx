'use client';

import { useEffect, Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

function BundleSuccessContent() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const params = useSearchParams();
  const bundleId = params.get('bundle_id');
  const mentorId = params.get('mentor_id');

  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: () =>
      api.post('/mentors/bundles/confirm/', { bundle_id: bundleId, mentor_id: mentorId }).then((r) => r.data),
  });

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return; }
    if (bundleId && mentorId) mutate();
  }, [isLoggedIn, bundleId, mentorId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
        {isPending && (
          <>
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Confirming your purchase…</p>
          </>
        )}

        {isError && (
          <>
            <p className="text-4xl mb-3">❌</p>
            <h1 className="text-xl font-bold mb-2" style={{ color: '#141c52' }}>Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">Your purchase could not be confirmed. Please contact support.</p>
            <Link href="/mentors" className="text-sm font-bold px-6 py-2.5 rounded-full"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Back to Mentors
            </Link>
          </>
        )}

        {data && (
          <>
            <p className="text-5xl mb-4">🎉</p>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>Bundle Purchased!</h1>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-semibold">{data.bundle_name}</span> with{' '}
              <span className="font-semibold">{data.mentor_name}</span>
            </p>
            <p className="text-lg font-bold mt-3 mb-6" style={{ color: '#141c52' }}>
              {data.sessions_remaining} sessions remaining
            </p>
            <Link href={`/mentors/${mentorId}`}
              className="inline-block text-sm font-bold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
              Book Your First Session →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function BundleSuccessPage() {
  return (
    <Suspense>
      <BundleSuccessContent />
    </Suspense>
  );
}
