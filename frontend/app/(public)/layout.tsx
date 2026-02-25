import Link from 'next/link';

function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold" style={{ color: '#141c52' }}>
          Speechef
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/analyze" className="hover:text-[#141c52] text-gray-500 transition-colors">
            Analyze
          </Link>
          <Link href="/learn" className="hover:text-[#141c52] text-gray-500 transition-colors">
            Learn
          </Link>
          <Link href="/practice" className="hover:text-[#141c52] text-gray-500 transition-colors">
            Practice
          </Link>
          <Link href="/jobs" className="hover:text-[#141c52] text-gray-500 transition-colors">
            Jobs
          </Link>
          <Link href="/mentors" className="hover:text-[#141c52] text-gray-500 transition-colors">
            Mentors
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border-2 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter() {
  return (
    <footer style={{ backgroundColor: '#141c52' }} className="mt-20 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <span className="text-2xl font-extrabold text-white">Speechef</span>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              AI-powered speech coaching platform. Analyze, learn, practice, and get hired.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Product</span>
              <Link href="/analyze" className="text-gray-400 hover:text-white transition-colors">Analyze</Link>
              <Link href="/learn" className="text-gray-400 hover:text-white transition-colors">Learn</Link>
              <Link href="/practice" className="text-gray-400 hover:text-white transition-colors">Practice</Link>
              <Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Jobs</Link>
              <Link href="/mentors" className="text-gray-400 hover:text-white transition-colors">Mentors</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Company</span>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">For Companies</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Legal</span>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Speechef. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
