import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div
          className="text-9xl font-black mb-2 leading-none"
          style={{
            background: 'linear-gradient(to right,#FADB43,#fe9940)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#141c52' }}>
          Page not found
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-medium border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <Link href="/practice" className="hover:text-gray-600 transition-colors">Practice</Link>
          <Link href="/analyze"  className="hover:text-gray-600 transition-colors">Analyze</Link>
          <Link href="/learn"    className="hover:text-gray-600 transition-colors">Learn</Link>
          <Link href="/jobs"     className="hover:text-gray-600 transition-colors">Jobs</Link>
          <Link href="/mentors"  className="hover:text-gray-600 transition-colors">Mentors</Link>
        </div>
      </div>
    </div>
  );
}
