'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
          <svg className="w-10 h-10" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>
          Something went wrong
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          An unexpected error occurred. Please try again — if the issue persists, contact support.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-full text-sm font-medium border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            Go to Dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-300 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
